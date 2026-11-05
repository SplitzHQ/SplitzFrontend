import fs from "node:fs/promises";

import {
  aliasOf,
  ALPHA_ALIASES,
  BASE_STEPS,
  baseStep,
  COMPONENT_TOKENS,
  CORE_STEPS,
  newSemanticTokens,
  SCALE_FAMILIES,
  type ScaleName,
  scaleColors,
  type ScaleSource,
  semanticRef,
  themedRef,
  THEMES,
  type Theme,
  tokenName,
} from "./scales";

/**
 * Writes the `core-scale-*` tokens, the semantic tokens and the component tokens in the input files of
 * `scripts/css-var-to-tailwind`, and points the old `base-*` tokens at them. A second run gives the same result.
 * Run `bun run color-scales`.
 */

const inputFile = (theme: Theme) => `./scripts/css-var-to-tailwind/${theme}.txt`;

/** Reads the value of one token from the lines of an input file. */
function valueOf(lines: readonly string[], token: string): string {
  const line = lines.find((item) => item.startsWith(`--${token}:`));
  if (!line) throw new Error(`No token ${token} in the input file`);
  return line.slice(line.indexOf(":") + 1, line.lastIndexOf(";")).trim();
}

/** Returns the name of the token on a line of an input file. */
const tokenOf = (line: string) => line.slice(2, line.indexOf(":"));

/** Returns a copy of the lines with new lines after the last line that starts with a prefix. */
function insertAfterLast(lines: readonly string[], prefix: string, added: readonly string[]): string[] {
  const last = lines.findLastIndex((line) => line.startsWith(prefix));
  return [...lines.slice(0, last + 1), ...added, ...lines.slice(last + 1)];
}

/** Returns the lines of one theme with the new scales, the new tokens and the new links. */
function updatedLines(lines: readonly string[], theme: Theme, source: ScaleSource): string[] {
  const newSemantic = newSemanticTokens();
  const generated = new Set<string>([...newSemantic, ...Object.keys(COMPONENT_TOKENS)]);
  const kept = lines.filter((line) => !line.startsWith("--core-scale-") && !generated.has(tokenOf(line)));
  for (const token of Object.keys(BASE_STEPS)) valueOf(kept, token);
  const linked = kept.map((line) => {
    const token = tokenOf(line);
    const alphaAlias = ALPHA_ALIASES[token];
    if (alphaAlias) return `--${token}: var(--${alphaAlias});`;
    if (!(token in BASE_STEPS)) return line;
    return `--${token}: var(--${aliasOf(token) ?? tokenName(baseStep(token, theme))});`;
  });
  const scaleLines = (Object.keys(SCALE_FAMILIES) as ScaleName[]).flatMap((name) =>
    scaleColors(name, theme, source).map((color, index) => `--core-scale-${name}-${index + 1}: ${color};`)
  );
  const semanticLines = newSemantic.map((token) => `--${token}: var(--${tokenName(semanticRef(token, theme))});`);
  const componentLines = Object.entries(COMPONENT_TOKENS).map(
    ([token, value]) => `--${token}: var(--${tokenName(themedRef(value, theme))});`
  );
  return insertAfterLast(
    insertAfterLast(insertAfterLast(linked, "--comp-", componentLines), "--base-", semanticLines),
    "--core-color-",
    scaleLines
  );
}

const inputs = Object.fromEntries(
  await Promise.all(
    THEMES.map(async (theme) => [theme, (await fs.readFile(inputFile(theme), "utf8")).split("\n")] as const)
  )
) as Record<Theme, string[]>;

// The page colors of the scales. These tokens are fixed inputs: the generator changes `base-bg-primary`, so it cannot
// read the page color from that token.
const source: ScaleSource = {
  page: { dark: valueOf(inputs.light, "core-color-grey-950"), light: valueOf(inputs.light, "core-color-brand-25") },
  ramp: (family) => CORE_STEPS.map((step) => valueOf(inputs.light, `core-color-${family}-${step}`).toLowerCase()),
};

await Promise.all(
  THEMES.map((theme) => fs.writeFile(inputFile(theme), updatedLines(inputs[theme], theme, source).join("\n"), "utf8"))
);
