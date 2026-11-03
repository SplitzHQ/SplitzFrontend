import { parseBacklog } from "@/backlog/parse";

/** One level-2 section of the backlog document and the number of entries in it. */
export interface BacklogGroup {
  text: string;
  count: number;
}

/** What the home page shows about the backlog. */
export interface BacklogSummary {
  /** All entries in the document. */
  total: number;
  /** The date of the `最后更新` line, or an empty string. */
  updated: string;
  groups: BacklogGroup[];
}

/**
 * Counts the entries of the backlog document. It uses the backlog page parser, so the dashboard and the backlog page
 * always show the same numbers.
 */
export function summarizeBacklog(markdown: string): BacklogSummary {
  const { body, title, updated } = parseBacklog(markdown);
  const groups = body.flatMap((block) =>
    block.kind === "h" && block.level === 2 ? [{ count: block.count, text: block.text }] : []
  );
  const total = title?.count ?? groups.reduce((sum, group) => sum + group.count, 0);
  return { groups, total, updated };
}
