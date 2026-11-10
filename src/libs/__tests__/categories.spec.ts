import { describe, it, expect } from "vitest";

import { getCategory, getMainCategory, legacySubcategoryAliases, subcategories } from "../categories";

describe("legacySubcategoryAliases", () => {
  it("maps each old key to a current key that is not itself old", () => {
    for (const [oldKey, newKey] of legacySubcategoryAliases) {
      expect((subcategories as readonly string[]).includes(oldKey), oldKey).toBe(false);
      expect(subcategories, oldKey).toContain(newKey);
    }
  });

  it("reads the old travel insurance key as the insurance one", () => {
    expect(getCategory("travel_insurance")).toBe("travel_insurance_premium");
    expect(getMainCategory("travel_insurance")).toBe("insurance");
  });
});

describe("getCategory", () => {
  it("gives uncategorized for an empty or unknown value", () => {
    expect(getCategory(null)).toBe("uncategorized");
    expect(getCategory("nonexistent_value")).toBe("uncategorized");
  });

  it("gives a current key back with no change", () => {
    expect(getCategory("groceries")).toBe("groceries");
  });
});

describe("getMainCategory", () => {
  it("returns other for null/undefined", () => {
    expect(getMainCategory(null)).toBe("other");
    expect(getMainCategory(undefined)).toBe("other");
  });
  it("returns main category when given a main category directly", () => {
    expect(getMainCategory("food")).toBe("food");
    expect(getMainCategory("other")).toBe("other");
  });
  it("maps known subcategories to their main category", () => {
    expect(getMainCategory("groceries")).toBe("food");
    expect(getMainCategory("public_transport")).toBe("transport");
    expect(getMainCategory("gym")).toBe("sports_fitness");
  });
  it("falls back to other for unknown values", () => {
    expect(getMainCategory("nonexistent_value")).toBe("other");
  });
});
