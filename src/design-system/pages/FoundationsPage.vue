<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";

import DocSection from "../components/DocSection.vue";
import { FONT_WEIGHTS, RADIUS_SCALE, SPACING_SCALE, TYPE_SCALE, Z_INDEX_SCALE } from "../tokens";

const root = useTemplateRef<HTMLElement>("root");

/**
 * The values that the browser computed for each sample, keyed by its `data-measure` attribute.
 * The page shows these instead of copies of the config, so it cannot drift from the real CSS.
 */
const measured = ref(new Map<string, string>());

/** Reads the CSS properties that describe each kind of sample. */
function measure(element: HTMLElement): string {
  const style = getComputedStyle(element);
  switch (element.dataset.kind) {
    case "type":
      return `${style.fontSize} / ${style.lineHeight}${style.letterSpacing === "normal" ? "" : ` · ${style.letterSpacing}`}`;
    case "weight":
      return style.fontWeight;
    case "space":
      return style.width;
    case "radius":
      // rounded-full is calc(infinity * 1px), which the browser reports as a very large number
      return Number.parseFloat(style.borderTopLeftRadius) > 10_000 ? "pill" : style.borderTopLeftRadius;
    default:
      return style.zIndex;
  }
}

onMounted(() => {
  const elements = root.value?.querySelectorAll<HTMLElement>("[data-measure]") ?? [];
  measured.value = new Map([...elements].map((element) => [element.dataset.measure!, measure(element)]));
});
</script>

<template>
  <div ref="root" class="flex flex-col gap-10">
    <DocSection title="Type scale" tag="tailwind.config.js · fontSize" summary="Font: Manrope, 200 to 800.">
      <ul class="flex flex-col divide-y divide-base-border-tertiary">
        <li
          v-for="{ className, key } in TYPE_SCALE"
          :key="key"
          class="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6"
        >
          <span class="flex shrink-0 flex-col gap-0.5 sm:w-44">
            <code class="font-mono text-xs font-semibold">{{ className }}</code>
            <span class="font-mono text-[11px] text-base-text-tertiary">{{ measured.get(`type-${key}`) }}</span>
          </span>
          <span :class="[className, 'min-w-0 truncate']" :data-measure="`type-${key}`" data-kind="type">
            Dinner at Lotus · ¥ 1,280.50
          </span>
        </li>
      </ul>
    </DocSection>

    <DocSection title="Font weights">
      <div class="flex flex-wrap gap-6">
        <div v-for="{ className, key } in FONT_WEIGHTS" :key="key" class="flex flex-col gap-1">
          <span :class="[className, 'text-display-xs']" :data-measure="`weight-${key}`" data-kind="weight">Aa 12</span>
          <code class="font-mono text-xs text-base-text-tertiary">
            {{ className }} · {{ measured.get(`weight-${key}`) }}
          </code>
        </div>
      </div>
    </DocSection>

    <DocSection
      title="Spacing"
      tag="--spacing · 4px"
      summary="Tailwind multiplies --spacing by the step. Use the steps for padding, sizes and flex or grid gap."
    >
      <ul class="flex flex-col gap-2">
        <li v-for="{ className, key } in SPACING_SCALE" :key="key" class="flex items-center gap-4">
          <code class="w-10 shrink-0 font-mono text-xs font-semibold">{{ key }}</code>
          <span class="w-12 shrink-0 font-mono text-[11px] text-base-text-tertiary">
            {{ measured.get(`space-${key}`) }}
          </span>
          <span
            :class="[className, 'block h-3 rounded-sm bg-util-color-brand-500']"
            :data-measure="`space-${key}`"
            data-kind="space"
          />
        </li>
      </ul>
    </DocSection>

    <DocSection title="Radius" summary="Buttons, inputs and chips are rounded-full. Cards and sheets use 2xl or 3xl.">
      <div class="flex flex-wrap gap-4">
        <div v-for="{ className, key } in RADIUS_SCALE" :key="key" class="flex flex-col items-center gap-2">
          <span
            :class="[className, 'block size-16 border border-base-border-brand bg-base-bg-brand']"
            :data-measure="`radius-${key}`"
            data-kind="radius"
          />
          <code class="font-mono text-xs">{{ key }}</code>
          <span class="font-mono text-[11px] text-base-text-tertiary">{{ measured.get(`radius-${key}`) }}</span>
        </div>
      </div>
    </DocSection>

    <DocSection
      title="Layers"
      tag="tailwind.config.js · zIndex"
      summary="Stacking order for floating UI, from low to high. Use these names, not numbers."
    >
      <ul class="flex flex-col divide-y divide-base-border-tertiary rounded-2xl border border-base-border-tertiary">
        <li v-for="{ className, key } in Z_INDEX_SCALE" :key="key" class="flex items-center justify-between px-4 py-2">
          <code class="font-mono text-xs font-semibold">{{ className }}</code>
          <span class="font-mono text-xs text-base-text-tertiary">{{ measured.get(`z-${key}`) }}</span>
          <span :class="[className, 'hidden']" :data-measure="`z-${key}`" data-kind="z" />
        </li>
      </ul>
    </DocSection>
  </div>
</template>
