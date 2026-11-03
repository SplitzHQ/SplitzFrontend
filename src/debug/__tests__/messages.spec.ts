import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { FluentBundle, FluentResource } from "@fluent/bundle";
import { describe, expect, it } from "vitest";

import { formatInBundle } from "../locale";
import { addDebugMessages, localeOfPath } from "../messages";

const localesDir = path.join(import.meta.dirname, "../../locales");

/** Returns the message IDs of an .ftl file, in order. */
function messageIds(path: string): string[] {
  return [...readFileSync(path, "utf8").matchAll(/^([a-z][\w-]*) =/gm)].map((m) => m[1]);
}

describe("debug panel messages", () => {
  it("reads the locale folder from a debug .ftl path", () => {
    expect(localeOfPath("/src/locales/zh-cn/debug/debug-panel.ftl")).toBe("zh-cn");
    expect(localeOfPath("/src/locales/en/debug-panel.ftl")).toBeNull();
  });

  it("adds each file to the bundle of its locale, one time only", () => {
    const en = new FluentBundle("en");
    const zh = new FluentBundle("zh-cn");
    const files = {
      "/src/locales/en/debug/a.ftl": new FluentResource("debug-panel-x = Hello"),
      "/src/locales/zh-cn/debug/a.ftl": new FluentResource("debug-panel-x = 你好"),
    };
    addDebugMessages([en, zh], files);
    addDebugMessages([en, zh], files);
    expect(formatInBundle(en, "debug-panel-x")).toBe("Hello");
    expect(formatInBundle(zh, "debug-panel-x")).toBe("你好");
  });

  it("has the same message IDs, in the same order, in every locale", () => {
    const files = readdirSync(`${localesDir}/en/debug`);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const en = messageIds(`${localesDir}/en/debug/${file}`);
      const zh = messageIds(`${localesDir}/zh-cn/debug/${file}`);
      expect(zh).toEqual(en);
      expect(en.every((id) => id.startsWith("debug-panel-"))).toBe(true);
    }
  });
});
