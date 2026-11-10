import { afterEach, describe, expect, it, vi } from "vitest";

import { copyFromRequest } from "../copy-to-clipboard";

/** Replaces the clipboard of the test browser with the given methods. */
function stubClipboard(clipboard: Partial<Clipboard>) {
  vi.stubGlobal("navigator", { clipboard });
}

describe("copyFromRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copies the text when the browser has no ClipboardItem", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });
    vi.stubGlobal("ClipboardItem", undefined);

    await expect(copyFromRequest(Promise.resolve("https://splitz.test/group/join/1"))).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("https://splitz.test/group/join/1");
  });

  it("starts the copy at once with a ClipboardItem when the browser has one", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const clipboardItem = vi.fn();
    stubClipboard({ write, writeText: vi.fn() });
    vi.stubGlobal("ClipboardItem", clipboardItem);

    await expect(copyFromRequest(Promise.resolve("link"))).resolves.toBe(true);
    expect(clipboardItem).toHaveBeenCalledOnce();
    expect(write).toHaveBeenCalledOnce();
  });

  it("resolves false when the request fails", async () => {
    stubClipboard({ writeText: vi.fn() });
    vi.stubGlobal("ClipboardItem", undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(copyFromRequest(Promise.reject(new Error("offline")))).resolves.toBe(false);
  });
});
