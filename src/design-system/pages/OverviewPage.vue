<script setup lang="ts">
import DocSection from "../components/DocSection.vue";

/** Where each part of the design system lives. */
const FILES = [
  [
    "scripts/css-var-to-tailwind/",
    "Source of the color tokens: light.txt and dark.txt. The script writes the next two files.",
  ],
  [
    "src/assets/color.css",
    "Color tokens: core scales, then base, util and comp tokens. Light in :root, dark in .dark.",
  ],
  ["tailwind.config.colors.js", "Maps each color token to a Tailwind color, so bg-base-bg-primary works."],
  ["tailwind.config.js", "Type scale, font family, extra radius and z-index layers."],
  ["src/assets/motion.css", "Motion tokens: durations, curves and the reduced-motion rules."],
  ["src/libs/motion.ts", "The motion tokens for script code: motionMs(), easingPoints(), scrollBehavior()."],
  ["src/design-system/tokens.ts", "Sorts the tokens into groups for this page. The values come from the live CSS."],
  [
    "src/design-system/__tests__/",
    "Token and motion tests. They fail when the CSS, Tailwind and the registry disagree.",
  ],
] as const;

const LAYERS = [
  ["core", "Literal values. Only color.css holds hex codes. They do not change with the theme."],
  ["base", "Semantic roles: text, fg, border, bg. They point to core tokens and flip in dark mode."],
  ["util", "Full color scales that flip in dark mode. Use them for tinted badges and notices."],
  ["comp", "Colors that belong to one component."],
] as const;

const RULES = [
  "In components, use base and util tokens through Tailwind classes. Do not write hex or rgb values.",
  "To add a color token, add it to light.txt and dark.txt, then run bun run css-var-to-tailwind. Do not edit color.css by hand.",
  "Use the motion tokens for every duration and curve. A test counts the literal values that are left and fails when the count goes up.",
  "Use flex gap or grid gap for space between elements, not margins.",
  "Before you build a component, look for an existing one under src/components.",
] as const;
</script>

<template>
  <div class="flex flex-col gap-10">
    <DocSection
      title="What this page is"
      summary="A living reference for the SplitZ tokens and components. It renders the real CSS and components, so it always shows what the app ships. Only the dev server serves it. For component stories with controls, run bun storybook."
    />
    <DocSection title="Token layers">
      <dl class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="[name, text] in LAYERS"
          :key="name"
          class="flex flex-col gap-1 rounded-2xl border border-base-border-tertiary p-4"
        >
          <dt class="font-mono text-sm font-semibold text-base-text-brand">--{{ name }}-*</dt>
          <dd class="text-sm text-base-text-secondary">{{ text }}</dd>
        </div>
      </dl>
    </DocSection>
    <DocSection title="Files">
      <ul class="flex flex-col divide-y divide-base-border-tertiary rounded-2xl border border-base-border-tertiary">
        <li v-for="[file, text] in FILES" :key="file" class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
          <code class="shrink-0 font-mono text-xs text-base-text-primary sm:w-64">{{ file }}</code>
          <span class="text-sm text-base-text-tertiary">{{ text }}</span>
        </li>
      </ul>
    </DocSection>
    <DocSection title="Rules">
      <ul class="flex list-disc flex-col gap-2 pl-5 text-sm text-base-text-secondary">
        <li v-for="rule in RULES" :key="rule">{{ rule }}</li>
      </ul>
    </DocSection>
  </div>
</template>
