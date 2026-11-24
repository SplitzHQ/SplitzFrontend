import NumberFlow from "@number-flow/vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { MOTION_DURATION_MS, MOTION_EASING } from "@/libs/motion";

import HomeAmount from "../HomeAmount.vue";

describe("HomeAmount", () => {
  it("formats the absolute value in the target currency using container motion tokens", () => {
    const wrapper = mount(HomeAmount, { props: { amount: -42.5, currency: "USD" } });

    const flow = wrapper.getComponent(NumberFlow);
    const expectedTiming = { duration: MOTION_DURATION_MS.container, easing: MOTION_EASING.enter };

    expect(flow.props("value")).toBe(42.5);
    expect(flow.props("format")).toEqual({ currency: "USD", style: "currency" });
    expect(flow.props("transformTiming")).toEqual(expectedTiming);
    expect(flow.props("spinTiming")).toEqual(expectedTiming);
    expect(flow.props("opacityTiming")).toEqual(expectedTiming);
  });

  it("falls back to plain text when Intl rejects the currency code", () => {
    const wrapper = mount(HomeAmount, { props: { amount: -42.5, currency: "not a code" } });

    expect(wrapper.findComponent(NumberFlow).exists()).toBe(false);
    expect(wrapper.text()).toBe("42.50 not a code");
  });
});
