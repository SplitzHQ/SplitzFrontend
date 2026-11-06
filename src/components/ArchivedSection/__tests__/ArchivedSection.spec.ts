import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import ArchivedSection from "../ArchivedSection.vue";

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: { count?: number }) => (args?.count === undefined ? key : `${key}:${String(args.count)}`),
  }),
}));

function mountSection(count: number) {
  return mount(ArchivedSection, {
    props: { count },
    slots: { default: '<p data-test="archived-content">Old dinner</p>' },
  });
}

describe("ArchivedSection", () => {
  it("hides archived items until the user opens the section", async () => {
    const wrapper = mountSection(3);
    const toggle = wrapper.get('[data-test="archived-toggle"]');

    expect(toggle.text()).toContain("archived-section-show:3");
    expect(toggle.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find('[data-test="archived-content"]').exists()).toBe(false);

    await toggle.trigger("click");

    expect(toggle.text()).toContain("archived-section-hide");
    expect(toggle.attributes("aria-expanded")).toBe("true");
    expect(wrapper.get('[data-test="archived-items"]').attributes("id")).toBe(toggle.attributes("aria-controls"));
    expect(wrapper.find('[data-test="archived-content"]').exists()).toBe(true);

    await toggle.trigger("click");

    expect(wrapper.find('[data-test="archived-content"]').exists()).toBe(false);
  });

  it("renders nothing when there are no archived items", () => {
    const wrapper = mountSection(0);

    expect(wrapper.find('[data-test="archived-toggle"]').exists()).toBe(false);
  });
});
