import { describe, it, expect } from "vitest";

import { subcategories } from "@/libs/categories";

import { categoryIconMap } from "../category-icons";

// Runtime safeguard: ensure the Record mapping matches the exported subcategories list.
// (Compile-time already enforces key presence.)

describe("categoryIconMap", () => {
  it("covers every subcategory", () => {
    const keys = Object.keys(categoryIconMap).sort();
    const all = [...subcategories].sort();
    expect(keys).toEqual(all);
  });

  it("maps to valid component definitions", () => {
    for (const entry of Object.values(categoryIconMap)) {
      expect(["function", "object"]).toContain(typeof entry);
    }
  });
});
