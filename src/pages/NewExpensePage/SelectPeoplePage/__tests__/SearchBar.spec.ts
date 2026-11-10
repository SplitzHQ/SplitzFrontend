import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import SearchBar from "../SearchBar.vue";
import UserTag from "../UserTag.vue";

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: Record<string, unknown>) => (args ? `${key} ${Object.values(args).join(",")}` : key),
  }),
}));

const USERS = ["Alex", "Mei", "Sam", "Jordan", "Priya", "Noah"].map((userName) => ({
  id: `id-${userName}`,
  photo: null,
  userName,
}));

/** Mounts the row and waits until it is ready. */
async function mountRow(count: number) {
  const wrapper = mount(SearchBar, { props: { selectedUsers: USERS.slice(0, count) } });
  await nextTick();
  await nextTick();
  return wrapper;
}

/** Returns the names on the tags. */
function shownTags(wrapper: Awaited<ReturnType<typeof mountRow>>) {
  return wrapper.findAll("[data-row-tag] button").map((tag) => tag.attributes("aria-label"));
}

// jsdom has no layout, so each box has the same size.
beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ height: 26, width: 40 } as DOMRect);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SearchBar", () => {
  it("shows a tag for each person on the first line", async () => {
    const wrapper = await mountRow(6);

    expect(shownTags(wrapper)).toHaveLength(6);
    expect(wrapper.text()).toContain("new-expense-select-people-with");
  });

  it("does not show the first line when nobody is selected", async () => {
    const wrapper = await mountRow(0);

    expect(wrapper.find("[data-row-tag]").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("new-expense-select-people-with");
    expect(wrapper.find("input").exists()).toBe(true);
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

  it("gives the focus to the field after a tap on the frame, and keeps it after a press", async () => {
    const wrapper = await mountRow(1);
    const focus = vi.spyOn(HTMLInputElement.prototype, "focus");

    const frame = wrapper.get("input").element.closest(".cursor-text") as HTMLElement;

    const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    frame.dispatchEvent(press);
    expect(press.defaultPrevented).toBe(true);

    frame.click();
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("keeps the full text for a screen reader and shows the short placeholder", async () => {
    const input = (await mountRow(0)).get("input");

    expect(input.attributes("aria-label")).toBe("new-expense-select-people-search-label");
    expect(input.attributes("placeholder")).toBe("new-expense-select-people-search-placeholder");
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
