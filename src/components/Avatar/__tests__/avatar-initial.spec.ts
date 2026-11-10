import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { AVATAR_TONE_STYLES, AVATAR_TONES, avatarInitial, avatarTone } from "../avatar-initial";

describe("AVATAR_TONE_STYLES", () => {
  it("uses the avatar palette tokens of each family", () => {
    for (const tone of AVATAR_TONES) {
      expect(AVATAR_TONE_STYLES[tone]).toEqual({
        backgroundColor: `var(--comp-palette-avatar-${tone}-fill)`,
        color: `var(--comp-palette-avatar-${tone}-text)`,
      });
    }
  });

  it("uses only tokens that exist in color.css", () => {
    const colorCss = readFileSync("src/assets/color.css", "utf8");
    for (const { backgroundColor, color } of Object.values(AVATAR_TONE_STYLES)) {
      for (const value of [backgroundColor, color]) {
        expect(colorCss).toContain(`${value.slice(4, -1)}:`);
      }
    }
  });
});

describe("avatarInitial", () => {
  it("returns the first character in upper case", () => {
    expect(avatarInitial("maru")).toBe("M");
    expect(avatarInitial("小明")).toBe("小");
  });

  it("ignores the spaces around the name", () => {
    expect(avatarInitial("  alex")).toBe("A");
  });

  it("keeps a character with more than one code unit in one piece", () => {
    expect(avatarInitial("😀 Sam")).toBe("😀");
  });

  it("returns null for an empty name", () => {
    expect(avatarInitial("  ")).toBeNull();
  });
});

describe("avatarTone", () => {
  it("returns the same family for the same name", () => {
    expect(avatarTone("Alex Chen")).toBe(avatarTone("Alex Chen"));
  });

  it("uses more than one family", () => {
    const tones = new Set(["Alex Chen", "Tom", "小红", "小明", "Yuki", "maru", "Sam"].map(avatarTone));
    expect(tones.size).toBe(AVATAR_TONES.length);
  });
});
