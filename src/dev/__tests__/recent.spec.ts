import { describe, expect, it } from "vitest";

import { addVisit, loadRecent, RECENT_KEY, RECENT_MAX, recentTools, saveRecent, timeAgo } from "../recent";

/** A storage stub that keeps one value in memory. */
function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: (key: string) => (key === RECENT_KEY ? value : null),
    setItem: (key: string, next: string) => {
      if (key === RECENT_KEY) value = next;
    },
  };
}

describe("recent visits storage", () => {
  it("returns an empty list for no value, bad JSON or a non-array", () => {
    expect(loadRecent(memoryStorage())).toEqual([]);
    expect(loadRecent(memoryStorage("{"))).toEqual([]);
    expect(loadRecent(memoryStorage('{"slug":"app"}'))).toEqual([]);
  });

  it("drops entries without a slug or a time", () => {
    const raw = JSON.stringify([{ at: "2026-11-02T00:00:00.000Z", slug: "app" }, { slug: "debug" }, null]);
    expect(loadRecent(memoryStorage(raw))).toEqual([{ at: "2026-11-02T00:00:00.000Z", slug: "app" }]);
  });

  it("returns an empty list when storage throws", () => {
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadRecent(throwing)).toEqual([]);
  });

  it("reads back what it saved", () => {
    const storage = memoryStorage();
    const visits = addVisit([], "app", new Date("2026-11-02T10:00:00Z"));
    saveRecent(storage, visits);
    expect(loadRecent(storage)).toEqual(visits);
  });

  it("ignores a failed write", () => {
    const throwing = {
      setItem: () => {
        throw new Error("full");
      },
    };
    expect(() => saveRecent(throwing, [])).not.toThrow();
  });
});

describe("addVisit", () => {
  const at = new Date("2026-11-02T10:00:00Z");

  it("puts the new visit first and removes the older visit of the same tool", () => {
    const visits = addVisit(addVisit(addVisit([], "app", at), "debug", at), "app", at);
    expect(visits.map((visit) => visit.slug)).toEqual(["app", "debug"]);
  });

  it(`keeps at most ${RECENT_MAX} visits`, () => {
    const slugs = ["a", "b", "c", "d", "e", "f", "g"];
    const visits = slugs.reduce((list, slug) => addVisit(list, slug, at), addVisit([], "start", at));
    expect(visits).toHaveLength(RECENT_MAX);
    expect(visits[0]?.slug).toBe("g");
  });
});

describe("recentTools", () => {
  it("leaves out tools that the catalog no longer has", () => {
    const tools = recentTools([
      { at: "2026-11-02T10:00:00.000Z", slug: "backlog" },
      { at: "2026-11-02T09:00:00.000Z", slug: "removed-tool" },
    ]);
    expect(tools.map(({ tool }) => tool.slug)).toEqual(["backlog"]);
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-11-02T12:00:00Z");

  it("formats hours, days and older dates", () => {
    expect(timeAgo(new Date("2026-11-02T11:30:00Z"), now)).toBe("Just now");
    expect(timeAgo(new Date("2026-11-02T09:00:00Z"), now)).toBe("3h ago");
    expect(timeAgo(new Date("2026-10-31T12:00:00Z"), now)).toBe("2d ago");
    expect(timeAgo(new Date("2026-10-01T12:00:00Z"), now)).toBe("Oct 1");
  });
});
