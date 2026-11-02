import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import {
  RADIUS_SCALE,
  TOKEN_GROUPS,
  TYPE_SCALE,
  Z_INDEX_SCALE,
  declarations,
  declaredTokens,
  groupsOf,
  ruleBody,
} from "../tokens";

/*
 * Token checks. The CSS files are the source of truth. These tests fail when the registry, the Tailwind config or the
 * components disagree with them.
 */

const ROOT = join(__dirname, "..", "..", "..");
const SRC = join(ROOT, "src");
const read = (path: string) => readFileSync(path, "utf8");

const COLOR_CSS = read(join(SRC, "assets", "color.css"));
const MOTION_CSS = read(join(SRC, "assets", "motion.css"));
const declared = [...declaredTokens(COLOR_CSS), ...declaredTokens(MOTION_CSS)];
const declaredSet = new Set(declared);

/** Lowercases the values of declarations. The formatter writes hex codes in lower case, so compare without case. */
const lower = (pairs: [string, string][]) => pairs.map(([name, value]) => [name, value.toLowerCase()]);

/** Token prefixes that this design system owns. Other custom properties (Tailwind, reka-ui) are not checked. */
const OWN_PREFIX = /^--(core|base|util|comp|motion)-|^--(white|black)$/;

/** Returns the source files under a folder. The generated API client is left out. */
function filesOf(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (path === join(SRC, "backend")) return [];
    if (statSync(path).isDirectory()) return filesOf(path, ext);
    return ext.test(path) ? [path] : [];
  });
}
const sourceFiles = filesOf(SRC, /\.(vue|ts|css|scss)$/).filter((path) => !/\.(spec|test)\.ts$/.test(path));

/** Loads a JS config file from the project root. A variable path keeps TypeScript from asking for its types. */
async function loadConfig<T>(file: string): Promise<T> {
  const url = pathToFileURL(join(ROOT, file)).href;
  return ((await import(/* @vite-ignore */ url)) as { default: T }).default;
}

describe("token registry", () => {
  it("puts each declared token into exactly one group", () => {
    const misplaced = declared
      .map((token) => [token, groupsOf(token).map((group) => group.id)] as const)
      .filter(([, groups]) => groups.length !== 1);
    expect(misplaced).toEqual([]);
  });

  it("has no empty group", () => {
    const empty = TOKEN_GROUPS.filter((group) => !declared.some((token) => group.pattern.test(token)));
    expect(empty.map((group) => group.id)).toEqual([]);
  });

  it("finds each group's tokens in the file the group names", () => {
    const sheets = { "color.css": declaredTokens(COLOR_CSS), "motion.css": declaredTokens(MOTION_CSS) };
    const wrong = TOKEN_GROUPS.filter((group) => !sheets[group.file].some((token) => group.pattern.test(token)));
    expect(wrong.map((group) => group.id)).toEqual([]);
  });
});

describe("color tokens", () => {
  const light = declarations(ruleBody(COLOR_CSS, ":root") ?? "");
  const dark = declarations(ruleBody(COLOR_CSS, ".dark") ?? "");

  it("declares the same tokens in the light and dark themes", () => {
    expect(light.length).toBeGreaterThan(0);
    expect(dark.map(([name]) => name).sort()).toEqual(light.map(([name]) => name).sort());
  });

  it("keeps literal colors in the primitive layer only", () => {
    const literal = [...light, ...dark].filter(([name, value]) => {
      const primitive = /^--core-|^--(white|black)$/.test(name);
      return !primitive && !/^var\(--[\w-]+\)$/.test(value);
    });
    expect(literal).toEqual([]);
  });

  it("points semantic tokens only to declared tokens", () => {
    const broken = [...light, ...dark].filter(([, value]) => {
      const target = value.match(/^var\((--[\w-]+)\)$/)?.[1];
      return target !== undefined && !declaredSet.has(target);
    });
    expect(broken).toEqual([]);
  });

  it("matches the generator input in scripts/css-var-to-tailwind", () => {
    const script = join(ROOT, "scripts", "css-var-to-tailwind");
    expect(lower(light)).toEqual(lower(declarations(read(join(script, "light.txt")))));
    expect(lower(dark)).toEqual(lower(declarations(read(join(script, "dark.txt")))));
  });

  it("maps each color token to a Tailwind color with the same name", async () => {
    const colors = await loadConfig<Record<string, string>>("tailwind.config.colors.js");
    const wrong = Object.entries(colors).filter(([key, value]) => value !== `var(--${key})`);
    expect(wrong).toEqual([]);
    expect(Object.keys(colors).sort()).toEqual(light.map(([name]) => name.slice(2)).sort());
  });
});

describe("token usage", () => {
  it("references only declared tokens through var()", () => {
    const unknown = sourceFiles.flatMap((path) =>
      [...read(path).matchAll(/var\((--[\w-]+)/g)]
        .map((match) => match[1])
        .filter((token) => OWN_PREFIX.test(token) && !declaredSet.has(token))
        .map((token) => `${path.slice(ROOT.length + 1)}: ${token}`)
    );
    expect(unknown).toEqual([]);
  });

  it("uses only Tailwind color classes that exist", async () => {
    const colors = new Set(Object.keys(await loadConfig<Record<string, string>>("tailwind.config.colors.js")));
    // bg-base-bg-primary, hover:text-util-color-error-600, border-t-base-border-primary, ring-core-alpha-brand-5/50
    const CLASS =
      /(?<![\w-])(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|divide|fill|stroke|from|via|to|shadow|decoration|placeholder|caret|accent)-((?:core|base|util|comp)-[\w-]+?)(?:\/\d+)?(?![\w-])/g;
    const unknown = sourceFiles
      .filter((path) => /\.(vue|ts)$/.test(path))
      .flatMap((path) =>
        [...read(path).matchAll(CLASS)]
          .map((match) => match[1])
          .filter((color) => !colors.has(color))
          .map((color) => `${path.slice(ROOT.length + 1)}: ${color}`)
      );
    expect(unknown).toEqual([]);
  });
});

describe("foundation scales", () => {
  interface TailwindConfig {
    theme: { fontSize: Record<string, unknown>; extend: { borderRadius: object; zIndex: object } };
  }

  it("lists the type scale of tailwind.config.js in the same order", async () => {
    const { theme } = await loadConfig<TailwindConfig>("tailwind.config.js");
    expect(TYPE_SCALE.map((step) => step.key)).toEqual(Object.keys(theme.fontSize));
  });

  it("lists each radius that tailwind.config.js adds", async () => {
    const { theme } = await loadConfig<TailwindConfig>("tailwind.config.js");
    const listed = new Set<string>(RADIUS_SCALE.map((step) => step.key));
    expect(Object.keys(theme.extend.borderRadius).filter((key) => !listed.has(key))).toEqual([]);
  });

  it("lists the z-index layers of tailwind.config.js in the same order", async () => {
    const { theme } = await loadConfig<TailwindConfig>("tailwind.config.js");
    expect(Z_INDEX_SCALE.map((step) => step.key)).toEqual(Object.keys(theme.extend.zIndex));
  });
});
