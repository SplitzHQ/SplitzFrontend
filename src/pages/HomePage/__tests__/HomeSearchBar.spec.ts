import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import HomeSearchBar from "../HomeSearchBar.vue";

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string) => key,
  }),
}));

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
    expect(classes).toContain("focus-within:border-base-border-brand-solid");
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
});
