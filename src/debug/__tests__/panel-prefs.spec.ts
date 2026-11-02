import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_PANEL_PREFS,
  isPanelShortcut,
  loadPanelPrefs,
  PANEL_PREFS_KEY,
  savePanelPrefs,
  toggleId,
} from "../panel-prefs";

describe("panel prefs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the defaults when nothing is saved", () => {
    expect(loadPanelPrefs(localStorage)).toEqual(DEFAULT_PANEL_PREFS);
  });

  it("round-trips a saved layout", () => {
    savePanelPrefs(localStorage, { closed: ["network"], open: true });
    expect(loadPanelPrefs(localStorage)).toEqual({ closed: ["network"], open: true });
  });

  it("falls back to the defaults for broken JSON", () => {
    localStorage.setItem(PANEL_PREFS_KEY, "{oops");
    expect(loadPanelPrefs(localStorage)).toEqual(DEFAULT_PANEL_PREFS);
  });

  it("drops fields of the wrong type", () => {
    localStorage.setItem(PANEL_PREFS_KEY, JSON.stringify({ closed: ["a", 3], open: "yes" }));
    expect(loadPanelPrefs(localStorage)).toEqual({ closed: ["a"], open: false });
  });

  it("ignores storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadPanelPrefs(broken)).toEqual(DEFAULT_PANEL_PREFS);
    expect(() => savePanelPrefs(broken, DEFAULT_PANEL_PREFS)).not.toThrow();
  });

  it("adds or removes an ID", () => {
    expect(toggleId(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleId(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("isPanelShortcut", () => {
  const key = { altKey: false, code: "KeyD", ctrlKey: false, metaKey: false, shiftKey: true };

  it("accepts Ctrl+Shift+D and Cmd+Shift+D", () => {
    expect(isPanelShortcut({ ...key, ctrlKey: true })).toBe(true);
    expect(isPanelShortcut({ ...key, metaKey: true })).toBe(true);
  });

  it("rejects other combinations", () => {
    expect(isPanelShortcut(key)).toBe(false);
    expect(isPanelShortcut({ ...key, ctrlKey: true, shiftKey: false })).toBe(false);
    expect(isPanelShortcut({ ...key, altKey: true, ctrlKey: true })).toBe(false);
    expect(isPanelShortcut({ ...key, code: "KeyE", ctrlKey: true })).toBe(false);
  });
});
