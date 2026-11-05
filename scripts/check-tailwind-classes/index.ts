/**
 * Reports Tailwind classes in `src/` that have a canonical form, and exits with code 1 if it finds one.
 *
 * - `bun run lint:tailwind` checks all files.
 * - `bun run lint:tailwind --fix` replaces each class with its canonical form.
 * - Paths after the options limit the check to these files. Paths outside the checked files are ignored.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import { applyFixes, findViolations, loadCanonicalize } from "./check-classes";

const ROOT = resolve(import.meta.dirname, "../..");
const TAILWIND_ENTRY = resolve(ROOT, "src/assets/base.css");
const CHECKED_EXTENSIONS = /\.(vue|ts|css|scss)$/;

/** Returns true for a path in `src/` that can hold classes. The generated API client and type files cannot. */
function isCheckedFile(path: string): boolean {
  const relativePath = relative(ROOT, path).replaceAll("\\", "/");
  return (
    relativePath.startsWith("src/") &&
    !relativePath.startsWith("src/backend/") &&
    !relativePath.endsWith(".d.ts") &&
    CHECKED_EXTENSIONS.test(relativePath)
  );
}

/** Returns the files to check: the given paths, or all files in `src/`. */
function listFiles(paths: string[]): string[] {
  const candidates =
    paths.length > 0
      ? paths.map((path) => resolve(path))
      : readdirSync(resolve(ROOT, "src"), { recursive: true, encoding: "utf8" }).map((path) =>
          resolve(ROOT, "src", path)
        );
  return candidates.filter(isCheckedFile).toSorted();
}

const args = process.argv.slice(2);
const shouldFix = args.includes("--fix");
const files = listFiles(args.filter((arg) => arg !== "--fix"));
const canonicalize = await loadCanonicalize(TAILWIND_ENTRY);

let violationCount = 0;
for (const file of files) {
  const content = readFileSync(file, "utf8");
  const violations = findViolations(file, content, canonicalize);
  if (violations.length === 0) continue;

  if (shouldFix) {
    writeFileSync(file, applyFixes(content, violations));
    console.log(`${relative(ROOT, file)}: fixed ${violations.length}`);
    continue;
  }

  violationCount += violations.length;
  for (const { candidate, canonical, column, line } of violations) {
    console.error(`${relative(ROOT, file)}:${line}:${column}  ${candidate} -> ${canonical}`);
  }
}

if (violationCount > 0) {
  console.error(`\n${violationCount} Tailwind classes have a canonical form. Run: bun run lint:tailwind --fix`);
  process.exitCode = 1;
}
