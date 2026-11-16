import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import {
  WORDMARK_FONT_SIZE,
  WORDMARK_LAYOUT,
  WORDMARK_LETTERS,
  WORDMARK_SIZES,
  WORDMARK_TITTLE,
  WORDMARK_WORD,
} from "../brand-wordmark";
import BrandWordmark from "../BrandWordmark.vue";

describe("BrandWordmark", () => {
  it("exposes a single accessible image name", () => {
    const svg = mount(BrandWordmark, { props: { size: "header" } }).get("svg");

    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Splitz");
  });

  it.each(WORDMARK_SIZES)("scales the %s preset from its target font size", (size) => {
    const svg = mount(BrandWordmark, { props: { size } }).get("svg");
    const pixelScale = WORDMARK_FONT_SIZE[size] / WORDMARK_LAYOUT.emUnits;

    expect(Number(svg.attributes("width"))).toBeCloseTo(WORDMARK_LAYOUT.box.width * pixelScale);
    expect(Number(svg.attributes("height"))).toBeCloseTo(WORDMARK_LAYOUT.box.height * pixelScale);
  });

  it("renders vector letter paths without `<text>` elements or a leading glyph", () => {
    const wrapper = mount(BrandWordmark, { props: { size: "auth" } });

    expect(wrapper.find("text").exists()).toBe(false);
    expect(wrapper.findAll("[data-part^='letter-']")).toHaveLength(WORDMARK_WORD.length);
    expect(wrapper.find("circle").exists()).toBe(false);
  });

  it("centers the diamond tittle horizontally over the stem of the dotless `i`", () => {
    const [, topVertexX] = /^M([\d.]+) /.exec(WORDMARK_TITTLE) ?? [];
    const stemXCoordinates = (WORDMARK_LETTERS[3].match(/[\d.]+(?= )/g) ?? []).map(Number);

    // `WORDMARK_LETTERS[3]` is the dotless `i`, so the midpoint of its x bounds is the center of its stem.
    expect(Number(topVertexX)).toBeCloseTo((Math.min(...stemXCoordinates) + Math.max(...stemXCoordinates)) / 2, 0);
  });

  it("renders default slot content behind the letter paths", () => {
    const wrapper = mount(BrandWordmark, {
      props: { size: "header" },
      slots: { default: '<g data-test="under" />' },
    });

    expect(wrapper.get("svg").element.firstElementChild?.getAttribute("data-test")).toBe("under");
  });
});
