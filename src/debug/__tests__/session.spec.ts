import { beforeEach, describe, expect, it } from "vitest";

import { clearStorageExcept, expireAccessToken, readTokenExpiry, tokenStatus } from "../session";

const NOW = 1_800_000_000_000;

describe("session helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads the token expiry, or null for a missing or broken value", () => {
    expect(readTokenExpiry(localStorage)).toBeNull();
    localStorage.setItem("accessTokenExpiration", "abc");
    expect(readTokenExpiry(localStorage)).toBeNull();
    localStorage.setItem("accessTokenExpiration", String(NOW));
    expect(readTokenExpiry(localStorage)).toBe(NOW);
  });

  it("reports no token, a valid token or an expired token", () => {
    expect(tokenStatus(localStorage, NOW)).toEqual({ kind: "none" });

    localStorage.setItem("accessToken", "token");
    expect(tokenStatus(localStorage, NOW)).toEqual({ kind: "valid", minutesLeft: null });

    localStorage.setItem("accessTokenExpiration", String(NOW + 90_000));
    expect(tokenStatus(localStorage, NOW)).toEqual({ kind: "valid", minutesLeft: 2 });

    localStorage.setItem("accessTokenExpiration", String(NOW));
    expect(tokenStatus(localStorage, NOW)).toEqual({ kind: "expired" });
  });

  it("expires a token by moving its expiry into the past", () => {
    localStorage.setItem("accessToken", "token");
    localStorage.setItem("accessTokenExpiration", String(NOW + 600_000));
    expect(expireAccessToken(localStorage, NOW)).toBe(true);
    expect(tokenStatus(localStorage, NOW)).toEqual({ kind: "expired" });
  });

  it("does nothing when there is no token to expire", () => {
    expect(expireAccessToken(localStorage, NOW)).toBe(false);
    expect(localStorage.getItem("accessTokenExpiration")).toBeNull();
  });

  it("clears every key except the kept ones", () => {
    localStorage.setItem("accessToken", "token");
    localStorage.setItem("refreshToken", "refresh");
    localStorage.setItem("splitz:debug-panel", "{}");
    clearStorageExcept(localStorage, ["splitz:debug-panel"]);
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem("splitz:debug-panel")).toBe("{}");
  });
});
