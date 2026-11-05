import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import StatusBadge from "../StatusBadge.vue";

describe("StatusBadge", () => {
  it("hides the icon and the rings from a screen reader", () => {
    const wrapper = mount(StatusBadge, { props: { tone: "success" }, slots: { default: "<svg />" } });

    expect(wrapper.get("svg").element.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(wrapper.findAll('span[aria-hidden="true"]')).toHaveLength(2);
  });
});
