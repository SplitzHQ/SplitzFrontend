/**
 * Finds Tailwind classes that have a shorter or more standard form, for example `h-[1.6875rem]`, which is `h-6.75`.
 * This is the check that the Tailwind VS Code plugin reports as `suggestCanonicalClasses`.
 *
 * Oxlint has no rule for this and does not give a plugin the Vue template, so this check is a script.
 * `__unstable__loadDesignSystem` is not a stable Tailwind API. If a Tailwind update changes it, the tests of this file fail.
 */
import { readFileSync } from "node:fs";
import { dirname } from "node:path";

import { __unstable__loadDesignSystem as loadDesignSystem } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

/** The root font size. It lets the check compare `px` and `rem` values with the spacing scale. */
const ROOT_FONT_SIZE_PX = 16;

const STYLE_BLOCK = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g;
const APPLY_RULE = /@apply\s+([^;}]+)/g;

/** One class that has a canonical form. */
export interface ClassViolation {
  /** The class in the file. */
  candidate: string;
  /** The canonical form of the class. */
  canonical: string;
  /** The index of the class in the string that holds the file. */
  offset: number;
  /** The line of the class. The first line is 1. */
  line: number;
  /** The column of the class. The first column is 1. */
  column: number;
}

/** Returns the canonical form of one class. A class with no other form, or an unknown word, comes back unchanged. */
export type Canonicalize = (candidate: string) => string;

/** Loads the theme of a Tailwind entry CSS file, with its `@config`, `@theme` and `@utility` rules. */
export async function loadCanonicalize(cssPath: string): Promise<Canonicalize> {
  const designSystem = await loadDesignSystem(readFileSync(cssPath, "utf8"), { base: dirname(cssPath) });
  const results = new Map<string, string>();

  return (candidate) => {
    let result = results.get(candidate);
    if (result === undefined) {
      // One class at a time, so `h-4 w-4` stays as written. This check does not join classes into `size-4`.
      result = designSystem.canonicalizeCandidates([candidate], { rem: ROOT_FONT_SIZE_PX })[0] ?? candidate;
      results.set(candidate, result);
    }
    return result;
  };
}

/** Replaces text with spaces and keeps each line break, so the offsets of the other text do not change. */
function blank(text: string): string {
  return text.replace(/[^\r\n]/g, " ");
}

/**
 * Keeps only the classes of `@apply` rules. The scanner reads all words as classes, so it reads a CSS property such as
 * `flex-shrink` as the class `flex-shrink`, which has the canonical form `shrink`.
 */
function keepApplyClasses(css: string): string {
  let result = "";
  let end = 0;
  for (const match of css.matchAll(APPLY_RULE)) {
    const classes = match[1] ?? "";
    const classesStart = match.index + match[0].length - classes.length;
    result += blank(css.slice(end, classesStart)) + classes;
    end = classesStart + classes.length;
  }
  return result + blank(css.slice(end));
}

/** Returns the text that the scanner must read, and the type of file that the scanner must read it as. */
function prepareForScanner(filePath: string, content: string): { content: string; extension: string } {
  const extension = filePath.split(".").pop() ?? "";
  if (extension === "css" || extension === "scss") {
    return { content: keepApplyClasses(content), extension: "html" };
  }
  if (extension === "vue") {
    const withoutStyles = content.replace(
      STYLE_BLOCK,
      (_match, open: string, css: string, close: string) => blank(open) + keepApplyClasses(css) + blank(close)
    );
    return { content: withoutStyles, extension };
  }
  return { content, extension };
}

/** Returns the classes of a file that have a canonical form, in the order of the file. */
export function findViolations(filePath: string, content: string, canonicalize: Canonicalize): ClassViolation[] {
  const candidates = new Scanner({}).getCandidatesWithPositions(prepareForScanner(filePath, content));

  const violations: ClassViolation[] = [];
  for (const { candidate, position } of candidates) {
    const canonical = canonicalize(candidate);
    if (canonical === candidate) continue;

    const linesBefore = content.slice(0, position).split("\n");
    violations.push({
      candidate,
      canonical,
      column: (linesBefore.at(-1)?.length ?? 0) + 1,
      line: linesBefore.length,
      offset: position,
    });
  }
  return violations.toSorted((a, b) => a.offset - b.offset);
}

/** Returns the content of a file with each class replaced by its canonical form. */
export function applyFixes(content: string, violations: ClassViolation[]): string {
  let result = content;
  // From the end of the file, because a replacement moves the offsets after it.
  for (const { candidate, canonical, offset } of violations.toReversed()) {
    const end = offset + candidate.length;
    if (result.slice(offset, end) !== candidate) {
      throw new Error(`Expected "${candidate}" at offset ${offset}.`);
    }
    result = result.slice(0, offset) + canonical + result.slice(end);
  }
  return result;
}
