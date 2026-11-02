/**
 * How far the app has come with what a prototype proposes. Each prototype page declares it in its `<head>`:
 *
 * ```html
 * <meta name="prototype-status" content="todo" />
 * <meta name="prototype-status-note" content="src/pages/GroupDetailPage/BalanceCard.vue" />
 * ```
 *
 * The note is optional. Use it to say where the app has the design, or why the idea was dropped.
 * A page without the status meta shows as "Unmarked".
 */
export const PROTOTYPE_STATUSES = {
  done: "Shipped",
  dropped: "Dropped",
  partial: "Partly shipped",
  todo: "Not built",
  // A page that makes something (a generator, a render helper). It gets no badge.
  tool: "Tool",
} as const;

export type PrototypeStatus = keyof typeof PROTOTYPE_STATUSES;

/** The order in which the index counts the statuses. */
export const STATUS_ORDER: readonly PrototypeStatus[] = ["done", "partial", "todo", "dropped", "tool"];

/** The status and note that a prototype page declares. */
export interface PrototypeStatusInfo {
  status?: PrototypeStatus;
  note: string;
}

/** The label for a status, or "Unmarked" when a page has none. */
export function statusLabel(status: PrototypeStatus | undefined): string {
  return status ? PROTOTYPE_STATUSES[status] : "Unmarked";
}

function isStatus(value: string | undefined): value is PrototypeStatus {
  return value !== undefined && (STATUS_ORDER as readonly string[]).includes(value);
}

/** Reads the status meta tags from the HTML of a prototype page. Unknown status values count as unmarked. */
export function readStatus(html: string): PrototypeStatusInfo {
  const meta = (name: string) => new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`).exec(html)?.[1];
  const status = meta("prototype-status");
  return { note: meta("prototype-status-note") ?? "", status: isStatus(status) ? status : undefined };
}
