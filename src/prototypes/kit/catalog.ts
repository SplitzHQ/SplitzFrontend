import { readStatus, STATUS_ORDER, type PrototypeStatus } from "./status";

/** One page of a prototype, as the index lists it. */
export interface PrototypeEntry {
  /** The folder name, for example `2026-11-02-balance-card`. */
  folder: string;
  /** The date part of the folder name. It is the day the prototype started. */
  date: string;
  /** The folder name without the date. A page other than `index.html` adds its file name. */
  name: string;
  /** The `<title>` of the page. */
  title: string;
  /** The link to the page, relative to the index. */
  href: string;
  status?: PrototypeStatus;
  note: string;
}

const FOLDER_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
const TITLE_PATTERN = /<title>([\s\S]*?)<\/title>/;

/**
 * Turns the raw HTML of the prototype pages into index entries, newest folder first.
 * The keys are glob paths such as `./2026-11-02-balance-card/index.html`.
 * Folders without a `YYYY-MM-DD-` prefix (for example `kit`) are not prototypes and are left out.
 */
export function listPrototypes(pages: Record<string, string>): PrototypeEntry[] {
  const entries = Object.entries(pages).flatMap(([path, html]): PrototypeEntry[] => {
    const [, folder = "", file = ""] = path.split("/");
    const match = FOLDER_PATTERN.exec(folder);
    if (!match) return [];
    const [, date = "", slug = folder] = match;
    const isIndex = file === "index.html";
    return [
      {
        date,
        folder,
        href: `./${folder}/${isIndex ? "" : file}`,
        name: isIndex ? slug : `${slug} › ${file.replace(/\.html$/, "")}`,
        title: TITLE_PATTERN.exec(html)?.[1]?.trim() ?? slug,
        ...readStatus(html),
      },
    ];
  });
  return entries.sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
}

/** How many entries have each status. Unmarked entries come last and only show when there are some. */
export function countByStatus(entries: PrototypeEntry[]): { status?: PrototypeStatus; count: number }[] {
  const counts = STATUS_ORDER.map((status) => ({
    count: entries.filter((entry) => entry.status === status).length,
    status,
  }));
  const unmarked = entries.filter((entry) => entry.status === undefined).length;
  return unmarked > 0 ? [...counts, { count: unmarked }] : counts;
}
