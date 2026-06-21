import { describe, expect, it } from "vitest";

import { resolveAssetUrlWithBase } from "../asset-url";

describe("resolveAssetUrlWithBase", () => {
  const baseUrl = "https://assets.splitz.test";

  it("returns nullish values unchanged", () => {
    expect(resolveAssetUrlWithBase(null, baseUrl)).toBeNull();
    expect(resolveAssetUrlWithBase(undefined, baseUrl)).toBeUndefined();
  });

  it("returns absolute urls unchanged", () => {
    expect(resolveAssetUrlWithBase("https://cdn.example.com/image.jpg", baseUrl)).toBe(
      "https://cdn.example.com/image.jpg"
    );
    expect(resolveAssetUrlWithBase("http://cdn.example.com/image.jpg", baseUrl)).toBe(
      "http://cdn.example.com/image.jpg"
    );
  });

  it("returns browser-local urls unchanged", () => {
    expect(resolveAssetUrlWithBase("data:image/png;base64,abc", baseUrl)).toBe("data:image/png;base64,abc");
    expect(resolveAssetUrlWithBase("blob:https://splitz.test/receipt", baseUrl)).toBe(
      "blob:https://splitz.test/receipt"
    );
  });

  it("combines leading-slash relative urls with the base domain", () => {
    expect(resolveAssetUrlWithBase("/bucket/users/1/avatar.webp?sig=abc", baseUrl)).toBe(
      "https://assets.splitz.test/bucket/users/1/avatar.webp?sig=abc"
    );
  });

  it("preserves base paths when combining leading-slash relative urls", () => {
    expect(resolveAssetUrlWithBase("/bucket/users/1/avatar.webp?sig=abc", "https://assets.splitz.test/assets")).toBe(
      "https://assets.splitz.test/assets/bucket/users/1/avatar.webp?sig=abc"
    );
  });

  it("combines non-leading-slash relative urls with the base domain", () => {
    expect(resolveAssetUrlWithBase("bucket/users/1/avatar.webp?sig=abc", baseUrl)).toBe(
      "https://assets.splitz.test/bucket/users/1/avatar.webp?sig=abc"
    );
  });
});
