import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/SButton/button";
import { SIZE_GUIDE, VARIANT_GUIDE } from "@/components/SButton/button.usage";

const COMPONENTS_FOLDER = resolve(process.cwd(), "src/components");

/**
 * The folders that had no usage file when these rules started. Remove a folder when its usage file exists.
 * Do not add a folder: a new component must have a usage file from the start.
 */
const FOLDERS_WITHOUT_USAGE = ["Notification", "Sheet", "SSegmentControl"];

describe("component usage files", () => {
  it("allows no usage file only for the folders that had none at the start", () => {
    const withoutUsage = readdirSync(COMPONENTS_FOLDER, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "__tests__")
      .map((entry) => entry.name)
      .filter((folder) => !readdirSync(resolve(COMPONENTS_FOLDER, folder)).some((name) => name.endsWith(".usage.ts")));

    expect(withoutUsage.sort()).toEqual([...FOLDERS_WITHOUT_USAGE].sort());
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
