import { describe, expect, it } from "vitest";

import { summarizeBacklog } from "../summary";

const DOC = `# 待办与暂缓

只做记录，不排期。

最后更新：2026-11-02

## 新 feature

| # | 条目 | 备注 |
|---|---|---|
| 1 | A | x |
| 2 | B | y |

## UI 打磨

- one
- two
- three
`;

describe("summarizeBacklog", () => {
  it("counts the entries of each level-2 section and of the whole document", () => {
    expect(summarizeBacklog(DOC)).toEqual({
      groups: [
        { count: 2, text: "新 feature" },
        { count: 3, text: "UI 打磨" },
      ],
      total: 5,
      updated: "2026-11-02",
    });
  });

  it("sums the sections when the document has no title", () => {
    const summary = summarizeBacklog(DOC.replace("# 待办与暂缓\n", ""));
    expect(summary.total).toBe(5);
  });

  it("returns zero entries for an empty document", () => {
    expect(summarizeBacklog("")).toEqual({ groups: [], total: 0, updated: "" });
  });
});
