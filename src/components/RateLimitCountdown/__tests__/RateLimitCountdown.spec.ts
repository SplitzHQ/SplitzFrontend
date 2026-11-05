import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import { createAppFluent } from "@/libs/fluent";

import RateLimitCountdown, { type RateLimitCountdownProps } from "../RateLimitCountdown.vue";

const KEY = "auth-rate-limit-countdown";

/** Removes the marks that Fluent puts around a value. */
function plain(text: string) {
  return text.replace(/\p{Cf}/gu, "");
}

/** Mounts a countdown with the real English messages. */
function mountCountdown(seconds: number, attrs: Record<string, string> = {}) {
  const props: RateLimitCountdownProps = { messageKey: KEY, seconds };
  return mount(RateLimitCountdown, { attrs, global: { plugins: [createAppFluent()] }, props });
}

describe("RateLimitCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows no text at zero and keeps an empty live region", () => {
    const wrapper = mountCountdown(0);

    expect(wrapper.find("p").exists()).toBe(false);
    expect(wrapper.get('[role="status"]').text()).toBe("");
  });

  it("gives the attributes of the caller to the visible text", () => {
    const wrapper = mountCountdown(5, { class: "relative", "data-test": "cooldown" });

    expect(wrapper.get('[data-test="cooldown"]').classes()).toContain("relative");
    expect(wrapper.get('[role="status"]').attributes("data-test")).toBeUndefined();
  });

  it("uses the singular form at one second", () => {
    expect(plain(mountCountdown(1).get("p").text())).toContain("in 1 second.");
    expect(plain(mountCountdown(2).get("p").text())).toContain("in 2 seconds.");
  });

  it("keeps the visible text out of the live regions", () => {
    expect(mountCountdown(5).get("p").attributes("aria-live")).toBe("off");
  });

  it("announces the start one time, and not each second", async () => {
    const wrapper = mountCountdown(0);

    await wrapper.setProps({ seconds: 3 });
    const region = wrapper.get('[role="status"]');
    expect(plain(region.text())).toContain("in 3 seconds.");

    await wrapper.setProps({ seconds: 2 });
    expect(plain(wrapper.get("p").text())).toContain("in 2 seconds.");
    expect(plain(region.text())).toContain("in 3 seconds.");
  });

  it("announces the end", async () => {
    const wrapper = mountCountdown(1);

    await wrapper.setProps({ seconds: 0 });

    expect(wrapper.get('[role="status"]').text()).toBe("You can try again now.");
  });

  it("announces after mount when it starts active", async () => {
    const wrapper = mountCountdown(4);

    await nextTick();

    expect(plain(wrapper.get('[role="status"]').text())).toContain("in 4 seconds.");
  });

  it("removes the message from the live region after a delay", async () => {
    const wrapper = mountCountdown(0);

    await wrapper.setProps({ seconds: 30 });
    vi.advanceTimersByTime(7000);
    await nextTick();

    expect(wrapper.get('[role="status"]').text()).toBe("");
    expect(wrapper.find("p").exists()).toBe(true);
  });
});
