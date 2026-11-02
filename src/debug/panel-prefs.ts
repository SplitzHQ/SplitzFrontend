/** The `localStorage` key for the panel layout. "Clear local data" keeps it. */
export const PANEL_PREFS_KEY = "splitz:debug-panel";

/** The panel layout that stays after a reload. */
export interface PanelPrefs {
  open: boolean;
  /** IDs of the groups that are folded. */
  closed: string[];
}

export const DEFAULT_PANEL_PREFS: PanelPrefs = { closed: [], open: false };

/** Reads the saved layout. Returns the defaults when there is no value, the value is not valid, or storage throws. */
export function loadPanelPrefs(storage: Pick<Storage, "getItem">): PanelPrefs {
  try {
    const raw = storage.getItem(PANEL_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PANEL_PREFS };
    const parsed = JSON.parse(raw) as Partial<PanelPrefs>;
    return {
      closed: Array.isArray(parsed.closed) ? parsed.closed.filter((id) => typeof id === "string") : [],
      open: parsed.open === true,
    };
  } catch {
    return { ...DEFAULT_PANEL_PREFS };
  }
}

/** Saves the layout. A failed write (for example, the "storage full" simulation) is ignored. */
export function savePanelPrefs(storage: Pick<Storage, "setItem">, prefs: PanelPrefs): void {
  try {
    storage.setItem(PANEL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // The panel still works; only the layout is not kept.
  }
}

/** Adds `id` to `list` or removes it. Returns a new array. */
export function toggleId(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Returns true for Ctrl+Shift+D (Cmd+Shift+D on macOS), the shortcut that opens and closes the panel. */
export function isPanelShortcut(event: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "shiftKey" | "altKey" | "code">) {
  return (event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.code === "KeyD";
}
