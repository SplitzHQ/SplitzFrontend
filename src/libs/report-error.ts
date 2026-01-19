export default function reportError(name: string, error: unknown): void {
  // For now, just log the error to the console
  console.error("An error occurred:", name, error);
}
