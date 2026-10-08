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

  it("uses a custom placeholder when one is given", () => {
    const wrapper = mount(HomeSearchBar, { props: { placeholder: "Find a group" } });

    expect(wrapper.get("input").attributes("placeholder")).toBe("Find a group");
  });

  it("updates the model when the user types", async () => {
    const wrapper = mount(HomeSearchBar, { props: { modelValue: "" } });

    await wrapper.get("input").setValue("paris");

    const updates = wrapper.emitted<[string]>("update:modelValue") ?? [];

    expect(updates[updates.length - 1]).toEqual(["paris"]);
  });
});
