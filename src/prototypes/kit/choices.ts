import { copyToClipboard } from "@/libs/copy-to-clipboard";

/**
 * "Export my choices": a prototype page says what the viewer picked, and the status badge saves it.
 * Call `registerChoices` once on a page that has choices. The badge calls the provider again on each export.
 *
 * ```ts
 * registerChoices(() => ({ choices: { layout: layout.value }, summary: [`Layout: ${layout.value}`] }));
 * ```
 *
 * On the dev server, the export goes to `src/prototypes/<folder>/choices.json` (see `vite.config.prototypes.ts`),
 * so the next work session can read the decision. The JSON is also copied to the clipboard.
 */
export interface PrototypeChoices {
  /** The data the page needs to restore the same picks. It must be JSON-serializable. */
  choices: unknown;
  /** The picks in words, one line each. */
  summary?: string[];
}

// The provider is kept on `window`, not in this module. During HMR the page and the badge can
// load two copies of this module under different URLs, and both copies must see the same provider.
const PROVIDER_KEY = "__splitzPrototypeChoices";
const REGISTERED_EVENT = "prototype-choices-registered";
type ChoicesWindow = Window & { [PROVIDER_KEY]?: () => PrototypeChoices };

/** The endpoint of the dev-server middleware that writes `choices.json`. */
export const CHOICES_ENDPOINT = "/__prototype-choices";

/** Sets the function that returns the current picks of the page. */
export function registerChoices(provider: () => PrototypeChoices): void {
  (window as ChoicesWindow)[PROVIDER_KEY] = provider;
  window.dispatchEvent(new Event(REGISTERED_EVENT));
}

/** True when the page registered its choices. */
export function hasChoices(): boolean {
  return (window as ChoicesWindow)[PROVIDER_KEY] !== undefined;
}

/** Calls `listener` when a page registers its choices. Returns a function that removes the listener. */
export function onChoicesRegistered(listener: () => void): () => void {
  window.addEventListener(REGISTERED_EVENT, listener);
  return () => window.removeEventListener(REGISTERED_EVENT, listener);
}

/** The prototype folder of the current page (for example `2026-11-02-balance-card`), from its URL. */
export function prototypeFolder(): string {
  return /\/(\d{4}-\d{2}-\d{2}-[^/]+)\//.exec(location.pathname)?.[1] ?? "prototype";
}

/** The JSON that an export saves, or null when the page has no choices. */
export function choicesPayload() {
  const provider = (window as ChoicesWindow)[PROVIDER_KEY];
  if (!provider) return null;
  const { choices, summary = [] } = provider();
  const file = location.pathname.slice(location.pathname.lastIndexOf("/") + 1);
  return {
    choices,
    exportedAt: new Date().toISOString(),
    page: file === "" ? "index.html" : file,
    prototype: prototypeFolder(),
    summary,
    title: document.title,
  };
}

/**
 * Saves the picks of the page. Copies the JSON to the clipboard and sends it to the dev server.
 * When both fail, downloads it as a file so the picks are not lost.
 * Returns a short message that says where the picks went.
 */
export async function exportChoices(): Promise<string> {
  const payload = choicesPayload();
  if (!payload) return "This page has no choices to export";
  const text = JSON.stringify(payload, null, 2);
  const copied = await copyToClipboard(text);
  try {
    const response = await fetch(CHOICES_ENDPOINT, {
      body: text,
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (response.ok) return `Saved to ${payload.prototype}/choices.json${copied ? " and copied" : ""}`;
  } catch {}
  if (copied) return "Copied to clipboard";

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  link.download = `${payload.prototype}-choices.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  return `Downloaded ${link.download}`;
}
