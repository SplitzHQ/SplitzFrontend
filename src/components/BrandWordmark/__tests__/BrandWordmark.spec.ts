import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { WORDMARK_FONT_SIZE, WORDMARK_LAYOUT, WORDMARK_SIZES } from "../brand-wordmark";
import BrandWordmark from "../BrandWordmark.vue";

describe("BrandWordmark", () => {
  it("gives the logo one accessible name", () => {
    const svg = mount(BrandWordmark, { props: { size: "header" } }).get("svg");

    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Splitz");
  });

  it.each(WORDMARK_SIZES)("scales the %s size from its font size", (size) => {
    const svg = mount(BrandWordmark, { props: { size } }).get("svg");
    const scale = WORDMARK_FONT_SIZE[size] / WORDMARK_LAYOUT.emUnits;

    expect(Number(svg.attributes("width"))).toBeCloseTo(WORDMARK_LAYOUT.box.width * scale);
    expect(Number(svg.attributes("height"))).toBeCloseTo(WORDMARK_LAYOUT.box.height * scale);
  });

  it("stands the glyph on the baseline of the word", () => {
    const { glyph } = WORDMARK_LAYOUT;

    expect(glyph.y + glyph.size).toBe(0);
    expect(
      mount(BrandWordmark, { props: { size: "auth" } })
        .get("text")
        .attributes("y")
    ).toBe("0");
  });
});
