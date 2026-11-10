import { PhBicycle, PhEye, PhQuestion } from "@phosphor-icons/vue";
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";

import { categorySubcategories, mainCategories, subcategories } from "@/libs/categories";

import { categoryColorMap } from "../category-color";
import { categoryIconMap } from "../category-icons";
import CategoryIcon from "../CategoryIcon.vue";
import CategoryText from "../CategoryText.vue";

vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (id: string) => id }) }));

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

  it("uses a real icon for vision and bike share", () => {
    expect(categoryIconMap.vision).toBe(PhEye);
    expect(categoryIconMap.bike_share).toBe(PhBicycle);
  });

  it("uses the question mark only for a bucket with no fixed meaning", () => {
    const withQuestionMark = subcategories.filter((sub) => categoryIconMap[sub] === PhQuestion);

    for (const sub of withQuestionMark) {
      expect(sub === "uncategorized" || sub.startsWith("other_")).toBe(true);
    }
  });
});

describe("categoryIconMap in a main category", () => {
  it("does not repeat an icon, except for the insurance shield", () => {
    for (const main of mainCategories.filter((name) => name !== "insurance")) {
      const icons = categorySubcategories[main]
        .map((sub) => categoryIconMap[sub])
        .filter((icon) => icon !== PhQuestion);

      expect(new Set(icons).size, main).toBe(icons.length);
    }
  });
});

describe("categoryColorMap", () => {
  // The palette tokens hold the steps: the fill is step 50 and the icon is step 600. The generator test checks them.
  it("uses the fill and the icon of one palette family for each main category", () => {
    for (const main of mainCategories) {
      expect(categoryColorMap[main]).toMatch(/^bg-comp-palette-([a-z]+)-fill text-comp-palette-\1-icon$/);
    }
  });
});

describe("CategoryIcon", () => {
  it("hides the icon from a screen reader", () => {
    const icon = mount(CategoryIcon, { props: { category: "vision" } });

    expect(icon.find("svg").exists()).toBe(true);
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  it("passes classes to the icon", () => {
    const icon = mount(CategoryIcon, { attrs: { class: "icon-7" }, props: { category: "groceries" } });

    expect(icon.classes()).toContain("icon-7");
  });
});

describe("CategoryText", () => {
  it("shows the translated name of the subcategory", () => {
    const text = mount(CategoryText, { props: { category: "groceries" } });

    expect(text.text()).toBe("categories-groceries");
  });
});
