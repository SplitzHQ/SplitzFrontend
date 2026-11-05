// @vitest-environment node
import { RuleTester } from "oxlint/plugins-dev";
import { describe, expect, it } from "vitest";

import plugin from "../index";
import { canonicalize, tailwindCanonicalClasses } from "../tailwind-canonical-classes";

RuleTester.describe = describe;
RuleTester.it = it;

describe("canonicalize", () => {
  it("uses the utilities and the theme of the app", () => {
    expect(canonicalize("h-[1.6875rem]")).toBe("h-6.75");
    expect(canonicalize("icon-[1rem]")).toBe("icon-4");
    expect(canonicalize("bg-base-bg-primary")).toBe("bg-base-bg-primary");
    expect(canonicalize("rounded-05xl")).toBe("rounded-05xl");
  });
});

describe("plugin", () => {
  it("names the rule with the splitz prefix", () => {
    expect(plugin.meta.name).toBe("splitz");
    expect(plugin.rules["tailwind-canonical-classes"]).toBe(tailwindCanonicalClasses);
  });
});

// The columns of `RuleTester` start at 0. The `oxlint` command shows them from 1.
new RuleTester().run("tailwind-canonical-classes", tailwindCanonicalClasses, {
  invalid: [
    {
      code: 'export const ROW = "flex w-[26rem]";',
      errors: [{ column: 25, endColumn: 34, line: 1, message: "`w-[26rem]` has a canonical form: `w-104`." }],
      filename: "a.ts",
      name: "replaces a class in a string",
      output: 'export const ROW = "flex w-104";',
    },
    {
      code: 'const a = (ok: boolean) => (ok ? "w-[100%]" : `mt-[16px] ${"flex"}`);',
      errors: [{ message: /`w-\[100%\]`/ }, { message: /`mt-\[16px\]`/ }],
      filename: "a.ts",
      name: "replaces classes in each string of an expression",
      output: 'const a = (ok: boolean) => (ok ? "w-full" : `mt-4 ${"flex"}`);',
    },
    {
      code: '// 账单 “一”\nconst a = "h-[1.6875rem]";',
      errors: [{ column: 11, line: 2, messageId: "canonical" }],
      filename: "a.ts",
      name: "gives the line and column of a class after non-ASCII text",
      output: '// 账单 “一”\nconst a = "h-6.75";',
    },
  ],
  valid: [
    { code: 'const a = "h-4 w-4";', filename: "a.ts", name: "does not join classes" },
    { code: 'const a = "flex bg-base-bg-primary rounded-05xl";', filename: "a.ts", name: "keeps canonical classes" },
  ],
});
