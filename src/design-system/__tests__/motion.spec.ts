import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { MOTION_DURATION_MS, MOTION_EASING, easingPoints, motionMs, motionSeconds } from "@/libs/motion";

import { declarations, ruleBody } from "../tokens";

/*
 * Motion checks: the script mirror matches the CSS tokens, reduced motion turns every duration off, and the number of
 * literal durations and curves outside the tokens can only go down.
 */

const SRC = join(__dirname, "..", "..");
const read = (path: string) => readFileSync(path, "utf8");
const rel = (path: string) => relative(SRC, path).split(sep).join("/");

const MOTION_CSS = read(join(SRC, "assets", "motion.css"));
const camel = (name: string) => name.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
const squash = (text: string | undefined) => text?.replace(/\s+/g, " ").trim();

const rootTokens = declarations(ruleBody(MOTION_CSS, ":root") ?? "");
const mediaBody = MOTION_CSS.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*:root\s*\{([^}]*)\}/)?.[1];
const debugBody = ruleBody(MOTION_CSS, ":root[data-reduce-motion]");

/**
 * The most lines with a literal duration or curve that the app may still have outside the motion tokens.
 * Lower it when you move a component to the tokens. Never raise it: use the tokens in new code.
 */
const MOTION_LITERALS_MAX = 40;

/** Lines that set a duration or curve with a literal value. Comments are not counted. */
const LITERAL_PATTERNS = [
  // CSS: cubic-bezier(…) anywhere, and transition / animation values with a time or an easing keyword
  /cubic-bezier\(/,
  /(?:transition|animation)[\w-]*\s*:[^;]*(?:(?<![\w.-])\d*\.?\d+m?s\b|\b(?:ease|ease-in|ease-out|ease-in-out|linear)\b)/,
  // CSS: the next lines of a multi-line transition, such as "transform 0.25s ease,"
  /^\s*[a-z-]+\s+\d*\.?\d+m?s\b/,
  // Tailwind: duration-200, ease-[…], ease-in, ease-out, ease-in-out
  /(?<![\w-])(?:duration-\d+|ease-\[|ease-(?:in|out|in-out)(?![\w-]))/,
  // motion-v and other script options: { duration: 0.2 }
  /duration:\s*\d/,
];

/** Returns the source files under a folder. The generated API client and the tests are left out. */
function filesOf(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (path === join(SRC, "backend") || path === join(SRC, "design-system", "__tests__")) return [];
    if (statSync(path).isDirectory()) return filesOf(path);
    if (!/\.(vue|ts|css|scss)$/.test(path) || /\.(spec|test|stories)\.ts$/.test(path)) return [];
    return [path];
  });
}

describe("motion tokens", () => {
  it("mirrors the CSS durations in src/libs/motion.ts", () => {
    const durations = Object.fromEntries(
      rootTokens.flatMap(([name, value]) => {
        const match = name.match(/^--motion-duration-([\w-]+)$/);
        const ms = value.match(/^calc\((\d+)ms \* var\(--motion-slow\)\)$/)?.[1];
        return match ? [[camel(match[1]), ms === undefined ? value : Number(ms)]] : [];
      })
    );
    expect(durations).toEqual({ ...MOTION_DURATION_MS });
  });

  it("mirrors the CSS curves in src/libs/motion.ts", () => {
    const easings = Object.fromEntries(
      rootTokens.flatMap(([name, value]) => {
        const match = name.match(/^--motion-easing-([\w-]+)$/);
        return match ? [[camel(match[1]), squash(value)]] : [];
      })
    );
    expect(easings).toEqual({ ...MOTION_EASING });
  });

  it("keeps the system and debug reduced-motion blocks identical", () => {
    expect(squash(mediaBody)).toBeTruthy();
    expect(squash(mediaBody)).toEqual(squash(debugBody));
  });

  it("sets every duration to 0ms under reduced motion", () => {
    const durations = rootTokens.map(([name]) => name).filter((name) => name.startsWith("--motion-duration-"));
    const reduced = Object.fromEntries(declarations(mediaBody ?? ""));
    expect(Object.keys(reduced).sort()).toEqual(durations.sort());
    expect(new Set(Object.values(reduced))).toEqual(new Set(["0ms"]));
  });
});

describe("motion helpers", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-reduce-motion");
    document.documentElement.style.removeProperty("--motion-slow");
    vi.unstubAllGlobals();
  });

  it("returns the token duration", () => {
    expect(motionMs("state")).toBe(MOTION_DURATION_MS.state);
    expect(motionSeconds("sheet")).toBe(MOTION_DURATION_MS.sheet / 1000);
  });

  it("returns 0 when <html data-reduce-motion> is set", () => {
    document.documentElement.setAttribute("data-reduce-motion", "");
    expect(motionMs("container")).toBe(0);
  });

  it("returns 0 when the system asks for reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") }));
    expect(motionMs("container")).toBe(0);
  });

  it("stretches durations by --motion-slow", () => {
    document.documentElement.style.setProperty("--motion-slow", "5");
    expect(motionMs("feedback")).toBe(MOTION_DURATION_MS.feedback * 5);
  });

  it("parses the four control points of each curve", () => {
    expect(easingPoints("enter")).toEqual([0.22, 1, 0.36, 1]);
    for (const key of Object.keys(MOTION_EASING) as (keyof typeof MOTION_EASING)[]) {
      expect(`cubic-bezier(${easingPoints(key).join(", ")})`).toBe(MOTION_EASING[key]);
    }
  });
});

describe("motion literals", () => {
  const offenders = filesOf(SRC).flatMap((path) => {
    if (path.endsWith(join("assets", "motion.css")) || path.endsWith(join("libs", "motion.ts"))) return [];
    return read(path)
      .split("\n")
      .filter((line) => !/^\s*(\/\/|\/?\*|<!--)/.test(line))
      .filter((line) => LITERAL_PATTERNS.some((pattern) => pattern.test(line)))
      .map((line) => `${rel(path)}: ${line.trim()}`);
  });

  it("does not add literal durations or curves outside the motion tokens", () => {
    // On failure, the message lists each line. Replace the literal with a --motion-* token or src/libs/motion.ts.
    expect(offenders.length, offenders.join("\n")).toBeLessThanOrEqual(MOTION_LITERALS_MAX);
  });

  it("has a limit that matches the current count, so a fix cannot be undone later", () => {
    // When this fails, lower MOTION_LITERALS_MAX to the new count.
    expect(MOTION_LITERALS_MAX, offenders.join("\n")).toBe(offenders.length);
  });

  it("keeps the design-system page free of literal values", () => {
    expect(offenders.filter((line) => line.startsWith("design-system/"))).toEqual([]);
  });
});
