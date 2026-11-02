import { describe, expect, it } from "vitest";

import { matchesQuery, squash } from "../search";

describe("debug panel search", () => {
  it("lowercases and drops whitespace", () => {
    expect(squash("  Expire  Now ")).toBe("expirenow");
  });

  it("matches everything for an empty or blank query", () => {
    expect(matchesQuery(["Sign out"], "")).toBe(true);
    expect(matchesQuery([], "   ")).toBe(true);
  });

  it("matches across case and spaces", () => {
    expect(matchesQuery(["Rate limited"], "RATELIM")).toBe(true);
    expect(matchesQuery(["Rate limited"], "rate lim")).toBe(true);
  });

  it("matches a name in any locale", () => {
    expect(matchesQuery(["Sign out", "退出登录"], "退出")).toBe(true);
  });

  it("does not run a query from one name into the next", () => {
    expect(matchesQuery(["Slow", "Offline"], "slowoff")).toBe(false);
  });
});
