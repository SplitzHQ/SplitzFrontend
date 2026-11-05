import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  COMPONENT_TOKEN_RULES,
  SEMANTIC_RULES,
  SEMANTIC_TOKENS as TOKENS_WITH_RULES,
  type SemanticToken,
} from "@/assets/color.usage";

import { contrast } from "./color-math";
import {
  aliasOf,
  ALPHA_ALIASES,
  BASE_STEPS,
  baseStep,
  COMPONENT_TOKENS,
  SEMANTIC_TOKENS,
  semanticRef,
  themedRef,
  THEMES,
  type Theme,
  tokenName,
} from "./scales";

/** Reads the tokens of one rule of `color.css`. */
function readRule(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return new Map(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1] as string, (match[2] as string).trim()])
  );
}

const css = readFileSync("src/assets/color.css", "utf8");
const TOKENS: Record<Theme, Map<string, string>> = { dark: readRule(css, ".dark"), light: readRule(css, ":root") };

/** Follows the `var()` links of a token to its color. */
function colorOf(theme: Theme, token: string): string {
  let value = TOKENS[theme].get(token);
  while (value?.startsWith("var(")) value = TOKENS[theme].get(value.slice("var(--".length, -1));
  if (!value) throw new Error(`No color for ${token}`);
  return value;
}

/** Returns the lowest contrast of a token on the page and on a card. */
function lowestOnSurfaces(theme: Theme, token: string): number {
  return Math.min(
    contrast(colorOf(theme, token), colorOf(theme, "base-bg-primary")),
    contrast(colorOf(theme, token), colorOf(theme, "base-bg-secondary"))
  );
}

/** Each level of text and the lowest contrast of its job. The values are design decisions. */
const TEXT_LEVELS = [
  { min: 12, token: "base-text-primary" },
  { min: 7, token: "base-text-secondary" },
  { min: 7, token: "base-text-tertiary" },
  { min: 3.9, token: "base-text-quaternary" },
  { min: 3.9, token: "base-text-quinary" },
  { min: 2.8, token: "base-text-placeholder" },
  { min: 7, token: "base-text-secondary" },
  { min: 3.9, token: "base-text-muted" },
  { min: 2.8, token: "base-text-disabled" },
];

const SEMANTIC_NAMES = Object.keys(SEMANTIC_TOKENS) as SemanticToken[];

describe.each(THEMES)("the color tokens in the %s theme", (theme) => {
  it.each(TEXT_LEVELS)("gives $token at least $min:1 on the page and on a card", ({ min, token }) => {
    expect(lowestOnSurfaces(theme, token)).toBeGreaterThanOrEqual(min);
  });

  it("keeps the color of each old base token", () => {
    for (const token of Object.keys(BASE_STEPS)) {
      expect(colorOf(theme, token)).toBe(colorOf(theme, tokenName(baseStep(token, theme))));
    }
  });

  it("points an old name at a semantic token when the color is the same", () => {
    for (const token of Object.keys(BASE_STEPS)) {
      const target = aliasOf(token) ?? tokenName(baseStep(token, theme));
      expect(TOKENS[theme].get(token)).toBe(`var(--${target})`);
    }
  });

  it("points each alpha alias at its semantic token", () => {
    for (const [token, target] of Object.entries(ALPHA_ALIASES)) {
      expect(TOKENS[theme].get(token)).toBe(`var(--${target})`);
    }
  });

  it("gives each semantic token the value of the plan", () => {
    const held = SEMANTIC_NAMES.filter((token) => {
      const planned = themedRef(SEMANTIC_TOKENS[token].value, theme);
      return colorOf(theme, token) !== colorOf(theme, tokenName(planned));
    });
    expect(held).toEqual([]);
  });

  it("gives each component token its value", () => {
    for (const [token, value] of Object.entries(COMPONENT_TOKENS)) {
      expect(TOKENS[theme].get(token)).toBe(`var(--${tokenName(themedRef(value, theme))})`);
    }
  });

  it("gives each status text 4.5:1 on its subtle fill", () => {
    for (const name of ["brand", "danger", "success", "warning"]) {
      const text = colorOf(theme, `base-text-${name}`);
      expect(contrast(text, colorOf(theme, `base-bg-${name}-subtle`))).toBeGreaterThan(4.5);
    }
  });

  it("gives the inverse text 4.5:1 on each solid fill", () => {
    for (const fill of ["base-bg-solid", "base-bg-brand-solid", "base-bg-danger-solid"]) {
      expect(contrast(colorOf(theme, "base-text-inverse"), colorOf(theme, fill))).toBeGreaterThan(4.5);
    }
  });

  it("gives the label of the destructive button 4.5:1 in each state, and a hover that shows", () => {
    const label = colorOf(theme, "base-text-primary-reverse");
    const states = ["base-bg-error-reverse", "base-bg-error-reverse_hover", "base-bg-error-reverse_pressed"];
    for (const state of states) expect(contrast(label, colorOf(theme, state))).toBeGreaterThan(4.5);
    const [rest, hover] = states.map((state) => colorOf(theme, state)) as [string, string];
    expect(contrast(rest, hover)).toBeGreaterThan(1.1);
  });

  it("gives the border of a selected item 3:1 on the page", () => {
    expect(contrast(colorOf(theme, "base-border-brand"), colorOf(theme, "base-bg-primary"))).toBeGreaterThan(3);
  });

  it("moves away from the page at each neutral step", () => {
    const page = colorOf(theme, "base-bg-primary");
    for (let step = 2; step <= 12; step++) {
      const previous = contrast(colorOf(theme, `core-scale-neutral-${step - 1}`), page);
      expect(contrast(colorOf(theme, `core-scale-neutral-${step}`), page)).toBeGreaterThan(previous - 0.02);
    }
  });

  it.each(["brand", "success", "warning"])("gives white text 4.5:1 on the solid step of %s", (name) => {
    expect(contrast("#ffffff", colorOf(theme, `core-scale-${name}-9`))).toBeGreaterThan(4.5);
  });

  it.each(["brand", "error", "success", "warning"])("gives step 11 of %s 4.5:1 on its subtle fill", (name) => {
    const text = colorOf(theme, `core-scale-${name}-11`);
    expect(contrast(text, colorOf(theme, `core-scale-${name}-3`))).toBeGreaterThan(4.5);
  });
});

describe("the color usage file", () => {
  it("has a rule for each semantic token", () => {
    expect([...TOKENS_WITH_RULES].sort()).toEqual([...SEMANTIC_NAMES].sort());
    for (const token of SEMANTIC_NAMES) {
      const rule = SEMANTIC_RULES[token];
      expect(rule.use && rule.avoid && rule.typical, token).toBeTruthy();
    }
  });

  it("gives the semantic tokens one value in the generator and in the CSS", () => {
    for (const theme of THEMES) {
      for (const token of SEMANTIC_NAMES) {
        expect(colorOf(theme, token)).toBe(colorOf(theme, tokenName(semanticRef(token, theme))));
      }
    }
  });

  it("puts each component token into exactly one group", () => {
    const groups = Object.values(COMPONENT_TOKEN_RULES);
    const names = [...TOKENS.light.keys()].filter((token) => token.startsWith("comp-"));
    const misplaced = names.filter((token) => groups.filter(({ pattern }) => pattern.test(token)).length !== 1);
    expect(names.length).toBeGreaterThan(0);
    expect(misplaced).toEqual([]);
  });
});

describe("the primary button", () => {
  it("keeps its color in both themes", () => {
    expect(colorOf("light", "base-bg-brand-reverse")).toBe("#4f635a");
    expect(colorOf("dark", "base-bg-brand-reverse")).toBe("#b2c3bb");
  });
});

describe("the color math", () => {
  it("finds the WCAG contrast of black and white", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21);
  });
});
