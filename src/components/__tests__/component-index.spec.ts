import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { WORDMARK_SIZES } from "@/components/BrandWordmark/brand-wordmark";
import { SIZE_GUIDE as WORDMARK_SIZE_GUIDE } from "@/components/BrandWordmark/brand-wordmark.usage";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/SButton/button";
import { SIZE_GUIDE, VARIANT_GUIDE } from "@/components/SButton/button.usage";

import { COMPONENT_INDEX } from "../component-index";

const COMPONENTS_FOLDER = resolve(process.cwd(), "src/components");

describe("component index", () => {
  it("lists every component folder and no other folder", () => {
    const folders = readdirSync(COMPONENTS_FOLDER, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "__tests__")
      .map((entry) => entry.name)
      .sort();

    expect(COMPONENT_INDEX.map(({ folder }) => folder).sort()).toEqual(folders);
  });

  it("points only at usage files that exist", () => {
    const missing = COMPONENT_INDEX.filter(({ usage }) => !existsSync(resolve(process.cwd(), usage)));

    expect(missing).toEqual([]);
  });
});

describe("brand wordmark usage", () => {
  it("has a rule for every size", () => {
    expect(WORDMARK_SIZE_GUIDE.map(({ size }) => size)).toEqual([...WORDMARK_SIZES]);
    expect(WORDMARK_SIZE_GUIDE.every(({ use }) => use !== "")).toBe(true);
  });
});

describe("button usage", () => {
  it("has a rule for every variant", () => {
    expect(VARIANT_GUIDE.map(({ variant }) => variant)).toEqual([...BUTTON_VARIANTS]);
    expect(VARIANT_GUIDE.every(({ role, use }) => role !== "" && use !== "")).toBe(true);
  });

  it("has a rule for every size", () => {
    expect(SIZE_GUIDE.map(({ size }) => size)).toEqual([...BUTTON_SIZES]);
    expect(SIZE_GUIDE.every(({ use }) => use !== "")).toBe(true);
  });
});
