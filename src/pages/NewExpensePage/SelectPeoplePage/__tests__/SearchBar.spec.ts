import { mount } from "@vue/test-utils";
import type * as VueUse from "@vueuse/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

import { fitCount } from "../fit-count";
import SearchBar from "../SearchBar.vue";
import UserTag from "../UserTag.vue";

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: Record<string, unknown>) => (args ? `${key} ${Object.values(args).join(",")}` : key),
  }),
}));

// jsdom has no layout. The row is 343px wide, as on a 375px phone, and each measured item is 40px wide.
vi.mock("@vueuse/core", async (original) => ({
  ...(await original<typeof VueUse>()),
  useElementSize: () => ({ height: ref(26), width: ref(343) }),
}));

const USERS = ["Alex", "Mei", "Sam", "Jordan", "Priya", "Noah"].map((userName) => ({
  id: `id-${userName}`,
  photo: null,
  userName,
}));

/** Mounts the row and waits for the first measure. */
async function mountRow(count: number) {
  const wrapper = mount(SearchBar, { props: { selectedUsers: USERS.slice(0, count) } });
  await nextTick();
  await nextTick();
  return wrapper;
}

/** Returns the names on the tags that a person sees. The hidden copy has its own tags. */
function shownTags(wrapper: Awaited<ReturnType<typeof mountRow>>) {
  return wrapper.findAll("[data-row-tag] button").map((tag) => tag.attributes("aria-label"));
}

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ height: 26, width: 40 } as DOMRect);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fitCount", () => {
  const ROW = { chipWidth: 30, gap: 8, inputWidth: 80 };

  it("shows all tags and no button when they fit next to the field", () => {
    expect(fitCount({ ...ROW, available: 300, tagWidths: [60, 60, 60] })).toBe(3);
  });

  it("uses the exact width as a fit", () => {
    expect(fitCount({ ...ROW, available: 60 + 8 + 80, tagWidths: [60] })).toBe(1);
  });

  it("keeps the space of the button when some tags stay out", () => {
    // Two tags fit with the field only when the row has no button: 2 * 68 + 80 = 216, and the button needs 38 more.
    expect(fitCount({ ...ROW, available: 220, tagWidths: [60, 60, 60] })).toBe(1);
  });

  it("shows only the button when no tag fits", () => {
    expect(fitCount({ ...ROW, available: 140, tagWidths: [120, 120] })).toBe(0);
  });

  it("does not show a person with no width yet", () => {
    expect(fitCount({ ...ROW, available: 300, tagWidths: [60, Infinity] })).toBe(1);
  });

  it("shows no tags and no error when nobody is selected", () => {
    expect(fitCount({ ...ROW, available: 300, tagWidths: [] })).toBe(0);
  });
});

describe("SearchBar", () => {
  it("shows all tags and no button when they fit", async () => {
    const wrapper = await mountRow(3);

    expect(shownTags(wrapper)).toHaveLength(3);
    expect(wrapper.find("[data-row-fade] button").exists()).toBe(false);
  });

  it("folds the tags that do not fit into a button that says how many", async () => {
    const wrapper = await mountRow(6);
    const button = wrapper.get("[data-row-fade] button");

    // 343 - 40 - 8 leaves 295px. Three tags take 144px, the button takes 48px and the field keeps 80px.
    expect(shownTags(wrapper)).toHaveLength(3);
    expect(button.text()).toBe("+3");
    expect(button.attributes("aria-label")).toBe("new-expense-select-people-show-more 3");
    expect(button.attributes("aria-expanded")).toBe("false");
  });

  it("opens to all tags, and closes again from the same button", async () => {
    const wrapper = await mountRow(6);

    await wrapper.get("[data-row-fade] button").trigger("click");
    const open = wrapper.get("[data-row-fade] button");

    expect(shownTags(wrapper)).toHaveLength(6);
    expect(open.attributes("aria-expanded")).toBe("true");
    expect(open.attributes("aria-label")).toBe("new-expense-select-people-show-fewer");
    expect(open.text()).toBe("");

    await open.trigger("click");

    expect(shownTags(wrapper)).toHaveLength(3);
  });

  it("closes the open row when everyone fits in one line", async () => {
    const wrapper = await mountRow(6);
    await wrapper.get("[data-row-fade] button").trigger("click");

    await wrapper.setProps({ selectedUsers: USERS.slice(0, 2) });
    await nextTick();
    await nextTick();

    expect(wrapper.find("[data-row-fade] button").exists()).toBe(false);
  });

  it("emits the ID of the person on the tag", async () => {
    const wrapper = await mountRow(2);

    await wrapper.findAll("[data-row-tag] button")[1].trigger("click");

    expect(wrapper.emitted("remove")).toEqual([["id-Mei"]]);
  });

  it("moves the focus after a keyboard removes a tag, and leaves it after a tap", async () => {
    const wrapper = await mountRow(2);
    const focus = vi.spyOn(HTMLElement.prototype, "focus");

    // A tap has `detail` 1.
    wrapper.findAll("[data-row-tag] button")[0].element.dispatchEvent(new MouseEvent("click", { detail: 1 }));
    await nextTick();
    expect(focus).not.toHaveBeenCalled();

    // A key press on a button makes a click with `detail` 0.
    wrapper.findAll("[data-row-tag] button")[0].element.dispatchEvent(new MouseEvent("click", { detail: 0 }));
    await nextTick();
    await nextTick();
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("does not put the hidden copy in the tab order", async () => {
    const wrapper = await mountRow(6);

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

  it("cuts a long name and keeps a tap area of 44px", () => {
    const wrapper = mount(UserTag, { props: { name: "Alexandria Montgomery-Whitfield", photo: null } });

    expect(wrapper.get("span.truncate").classes()).toContain("max-w-28");
    expect(wrapper.get("button").classes()).toContain("after:h-11");
  });

  it("uses the token of the tag for the border", () => {
    const classes = mount(UserTag, { props: { name: "Mei", photo: null } })
      .get("button")
      .classes();

    expect(classes).toContain("border-comp-user-tag-border");
    expect(classes).not.toContain("border-base-border-brand-subtle");
  });
});
