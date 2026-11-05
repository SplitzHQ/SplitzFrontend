// @vitest-environment node
import { resolve } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { applyFixes, type Canonicalize, findViolations, loadCanonicalize } from "../check-classes";

const TAILWIND_ENTRY = resolve(import.meta.dirname, "../../../src/assets/base.css");

describe("check-tailwind-classes", () => {
  let canonicalize: Canonicalize;

  beforeAll(async () => {
    canonicalize = await loadCanonicalize(TAILWIND_ENTRY);
  });

  /** Returns each reported class with its canonical form. */
  const report = (file: string, content: string) =>
    findViolations(file, content, canonicalize).map(({ candidate, canonical }) => [candidate, canonical]);

  it("uses the utilities and the theme of the app", () => {
    expect(canonicalize("h-[1.6875rem]")).toBe("h-6.75");
    expect(canonicalize("icon-[1rem]")).toBe("icon-4");
    expect(canonicalize("bg-base-bg-primary")).toBe("bg-base-bg-primary");
    expect(canonicalize("rounded-05xl")).toBe("rounded-05xl");
  });

  it("does not join classes", () => {
    expect(report("a.vue", '<template><div class="h-4 w-4" /></template>')).toEqual([]);
  });

  it("finds classes in a template and in script strings", () => {
    const content = `<script setup lang="ts">
const size = ok ? "w-[100%]" : "w-1/2";
</script>
<template>
  <div class="flex h-[1.6875rem]" :class="[active && 'mt-[16px]']" />
</template>
`;
    expect(report("a.vue", content)).toEqual([
      ["w-[100%]", "w-full"],
      ["h-[1.6875rem]", "h-6.75"],
      ["mt-[16px]", "mt-4"],
    ]);
  });

  it("finds classes in a TypeScript file", () => {
    expect(report("a.ts", 'export const ROW = "flex w-[26rem]";')).toEqual([["w-[26rem]", "w-104"]]);
  });

  it("reads only @apply in a style block", () => {
    const content = `<style lang="scss" scoped>
.a {
  flex-shrink: 0;
  @apply h-[1.6875rem] w-4;
}
</style>
`;
    expect(report("a.vue", content)).toEqual([["h-[1.6875rem]", "h-6.75"]]);
  });

  it("reads only @apply in a CSS file", () => {
    expect(report("a.css", ".a { flex-shrink: 0; @apply mt-[16px]; }")).toEqual([["mt-[16px]", "mt-4"]]);
  });

  it("gives the line and column of a class after non-ASCII text", () => {
    const content = `<template>\n  <p title="账单 “一”" class="w-[100%]" />\n</template>\n`;
    const [violation] = findViolations("a.vue", content, canonicalize);

    expect(violation).toMatchObject({ candidate: "w-[100%]", column: 28, line: 2 });
  });

  it("replaces each class and keeps the other text", () => {
    const content = `<template>
  <p title="账单 “一”" class="w-[100%] mt-[16px] flex" />
</template>
<style scoped>
.a {
  flex-shrink: 0;
  @apply h-[1.6875rem];
}
</style>
`;
    const fixed = applyFixes(content, findViolations("a.vue", content, canonicalize));

    expect(fixed).toBe(`<template>
  <p title="账单 “一”" class="w-full mt-4 flex" />
</template>
<style scoped>
.a {
  flex-shrink: 0;
  @apply h-6.75;
}
</style>
`);
    expect(findViolations("a.vue", fixed, canonicalize)).toEqual([]);
  });

  it("stops when the file does not hold the class at the offset", () => {
    const violation = { candidate: "w-[100%]", canonical: "w-full", column: 1, line: 1, offset: 0 };

    expect(() => applyFixes("other text", [violation])).toThrow('Expected "w-[100%]"');
  });
});
