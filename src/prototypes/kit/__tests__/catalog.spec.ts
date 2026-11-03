import { describe, expect, it } from "vitest";

import { countByStatus, listPrototypes } from "../catalog";
import { readStatus } from "../status";

const page = (title: string, status?: string, note?: string) =>
  [
    `<title>${title}</title>`,
    status === undefined ? "" : `<meta name="prototype-status" content="${status}" />`,
    note === undefined ? "" : `<meta name="prototype-status-note" content="${note}" />`,
  ].join("\n");

describe("readStatus", () => {
  it("reads the status and the note", () => {
    expect(readStatus(page("x", "done", "src/pages/Foo.vue"))).toEqual({ note: "src/pages/Foo.vue", status: "done" });
  });

  it("treats a missing or unknown status as unmarked", () => {
    expect(readStatus(page("x"))).toEqual({ note: "", status: undefined });
    expect(readStatus(page("x", "maybe"))).toEqual({ note: "", status: undefined });
  });
});

describe("listPrototypes", () => {
  it("lists dated folders newest first and skips other folders", () => {
    const entries = listPrototypes({
      "./2026-10-01-old/index.html": page("Old", "dropped"),
      "./2026-11-02-new/compare.html": page("New compare"),
      "./2026-11-02-new/index.html": page("New", "todo"),
      "./kit/index.html": page("Not a prototype"),
    });

    expect(entries.map((e) => [e.href, e.name, e.title, e.status])).toEqual([
      ["./2026-11-02-new/", "new", "New", "todo"],
      ["./2026-11-02-new/compare.html", "new › compare", "New compare", undefined],
      ["./2026-10-01-old/", "old", "Old", "dropped"],
    ]);
  });

  it("uses the folder name when the page has no title", () => {
    expect(listPrototypes({ "./2026-11-02-untitled/index.html": "" })[0]?.title).toBe("untitled");
  });
});

describe("countByStatus", () => {
  it("counts each status and adds unmarked only when there are some", () => {
    const entries = listPrototypes({
      "./2026-11-01-a/index.html": page("A", "done"),
      "./2026-11-02-b/index.html": page("B"),
    });

    expect(countByStatus(entries)).toEqual([
      { count: 1, status: "done" },
      { count: 0, status: "partial" },
      { count: 0, status: "todo" },
      { count: 0, status: "dropped" },
      { count: 0, status: "tool" },
      { count: 1 },
    ]);
    expect(countByStatus(entries.filter((entry) => entry.status !== undefined))).toHaveLength(5);
  });
});
