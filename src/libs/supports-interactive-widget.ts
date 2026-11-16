import type { BrowserName, SupportBlock } from "@mdn/browser-compat-data";
import Bowser from "bowser";

/** MDN support data for native keyboard resizing, supplied by Vite. */
declare const INTERACTIVE_WIDGET_SUPPORT: SupportBlock;

/** Returns whether a dotted browser version is at least the given MDN version. */
function isAtLeast(version: string, minimum: string): boolean {
  const actual = version.split(".").map(Number);
  const required = minimum
    .replace(/^\u2264/, "")
    .split(".")
    .map(Number);
  if ([...actual, ...required].some((part) => !Number.isFinite(part))) return false;
  for (let index = 0; index < Math.max(actual.length, required.length); index++) {
    const difference = (actual[index] ?? 0) - (required[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return true;
}

/** Checks MDN data for native keyboard resizing. Unknown browsers keep the viewport fallback. */
export function supportsInteractiveWidget(userAgent: string): boolean {
  const browser = Bowser.getParser(userAgent);
  const name = browser.getBrowserName();
  const os = browser.getOSName();
  let key: BrowserName | undefined;
  let version = browser.getBrowserVersion();

  if (os === "iOS") {
    // iOS browser versions (for example CriOS) are not the WebKit version. MDN uses the OS version.
    key = "safari_ios";
    version = browser.getOSVersion();
  } else if (os === "Android") {
    const androidBrowsers: Record<string, BrowserName> = {
      Chrome: "chrome_android",
      Firefox: "firefox_android",
      Opera: "opera_android",
      "Samsung Internet for Android": "samsunginternet_android",
    };
    key = androidBrowsers[name];
  } else if (name === "Safari") {
    key = "safari";
  }

  if (!key || !version || !/^\d+(\.\d+)*$/.test(version)) return false;
  const support = INTERACTIVE_WIDGET_SUPPORT[key];
  const statements = Array.isArray(support) ? support : [support];
  return statements.some(
    (statement) =>
      statement !== undefined &&
      typeof statement.version_added === "string" &&
      !statement.flags?.length &&
      !statement.prefix &&
      !statement.alternative_name &&
      !statement.partial_implementation &&
      isAtLeast(version, statement.version_added) &&
      (!statement.version_removed || !isAtLeast(version, statement.version_removed))
  );
}
