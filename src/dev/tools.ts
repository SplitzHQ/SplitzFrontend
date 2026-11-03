/**
 * The tools that the dev dashboard lists. This file is the only source: the sidebar, the search and the home page all
 * read it. To add a tool, add one entry here.
 */

/** The work area of a tool. The sidebar and the home page group tools by it, in this order. */
export const TOOL_CATEGORIES = ["Inspect", "Build", "Explore", "Track"] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

/** The icon names that `ToolIcon.vue` knows. */
export type ToolIconKey = "app" | "backlog" | "bug" | "design-system" | "devtools" | "prototypes" | "storybook";

/** How the dashboard shows the page of a tool. */
export type ToolView =
  /** In the dashboard, at full width. */
  | "frame"
  /** In the dashboard, in a phone-size frame first. The user can switch to full width. */
  | "phone"
  /** In a new browser tab. Use it for a page on another server. */
  | "tab";

export interface DevTool {
  slug: string;
  name: string;
  /** One sentence. The sidebar tooltip and the home page show it. */
  description: string;
  category: ToolCategory;
  icon: ToolIconKey;
  /** The page of the tool. A path is on the dev server. A full URL is on another server. */
  href: string;
  view: ToolView;
  /** More words that the search matches. */
  keywords: string[];
  /** A keyboard shortcut that works on the page of the tool. */
  shortcut?: string;
  /** A short note that the page header shows, for example a command to run first. */
  note?: string;
}

export const DEV_TOOLS: DevTool[] = [
  {
    category: "Inspect",
    description: "The running app at phone size.",
    href: "/",
    icon: "app",
    keywords: ["app", "preview", "phone", "mobile"],
    name: "App",
    slug: "app",
    view: "phone",
  },
  {
    category: "Inspect",
    description: "Simulate API failures, switch the locale and reset local state in the running app.",
    href: "/",
    icon: "bug",
    keywords: ["debug", "simulate", "api", "locale", "storage", "调试"],
    name: "Debug panel",
    shortcut: "Ctrl+Shift+D",
    slug: "debug",
    view: "phone",
  },
  {
    category: "Inspect",
    description: "Vue DevTools: components, Pinia stores, routes and timeline.",
    href: "/__devtools__/",
    icon: "devtools",
    keywords: ["vue", "devtools", "pinia", "components", "router"],
    name: "Vue DevTools",
    slug: "vue-devtools",
    view: "frame",
  },
  {
    category: "Build",
    description: "Colors, type, spacing, motion tokens and the shared components.",
    href: "/design-system.html",
    icon: "design-system",
    keywords: ["design system", "tokens", "colors", "motion", "components", "设计系统"],
    name: "Design system",
    slug: "design-system",
    view: "frame",
  },
  {
    category: "Build",
    description: "Component stories. Storybook runs on its own server.",
    href: "http://localhost:6006",
    icon: "storybook",
    keywords: ["storybook", "stories", "components"],
    name: "Storybook",
    note: "Run `bun run storybook` first.",
    slug: "storybook",
    view: "tab",
  },
  {
    category: "Explore",
    description: "Dated UI experiments with variants to compare and a status for each.",
    href: "/src/prototypes/",
    icon: "prototypes",
    keywords: ["prototype", "variants", "experiment", "原型"],
    name: "Prototypes",
    slug: "prototypes",
    view: "frame",
  },
  {
    category: "Track",
    description: "docs/待办与暂缓.md as a page: open features, questions and UI polish.",
    href: "/src/backlog/",
    icon: "backlog",
    keywords: ["backlog", "todo", "待办", "暂缓"],
    name: "Backlog",
    slug: "backlog",
    view: "frame",
  },
];

/** Returns the tool with this slug, or undefined. */
export function toolBySlug(slug: string): DevTool | undefined {
  return DEV_TOOLS.find((tool) => tool.slug === slug);
}

/** Returns the tools of each category in `TOOL_CATEGORIES` order. Categories without tools are left out. */
export function groupByCategory(tools: readonly DevTool[] = DEV_TOOLS): { category: ToolCategory; tools: DevTool[] }[] {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category),
  })).filter((group) => group.tools.length > 0);
}

/**
 * Returns the tools that match every word of the query, in catalog order. A word matches the name, the description,
 * the category or a keyword, without regard to case. An empty query returns all tools.
 */
export function searchTools(query: string, tools: readonly DevTool[] = DEV_TOOLS): DevTool[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...tools];
  return tools.filter((tool) => {
    const text = [tool.name, tool.description, tool.category, ...tool.keywords].join(" ").toLowerCase();
    return words.every((word) => text.includes(word));
  });
}
