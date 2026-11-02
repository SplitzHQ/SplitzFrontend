import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { browserFailures, setClipboardBroken, setStorageBroken } from "../browser-failures";

describe("setStorageBroken", () => {
  afterEach(() => {
    setStorageBroken(false);
    localStorage.clear();
  });

  it("makes storage writes throw QuotaExceededError while on", () => {
    setStorageBroken(true);
    expect(browserFailures.storage).toBe(true);
    expect(() => localStorage.setItem("a", "1")).toThrow(expect.objectContaining({ name: "QuotaExceededError" }));
    expect(() => sessionStorage.setItem("a", "1")).toThrow();
  });

  it("puts the real setItem back when turned off", () => {
    setStorageBroken(true);
    setStorageBroken(false);
    expect(browserFailures.storage).toBe(false);
    localStorage.setItem("a", "1");
    expect(localStorage.getItem("a")).toBe("1");
  });
});

describe("setClipboardBroken", () => {
  class FakeClipboard {
    writeText(_text: string) {
      return Promise.resolve();
    }
    readText() {
      return Promise.resolve("real");
    }
  }

  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: new FakeClipboard() });
  });

  afterEach(() => {
    setClipboardBroken(false);
  });

  it("rejects clipboard calls with NotAllowedError while on", async () => {
    setClipboardBroken(true);
    expect(browserFailures.clipboard).toBe(true);
    await expect(navigator.clipboard.writeText("x")).rejects.toMatchObject({ name: "NotAllowedError" });
    await expect(navigator.clipboard.readText()).rejects.toMatchObject({ name: "NotAllowedError" });
  });

  it("restores the real methods when turned off", async () => {
    setClipboardBroken(true);
    setClipboardBroken(false);
    expect(browserFailures.clipboard).toBe(false);
    await expect(navigator.clipboard.readText()).resolves.toBe("real");
  });
});
