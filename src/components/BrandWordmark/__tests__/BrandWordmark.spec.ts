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

  it("draws the word as outlines, with no text and no glyph in front", () => {
    const wrapper = mount(BrandWordmark, { props: { size: "auth" } });

    expect(wrapper.find("text").exists()).toBe(false);
    expect(wrapper.findAll("[data-part^='letter-']")).toHaveLength(WORDMARK_WORD.length);
    expect(wrapper.find("circle").exists()).toBe(false);
  });

  it("puts the diamond over the stem of the i", () => {
    const [, tipX] = /^M([\d.]+) /.exec(WORDMARK_TITTLE) ?? [];
    const xs = (WORDMARK_LETTERS[3].match(/[\d.]+(?= )/g) ?? []).map(Number);

    // The i has no dot, so the center of its box is the center of its stem.
    expect(Number(tipX)).toBeCloseTo((Math.min(...xs) + Math.max(...xs)) / 2, 0);
  });

  it("draws the slot under the word", () => {
    const wrapper = mount(BrandWordmark, {
      props: { size: "header" },
      slots: { default: '<g data-test="under" />' },
    });

    expect(wrapper.get("svg").element.firstElementChild?.getAttribute("data-test")).toBe("under");
  });
});
