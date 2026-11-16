import { mount } from "@vue/test-utils";
import type * as VueUse from "@vueuse/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, type MaybeRefOrGetter, nextTick, ref, toValue } from "vue";

import SearchBar from "../SearchBar.vue";
import { countFittingTags } from "../use-tag-overflow";
import UserTag from "../UserTag.vue";

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: Record<string, unknown>) => (args ? `${key} ${Object.values(args).join(",")}` : key),
  }),
}));

// jsdom has no layout engine. Mock a 343px row (375px phone minus page padding) and 40px measured items.
// The "With" label is the only observed element that holds the label text, so its text tells it apart from the row.
vi.mock("@vueuse/core", async (original) => ({
  ...(await original<typeof VueUse>()),
  useElementSize: (target: MaybeRefOrGetter<HTMLElement | null>) => ({
    height: ref(26),
    width: computed(() => (toValue(target)?.textContent?.trim() === "new-expense-select-people-with" ? 40 : 343)),
  }),
}));

const USERS = ["Alex", "Mei", "Sam", "Jordan", "Priya", "Noah"].map((userName) => ({
  id: `id-${userName}`,
  photo: null,
  userName,
}));

/** Mounts SearchBar and waits for initial width measurement to settle. */
async function mountSearchBar(count: number) {
  const wrapper = mount(SearchBar, { props: { selectedUsers: USERS.slice(0, count) } });
  await nextTick();
  await nextTick();
  return wrapper;
}

/** Returns aria-labels of visible user tags (excluding the offscreen measurement row). */
function getVisibleTagLabels(wrapper: Awaited<ReturnType<typeof mountSearchBar>>) {
  return wrapper.findAll("[data-user-tag] button").map((tag) => tag.attributes("aria-label"));
}

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ height: 26, width: 40 } as DOMRect);
  // jsdom has no Web Animations API. The row fades the `+N` button and the search input when it expands or collapses.
  Element.prototype.animate = vi.fn();
  Element.prototype.getAnimations = () => [];
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(Element.prototype, "animate");
  Reflect.deleteProperty(Element.prototype, "getAnimations");
});

describe("countFittingTags", () => {
  const BASE_OPTIONS = { gap: 8, minInputWidth: 80, overflowButtonWidth: 30 };

  it("shows all tags and no button when they fit next to the search input", () => {
    expect(countFittingTags({ ...BASE_OPTIONS, availableWidth: 300, tagWidths: [60, 60, 60] })).toBe(3);
  });

  it("treats an exact width match as fitting", () => {
    expect(countFittingTags({ ...BASE_OPTIONS, availableWidth: 60 + 8 + 80, tagWidths: [60] })).toBe(1);
  });

  it("reserves space for the overflow button when not all tags fit", () => {
    // Two tags fit with the input only without the button: 2 * 68 + 80 = 216, while the `+N` button needs 38px more.
    expect(countFittingTags({ ...BASE_OPTIONS, availableWidth: 220, tagWidths: [60, 60, 60] })).toBe(1);
  });

  it("shows only the overflow button when no tag fits", () => {
    expect(countFittingTags({ ...BASE_OPTIONS, availableWidth: 140, tagWidths: [120, 120] })).toBe(0);
  });

  it("hides an unmeasured tag whose width is Infinity", () => {
    expect(countFittingTags({ ...BASE_OPTIONS, availableWidth: 300, tagWidths: [60, Infinity] })).toBe(1);
  });

  it("returns 0 when no users are selected", () => {
    expect(countFittingTags({ ...BASE_OPTIONS, availableWidth: 300, tagWidths: [] })).toBe(0);
  });
});

describe("SearchBar", () => {
  it("shows all tags and no overflow button when they fit", async () => {
    const wrapper = await mountSearchBar(3);

    expect(getVisibleTagLabels(wrapper)).toHaveLength(3);
    expect(wrapper.find("[data-fade-on-toggle] button").exists()).toBe(false);
  });

  it("collapses overflowing tags into a +N button", async () => {
    const wrapper = await mountSearchBar(6);
    const button = wrapper.get("[data-fade-on-toggle] button");

    // 343 - 40 - 8 leaves 295px: 3 tags take 144px, the `+3` button takes 48px, and the search input reserves 80px.
    expect(getVisibleTagLabels(wrapper)).toHaveLength(3);
    expect(button.text()).toBe("+3");
    expect(button.attributes("aria-label")).toBe("new-expense-select-people-show-more 3");
    expect(button.attributes("aria-expanded")).toBe("false");
  });

  it("expands to show all tags and collapses again from the toggle button", async () => {
    const wrapper = await mountSearchBar(6);

    await wrapper.get("[data-fade-on-toggle] button").trigger("click");
    const collapseButton = wrapper.get("[data-fade-on-toggle] button");

    expect(getVisibleTagLabels(wrapper)).toHaveLength(6);
    expect(collapseButton.attributes("aria-expanded")).toBe("true");
    expect(collapseButton.attributes("aria-label")).toBe("new-expense-select-people-show-fewer");
    expect(collapseButton.text()).toBe("");

    await collapseButton.trigger("click");

    expect(getVisibleTagLabels(wrapper)).toHaveLength(3);
  });

  it("auto-collapses when all remaining tags fit on one line", async () => {
    const wrapper = await mountSearchBar(6);
    await wrapper.get("[data-fade-on-toggle] button").trigger("click");

    await wrapper.setProps({ selectedUsers: USERS.slice(0, 2) });
    await nextTick();
    await nextTick();

    expect(wrapper.find("[data-fade-on-toggle] button").exists()).toBe(false);
  });

  it("emits the removed user ID when a tag is clicked", async () => {
    const wrapper = await mountSearchBar(2);

    await wrapper.findAll("[data-user-tag] button")[1].trigger("click");

    expect(wrapper.emitted("remove")).toEqual([["id-Mei"]]);
  });

  it("keeps the offscreen measurement row inert and hidden from assistive tech", async () => {
    const wrapper = await mountSearchBar(6);

    expect(wrapper.get("[inert]").attributes("aria-hidden")).toBe("true");
    expect(wrapper.get("[inert]").findAll("button")).toHaveLength(6);
  });
});

describe("UserTag", () => {
  it("is a button with the name of the person and of the action", () => {
    const button = mount(UserTag, { props: { name: "Mei", photo: null } }).get("button");

    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("aria-label")).toBe("new-expense-select-people-remove Mei");
  });
});
