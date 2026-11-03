import { reactive } from "vue";

/**
 * Browser failures that the debug panel can turn on. Each one stays on until you turn it off or reload the page.
 *
 * - `storage`: every `localStorage` and `sessionStorage` write throws, as when the storage quota is full or the
 *   browser blocks site data. Sign-in keeps its tokens in `localStorage`, so this shows how sign-in fails.
 * - `clipboard`: clipboard reads and writes are refused, as when the browser denies permission.
 */
export const browserFailures = reactive({ clipboard: false, storage: false });

const SIMULATED = "Simulated by the Splitz debug panel";

/** The real `setItem`, kept as a property descriptor so that it goes back unchanged. */
const realSetItem = Object.getOwnPropertyDescriptor(Storage.prototype, "setItem")!;

function refuseStorage(): never {
  throw new DOMException(SIMULATED, "QuotaExceededError");
}

function refuseClipboard(): Promise<never> {
  return Promise.reject(new DOMException(SIMULATED, "NotAllowedError"));
}

/** Makes every storage write throw `QuotaExceededError`, or puts the real `setItem` back. */
export function setStorageBroken(on: boolean): void {
  Object.defineProperty(Storage.prototype, "setItem", on ? { ...realSetItem, value: refuseStorage } : realSetItem);
  browserFailures.storage = on;
}

/**
 * Makes clipboard calls reject with `NotAllowedError`, or puts the real ones back. The fakes are own properties on
 * `navigator.clipboard`, over the prototype methods, so deleting them restores the real methods.
 */
export function setClipboardBroken(on: boolean): void {
  const clipboard = globalThis.navigator.clipboard as unknown as Record<string, unknown> | undefined;
  if (!clipboard) return;
  if (on) {
    clipboard.writeText = refuseClipboard;
    clipboard.readText = refuseClipboard;
  } else {
    delete clipboard.writeText;
    delete clipboard.readText;
  }
  browserFailures.clipboard = on;
}
