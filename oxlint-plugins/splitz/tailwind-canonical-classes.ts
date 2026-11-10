/**
 * The Oxlint rule `splitz/tailwind-canonical-classes`. It reports Tailwind classes that have a shorter or more standard
 * form, for example `h-[1.6875rem]`, which is `h-6.75`. `oxlint --fix` replaces them.
 * This is the check that the Tailwind VS Code plugin reports as `suggestCanonicalClasses`.
 *
 * Oxlint gives a rule only the `<script>` block of a `.vue` file and does not lint CSS files. So this rule checks
 * `.ts` files and Vue `<script>` blocks. It does not check templates, `<style>` blocks or CSS files.
 *
 * The rule checks only the text in string literals and template literals. Other code can look like a class:
 * `!icon` is a JS negation, but Tailwind reads it as `icon` with the important modifier and gives `icon!`.
 * That fix makes a non-null assertion, which changes the logic. lint-staged runs `oxlint --fix` before each commit,
 * so the change would go into the commit without notice.
 *
 * `__unstable__loadDesignSystem` is not a stable Tailwind API. If a Tailwind update changes it, the tests of this file fail.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { __unstable__loadDesignSystem as loadDesignSystem } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import type { RuleTester } from "oxlint/plugins-dev";

/** The rule type of Oxlint. The package does not export it by name. */
export type Rule = Parameters<RuleTester["run"]>[1];

/** Returns the canonical form of one class. A class with no other form, or an unknown word, comes back unchanged. */
type Canonicalize = (candidate: string) => string;

/** The Tailwind entry CSS file of the app. The rule uses its theme. */
const TAILWIND_ENTRY = resolve(import.meta.dirname, "../../src/assets/base.css");

/** The root font size. It lets the rule compare `px` and `rem` values with the spacing scale. */
const ROOT_FONT_SIZE_PX = 16;

/** Loads the theme of a Tailwind entry CSS file, with its `@config`, `@theme` and `@utility` rules. */
async function loadCanonicalize(cssPath: string): Promise<Canonicalize> {
  const designSystem = await loadDesignSystem(readFileSync(cssPath, "utf8"), { base: dirname(cssPath) });
  const results = new Map<string, string>();

  return (candidate) => {
    let result = results.get(candidate);
    if (result === undefined) {
      // One class at a time, so `h-4 w-4` stays as written. This rule does not join classes into `size-4`.
      result = designSystem.canonicalizeCandidates([candidate], { rem: ROOT_FONT_SIZE_PX })[0] ?? candidate;
      results.set(candidate, result);
    }
    return result;
  };
}

/**
 * Returns the canonical form of one class with the theme of the app.
 * Oxlint runs `create` without `await`, so the theme loads one time, when Oxlint imports the plugin.
 */
export const canonicalize = await loadCanonicalize(TAILWIND_ENTRY);

/** The start and end offsets of a part of the source text. The end is not in the part. */
type TextRange = readonly [start: number, end: number];

/** Tells if the text from `start` to `end` is fully in one of the ranges. */
function isInRanges(ranges: readonly TextRange[], start: number, end: number): boolean {
  return ranges.some(([rangeStart, rangeEnd]) => rangeStart <= start && end <= rangeEnd);
}

/** Returns the type of file that the scanner reads the code as. The code of a `.vue` file is its `<script>` block. */
function scannerExtension(filename: string): string {
  const extension = filename.split(".").pop() ?? "";
  return extension === "vue" ? "ts" : extension;
}

export const tailwindCanonicalClasses: Rule = {
  create(context) {
    /** The ranges of the string literals and the template literal parts. Only classes in these ranges are reported. */
    const stringRanges: TextRange[] = [];

    return {
      Literal(node) {
        if (typeof node.value === "string") stringRanges.push([node.start, node.end]);
      },
      // The scanner reads the full text, so that it splits the words the same way in each string.
      // The check runs on exit, after the other visitors collect all the string ranges.
      "Program:exit"() {
        const { sourceCode } = context;
        const { text } = sourceCode;
        const candidates = new Scanner({}).getCandidatesWithPositions({
          content: text,
          extension: scannerExtension(context.filename),
        });

        for (const { candidate, position } of candidates) {
          const end = position + candidate.length;
          // The scanner can split or join words in a different way from the file. Do not report a class that is not at its position.
          if (text.slice(position, end) !== candidate) continue;
          // Code outside a string, such as the negation `!icon`, is not a class.
          if (!isInRanges(stringRanges, position, end)) continue;

          const canonical = canonicalize(candidate);
          if (canonical === candidate) continue;

          context.report({
            data: { candidate, canonical },
            fix: (fixer) => fixer.replaceTextRange([position, end], canonical),
            loc: { end: sourceCode.getLocFromIndex(end), start: sourceCode.getLocFromIndex(position) },
            messageId: "canonical",
          });
        }
      },
      TemplateElement(node) {
        stringRanges.push([node.start, node.end]);
      },
    };
  },
  meta: {
    docs: { description: "Report Tailwind classes that have a canonical form." },
    fixable: "code",
    messages: { canonical: "`{{candidate}}` has a canonical form: `{{canonical}}`." },
    type: "suggestion",
  },
};
