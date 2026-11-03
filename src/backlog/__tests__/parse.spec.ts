import { describe, expect, it } from "vitest";

import { buildPrompt, countEntries, type Heading, parseBacklog, parseBlocks } from "@/backlog/parse";

import markdown from "../../../docs/待办与暂缓.md?raw";

const sample = `# 待办

规则一行。
规则两行。

最后更新：2026-11-02

## 新 feature

| # | 条目 | 备注 |
|---|---|---|
| 1 | 第一条 | 在 \`a.ts\` 里 |
| 4 | 第四条 | **重要** |

## 打磨

### 子分组

- 列表一
  接着上一行
- 列表二

### 空分组

暂无。
`;

const headings = (blocks: ReturnType<typeof parseBlocks>) =>
  blocks.filter((block): block is Heading => block.kind === "h");

describe("parseBlocks", () => {
  it("reads headings, paragraphs, tables and lists in order", () => {
    expect(parseBlocks(sample).map((block) => block.kind)).toEqual([
      "h",
      "p",
      "p",
      "h",
      "table",
      "h",
      "h",
      "ul",
      "h",
      "p",
    ]);
  });

  it("joins the lines of a paragraph", () => {
    expect(parseBlocks(sample)[1]).toEqual({ kind: "p", lines: ["规则一行。", "规则两行。"] });
  });

  it("skips the table separator and trims the cells", () => {
    const table = parseBlocks(sample).find((block) => block.kind === "table");
    expect(table).toEqual({
      head: ["#", "条目", "备注"],
      kind: "table",
      rows: [
        ["1", "第一条", "在 `a.ts` 里"],
        ["4", "第四条", "**重要**"],
      ],
    });
  });

  it("appends an indented line to the list item above it", () => {
    const list = parseBlocks(sample).find((block) => block.kind === "ul");
    expect(list).toEqual({ items: ["列表一 接着上一行", "列表二"], kind: "ul" });
  });

  it("reads Windows line endings", () => {
    expect(parseBlocks("## A\r\n\r\n- x\r\n- y\r\n")).toEqual([
      { count: 0, kind: "h", level: 2, text: "A" },
      { items: ["x", "y"], kind: "ul" },
    ]);
  });

  it("ends a paragraph at a line that starts a block", () => {
    expect(parseBlocks("文字\n- 列表").map((block) => block.kind)).toEqual(["p", "ul"]);
  });
});

describe("countEntries", () => {
  it("counts table rows and list items under each heading, sub-headings included", () => {
    const blocks = parseBlocks(sample);
    countEntries(blocks);
    expect(headings(blocks).map((heading) => [heading.text, heading.count])).toEqual([
      ["待办", 4],
      ["新 feature", 2],
      ["打磨", 2],
      ["子分组", 2],
      ["空分组", 0],
    ]);
  });

  it("does not count paragraphs", () => {
    const blocks = parseBlocks("## A\n\n暂无。\n");
    countEntries(blocks);
    expect(headings(blocks)[0].count).toBe(0);
  });

  it("gives the same counts when it runs twice", () => {
    const blocks = parseBlocks(sample);
    countEntries(blocks);
    countEntries(blocks);
    expect(headings(blocks)[0].count).toBe(4);
  });
});

describe("parseBacklog", () => {
  it("takes out the title and the 最后更新 line", () => {
    const { body, title, updated } = parseBacklog(sample);
    expect(title?.text).toBe("待办");
    expect(title?.count).toBe(4);
    expect(updated).toBe("2026-11-02");
    expect(body[0]).toEqual({ kind: "p", lines: ["规则一行。", "规则两行。"] });
    expect(body.some((block) => block.kind === "p" && block.lines[0].startsWith("最后更新"))).toBe(false);
  });

  it("accepts a half-width colon in the 最后更新 line", () => {
    expect(parseBacklog("最后更新: 2026-01-01").updated).toBe("2026-01-01");
  });

  it("leaves the title undefined when the document has no level-1 heading first", () => {
    expect(parseBacklog("## A\n").title).toBeUndefined();
  });
});

describe("docs/待办与暂缓.md", () => {
  const { body, title, updated } = parseBacklog(markdown);
  const tables = body.filter((block) => block.kind === "table");

  it("has a title, a 最后更新 date and a count that matches its numbered rows", () => {
    expect(title?.text).toBe("待办与暂缓");
    expect(updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(title?.count).toBe(tables.reduce((sum, table) => sum + table.rows.length, 0));
  });

  it("numbers every table in its first column and never repeats a number", () => {
    const ids = tables.flatMap((table) => {
      expect(table.head[0]).toBe("#");
      return table.rows.map((row) => row[0]);
    });
    for (const id of ids) expect(id).toMatch(/^\d+$/);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every row the same number of cells as its header", () => {
    for (const table of tables) {
      for (const row of table.rows) expect(row).toHaveLength(table.head.length);
    }
  });
});

describe("buildPrompt", () => {
  it("names the entry, its group and its notes, and asks before work starts", () => {
    const prompt = buildPrompt("3", "图标", "UI 打磨", [["状态", "占位"]]);
    expect(prompt).toContain("#3：图标");
    expect(prompt).toContain("分组：UI 打磨\n状态：占位\n");
    expect(prompt).toContain("AskUserQuestion");
    expect(prompt).toContain("等我确认后再开始推进");
  });
});
