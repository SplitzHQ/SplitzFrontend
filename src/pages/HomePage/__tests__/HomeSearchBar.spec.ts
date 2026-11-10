import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import HomeSearchBar from "../HomeSearchBar.vue";

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string) => key,
  }),
}));

const CLEAR_BUTTON = '[data-testid="home-search-clear"]';

describe("HomeSearchBar", () => {
  it("renders a search input with the localized placeholder", () => {
    const wrapper = mount(HomeSearchBar);
    const input = wrapper.get("input");

    expect(input.attributes("type")).toBe("search");
    expect(input.attributes("placeholder")).toBe("home-search-placeholder");
  });

  it("has 16px text, so iOS does not zoom the page", () => {
    const classes = mount(HomeSearchBar).get("input").classes();

    expect(classes).toContain("text-base");
    expect(classes.join(" ")).not.toContain("text-sm");
  });

  it("has a muted border at rest and a brand border with the focus", () => {
    const classes = mount(HomeSearchBar).get("label").classes();

    expect(classes).toContain("border-base-border-muted");
    expect(classes).toContain("focus-within:border-base-border-brand");
  });

  it("uses a custom placeholder when one is given", () => {
    const wrapper = mount(HomeSearchBar, { props: { placeholder: "Find a group" } });

    expect(wrapper.get("input").attributes("placeholder")).toBe("Find a group");
  });

  it("shows the action outside the label", () => {
    const wrapper = mount(HomeSearchBar, { slots: { action: '<button type="button">Filter</button>' } });

    expect(wrapper.get("button").text()).toBe("Filter");
    expect(wrapper.find("label button").exists()).toBe(false);
  });

  it("updates the model when the user types", async () => {
    const wrapper = mount(HomeSearchBar, { props: { modelValue: "" } });

    await wrapper.get("input").setValue("paris");

    const updates = wrapper.emitted<[string]>("update:modelValue") ?? [];

    expect(updates[updates.length - 1]).toEqual(["paris"]);
  });

  it("shows the clear button only while the field has text", async () => {
    const wrapper = mount(HomeSearchBar, { props: { modelValue: "" } });

    expect(wrapper.find(CLEAR_BUTTON).exists()).toBe(false);

    await wrapper.setProps({ modelValue: "paris" });

    expect(wrapper.get(CLEAR_BUTTON).attributes("aria-label")).toBe("home-button-clear-search");
  });

  it("shows the clear button outside the label, before the action", () => {
    const wrapper = mount(HomeSearchBar, {
      props: { modelValue: "paris" },
      slots: { action: '<button type="button">Filter</button>' },
    });

    expect(wrapper.find(`label ${CLEAR_BUTTON}`).exists()).toBe(false);
    expect(wrapper.findAll("button").map((button) => button.text() || button.attributes("aria-label"))).toEqual([
      "home-button-clear-search",
      "Filter",
    ]);
  });

  it("keeps the text clear of each button at the right end", async () => {
    const withAction = mount(HomeSearchBar, {
      props: { modelValue: "" },
      slots: { action: '<button type="button">Filter</button>' },
    });

    expect(withAction.get("label").classes()).toContain("pr-11");

    await withAction.setProps({ modelValue: "paris" });

    expect(withAction.get("label").classes()).toContain("pr-20");
    expect(
      mount(HomeSearchBar, { props: { modelValue: "paris" } })
        .get("label")
        .classes()
    ).toContain("pr-11");
    expect(mount(HomeSearchBar).get("label").classes().join(" ")).not.toMatch(/\bpr-/);
  });

  it("empties the field and keeps the focus when the user clears it", async () => {
    const wrapper = mount(HomeSearchBar, { attachTo: document.body, props: { modelValue: "paris" } });

    await wrapper.get(CLEAR_BUTTON).trigger("click");

    const updates = wrapper.emitted<[string]>("update:modelValue") ?? [];

    expect(updates[updates.length - 1]).toEqual([""]);
    expect(document.activeElement).toBe(wrapper.get("input").element);

    wrapper.unmount();
  });
});
