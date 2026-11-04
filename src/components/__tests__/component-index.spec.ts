import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/SButton/button";
import { SIZE_GUIDE, VARIANT_GUIDE } from "@/components/SButton/button.usage";

import { COMPONENT_INDEX } from "../component-index";

const COMPONENTS_FOLDER = resolve(process.cwd(), "src/components");

/**
 * The folders that had no usage file when these rules started. Remove a folder when its usage file exists.
 * Do not add a folder: a new component must have a usage file from the start.
 */
const FOLDERS_WITHOUT_USAGE = [
  "AuthShell",
  "Avatar",
  "Category",
  "Header",
  "InvoiceStatusPill",
  "Keyboard",
  "Layout",
  "Notice",
  "Notification",
  "RateLimitCountdown",
  "ReloadPrompt",
  "Sheet",
  "Sonner",
  "SPopover",
  "SSegmentControl",
  "SSwitch",
  "StatusBadge",
  "TextInput",
  "TransactionItem",
];

describe("component index", () => {
  it("lists every component folder and no other folder", () => {
    const folders = readdirSync(COMPONENTS_FOLDER, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "__tests__")
      .map((entry) => entry.name)
      .sort();

    expect(COMPONENT_INDEX.map(({ folder }) => folder).sort()).toEqual(folders);
  });

  it("points only at usage files that exist", () => {
    const missing = COMPONENT_INDEX.filter(({ usage }) => usage !== null && !existsSync(resolve(process.cwd(), usage)));

    expect(missing).toEqual([]);
  });

  it("allows no usage file only for the folders that had none at the start", () => {
    const withoutUsage = COMPONENT_INDEX.filter(({ usage }) => usage === null).map(({ folder }) => folder);

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
