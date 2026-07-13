import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";

import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";

describe("useRateLimitCooldown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down from an absolute expiry and stops at zero", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    const scope = effectScope();
    const cooldown = scope.run(() => useRateLimitCooldown())!;

    cooldown.start(Date.now() + 2500);
    expect(cooldown.isActive.value).toBe(true);
    expect(cooldown.remainingSeconds.value).toBe(3);

    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();
    expect(cooldown.remainingSeconds.value).toBe(2);

    await vi.advanceTimersByTimeAsync(2000);
    await nextTick();
    expect(cooldown.isActive.value).toBe(false);
    expect(cooldown.remainingSeconds.value).toBe(0);

    scope.stop();
  });

  it("can reset an active cooldown without waiting for expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    const scope = effectScope();
    const cooldown = scope.run(() => useRateLimitCooldown())!;

    cooldown.start(Date.now() + 10_000);
    cooldown.reset();
    await nextTick();

    expect(cooldown.isActive.value).toBe(false);
    expect(cooldown.remainingSeconds.value).toBe(0);
    scope.stop();
  });

  it("stops its active interval when the owning scope is disposed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    const scope = effectScope();
    const cooldown = scope.run(() => useRateLimitCooldown())!;

    cooldown.start(Date.now() + 10_000);
    expect(cooldown.remainingSeconds.value).toBe(10);
    expect(vi.getTimerCount()).toBe(1);

    scope.stop();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(cooldown.remainingSeconds.value).toBe(10);
  });
});
