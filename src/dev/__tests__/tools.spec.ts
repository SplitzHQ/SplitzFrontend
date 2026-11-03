import { describe, expect, it } from "vitest";

import { DEV_TOOLS, groupByCategory, searchTools, TOOL_CATEGORIES, toolBySlug } from "../tools";

describe("dev tool catalog", () => {
  it("gives each tool a unique slug", () => {
    const slugs = DEV_TOOLS.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("opens only same-server pages inside the dashboard", () => {
    for (const tool of DEV_TOOLS) {
      if (tool.view === "tab") continue;
      expect(tool.href, tool.slug).toMatch(/^\//);
    }
  });

  it("finds a tool by slug", () => {
    expect(toolBySlug("backlog")?.name).toBe("Backlog");
    expect(toolBySlug("missing")).toBeUndefined();
  });
});

describe("groupByCategory", () => {
  it("keeps the category order and puts every tool in one group", () => {
    const groups = groupByCategory();
    expect(groups.map((group) => group.category)).toEqual(
      TOOL_CATEGORIES.filter((category) => DEV_TOOLS.some((tool) => tool.category === category))
    );
    expect(groups.flatMap((group) => group.tools)).toHaveLength(DEV_TOOLS.length);
  });

  it("leaves out empty categories", () => {
    const groups = groupByCategory(DEV_TOOLS.filter((tool) => tool.category === "Track"));
    expect(groups.map((group) => group.category)).toEqual(["Track"]);
  });
});

describe("searchTools", () => {
  it("returns all tools for an empty query", () => {
    expect(searchTools("  ")).toHaveLength(DEV_TOOLS.length);
  });

  it("matches names, keywords and categories without regard to case", () => {
    expect(searchTools("DESIGN").map((tool) => tool.slug)).toContain("design-system");
    expect(searchTools("待办").map((tool) => tool.slug)).toEqual(["backlog"]);
    expect(searchTools("explore").map((tool) => tool.slug)).toEqual(["prototypes"]);
  });

  it("needs every word to match", () => {
    expect(searchTools("vue pinia").map((tool) => tool.slug)).toEqual(["vue-devtools"]);
    expect(searchTools("vue backlog")).toEqual([]);
  });
});
