import { FluentBundle, FluentResource } from "@fluent/bundle";
import { describe, expect, it } from "vitest";

import { bundleLocale, bundlesWithFirst, formatInBundle } from "../locale";

function bundle(locale: string, ftl = "") {
  const b = new FluentBundle(locale);
  b.addResource(new FluentResource(ftl));
  return b;
}

describe("locale helpers", () => {
  const en = bundle("en", "hello = Hello");
  const zh = bundle("zh-cn", "hello = 你好");
  const fr = bundle("fr");

  it("reads the main locale of a bundle", () => {
    expect(bundleLocale(zh)).toBe("zh-cn");
  });

  it("moves the chosen bundle to the front and keeps the others in order", () => {
    expect(bundlesWithFirst([en, zh, fr], "fr")).toEqual([fr, en, zh]);
    expect(bundlesWithFirst([en, zh, fr], "zh-cn")).toEqual([zh, en, fr]);
  });

  it("keeps the order when the locale is first already or missing", () => {
    expect(bundlesWithFirst([en, zh], "en")).toEqual([en, zh]);
    expect(bundlesWithFirst([en, zh], "de")).toEqual([en, zh]);
  });

  it("formats a message with one bundle and no fallback", () => {
    expect(formatInBundle(zh, "hello")).toBe("你好");
    expect(formatInBundle(fr, "hello")).toBeNull();
  });
});
