import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SSwitch, { type SSwitchProps } from "../SSwitch.vue";

/** Mounts a switch and returns it with the values that it emits. */
function mountSwitch(modelValue: boolean, props: Partial<SSwitchProps> = {}) {
  return mount(SSwitch, { props: { label: "Reminders", modelValue, ...props } });
}

describe("SSwitch", () => {
  it("has the switch role, the current value and a name", () => {
    const button = mountSwitch(true).get("button");

    expect(button.attributes("role")).toBe("switch");
    expect(button.attributes("aria-checked")).toBe("true");
    expect(button.attributes("aria-label")).toBe("Reminders");
    expect(button.attributes("type")).toBe("button");
  });

  it("emits the opposite value when the user taps it", async () => {
    const wrapper = mountSwitch(false);

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
  });

  it("does not change when it is disabled", async () => {
    const wrapper = mountSwitch(false, { disabled: true });

    await wrapper.get("button").trigger("click");

    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("keeps the focus and ignores taps while it is busy", async () => {
    const wrapper = mountSwitch(false, { busy: true });
    const button = wrapper.get("button");

    await button.trigger("click");

    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.attributes("aria-busy")).toBe("true");
    expect(button.attributes("aria-disabled")).toBe("true");
    expect(wrapper.find("svg").exists()).toBe(true);
    expect(button.classes()).toContain("is-busy");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("shows no arc and no busy state when it is not busy", () => {
    const wrapper = mountSwitch(false);

    expect(wrapper.get("button").attributes("aria-busy")).toBeUndefined();
    expect(wrapper.get("button").attributes("aria-disabled")).toBeUndefined();
    expect(wrapper.find("svg").exists()).toBe(false);
    expect(wrapper.get("button").classes()).not.toContain("is-busy");
  });
});
