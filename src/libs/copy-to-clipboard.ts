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
