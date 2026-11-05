/**
 * The shapes that the `*.usage.ts` files share. The design-system pages read these shapes.
 * The app does not import this file.
 */

/** Where the rules of a usage file apply. */
export interface RuleScope {
  /** The rules for the phone app in `src/`. */
  app: string;
  /** Which rules apply to the desktop tools in `devtools/`. */
  devtools: string[];
}

/** One short rule with a title. */
export interface UsageRule {
  title: string;
  rule: string;
}

/** One case with the component to use instead. */
export interface UseInsteadRule {
  when: string;
  use: string;
}

/** One copy rule with an example that follows it and an example that breaks it. */
export interface CopyRule {
  title: string;
  rule: string;
  do: string[];
  dont: string[];
}

/** One accessibility fact, written for the people who use the component. */
export interface AccessibilityNote {
  title: string;
  text: string;
}
