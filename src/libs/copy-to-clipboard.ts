/** Copies text to the clipboard; resolves false (instead of throwing) when the browser refuses. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await globalThis.navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Clipboard write failed", error);
    return false;
  }
}

/**
 * Copies a text that a request still has to give, for example a new invite link. Resolves false when the request or
 * the browser fails.
 *
 * Safari allows a copy only during the tap. A request ends after the tap, so this function starts the copy at once with
 * a `ClipboardItem` whose content is the promise. A browser without `ClipboardItem` copies the text when it arrives.
 */
export async function copyFromRequest(text: Promise<string>): Promise<boolean> {
  const clipboard = globalThis.navigator.clipboard;
  try {
    if (typeof ClipboardItem !== "undefined" && typeof clipboard.write === "function") {
      const blob = text.then((value) => new Blob([value], { type: "text/plain" }));
      await clipboard.write([new ClipboardItem({ "text/plain": blob })]);
      return true;
    }
    await clipboard.writeText(await text);
    return true;
  } catch (error) {
    console.error("Clipboard write failed", error);
    return false;
  }
}
