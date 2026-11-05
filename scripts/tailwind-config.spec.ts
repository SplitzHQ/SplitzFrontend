// @vitest-environment node
import { execFileSync } from "node:child_process";
import process from "node:process";

import { describe, expect, it } from "vitest";

describe("tailwind.config.js", () => {
  // Tailwind reloads the config with a native import and a cache-busting query. If the native import fails, Tailwind
  // uses a fallback loader that keeps the old colors, so a running dev server does not make classes for new tokens.
  // Vitest changes the imports in this file, so only a separate Node process can test a native import.
  it("loads with a native import, so a running dev server sees new color tokens", () => {
    const configUrl = new URL("../tailwind.config.js", import.meta.url).href;
    const script = `const { default: config } = await import(${JSON.stringify(configUrl)});
      process.stdout.write(String(Object.keys(config.theme.colors).length));`;

    const output = execFileSync(process.execPath, ["--input-type=module", "--eval", script], { encoding: "utf8" });

    expect(Number(output)).toBeGreaterThan(0);
  });
});
