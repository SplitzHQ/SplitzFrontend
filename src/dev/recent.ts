import { toolBySlug, type DevTool } from "./tools";

/** The `localStorage` key for the tools that the dashboard opened last. */
export const RECENT_KEY = "splitz:dev-recent";

/** The most visits that the dashboard keeps. */
export const RECENT_MAX = 5;

/** One opened tool and the time it was opened, as an ISO string. */
export interface RecentVisit {
  slug: string;
  at: string;
}

/** Reads the saved visits. Returns an empty list when there is no value, the value is not valid, or storage throws. */
export function loadRecent(storage: Pick<Storage, "getItem">): RecentVisit[] {
  try {
    const parsed = JSON.parse(storage.getItem(RECENT_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (visit): visit is RecentVisit =>
        typeof (visit as RecentVisit)?.slug === "string" && typeof (visit as RecentVisit)?.at === "string"
    );
  } catch {
    return [];
  }
}

/** Puts `slug` first, removes its older visit, and keeps at most `RECENT_MAX` visits. Returns a new array. */
export function addVisit(visits: readonly RecentVisit[], slug: string, at: Date): RecentVisit[] {
  return [{ at: at.toISOString(), slug }, ...visits.filter((visit) => visit.slug !== slug)].slice(0, RECENT_MAX);
}

/** Saves the visits. A failed write is ignored: the list then resets on reload, which is acceptable for a dev page. */
export function saveRecent(storage: Pick<Storage, "setItem">, visits: readonly RecentVisit[]): void {
  try {
    storage.setItem(RECENT_KEY, JSON.stringify(visits));
  } catch {
    // See the doc comment.
  }
}

/** Returns the tool of each visit. A visit to a tool that the catalog no longer has is left out. */
export function recentTools(visits: readonly RecentVisit[]): { tool: DevTool; at: Date }[] {
  return visits.flatMap((visit) => {
    const tool = toolBySlug(visit.slug);
    return tool ? [{ at: new Date(visit.at), tool }] : [];
  });
}

/** Formats the time since a visit: "Just now", "3h ago", "2d ago", or the date after one week. */
export function timeAgo(at: Date, now: Date): string {
  const hours = Math.max(0, Math.floor((now.getTime() - at.getTime()) / 3_600_000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(at);
}
