<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { computed, useTemplateRef } from "vue";

import {
  PATTERN_COLORS,
  patternShapes,
  type AppPattern,
  type AppPatternFade,
  type PatternShape,
} from "./brand-pattern";

/**
 * A brand pattern that fills its box. See `brand-pattern.usage.ts`. The parent gives the box its place and its size.
 * The view box takes the size of the box in CSS pixels, so the shapes keep their size when the box changes size. The
 * pattern is decoration: it has no ground, it takes no taps and a screen reader skips it.
 */
const { pattern } = defineProps<{
  /** The pattern to draw, for example `SIGN_IN_PATTERN`. */
  pattern: AppPattern;
}>();

/**
 * The CSS mask of each fade. A mask on the box, not in the SVG, keeps the fade the same size as the box.
 * `corner` keeps the shapes near the top right corner and clears them toward the bottom left.
 */
const FADE_MASKS: Record<AppPatternFade, string | undefined> = {
  corner: "radial-gradient(circle at 100% 0%, black 12%, transparent 70%)",
  none: undefined,
};

const box = useTemplateRef<HTMLElement>("box");
const { width, height } = useElementSize(box);

const size = computed(() => ({
  height: Math.max(1, Math.round(height.value)),
  width: Math.max(1, Math.round(width.value)),
}));
const shapes = computed(() => patternShapes(pattern.kind, pattern.settings, size.value.width, size.value.height));
const mask = computed(() => FADE_MASKS[pattern.fade]);

/** A color between the dot color (0) and the diamond color (1). */
function blend(mix: number): string {
  const share = Math.round(Math.min(1, Math.max(0, mix)) * 100);
  return `color-mix(in oklch, ${PATTERN_COLORS.diamond} ${share}%, ${PATTERN_COLORS.dot})`;
}

/** The fill or the outline of one shape, as a style. A presentation attribute cannot always read a CSS variable. */
function paint(shape: PatternShape): Record<string, string | number> {
  const color = blend(shape.mix);
  return shape.outline ? { fill: "none", stroke: color, strokeWidth: shape.outline } : { fill: color };
}
</script>

<template>
  <div
    ref="box"
    aria-hidden="true"
    class="pointer-events-none overflow-hidden"
    :style="mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined"
  >
    <svg
      v-if="width > 0 && height > 0"
      :viewBox="`0 0 ${size.width} ${size.height}`"
      class="block size-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <g :style="{ opacity: pattern.settings.opacity }">
        <rect
          v-for="(shape, index) in shapes"
          :key="index"
          :x="shape.cx - shape.size / 2"
          :y="shape.cy - shape.size / 2"
          :width="shape.size"
          :height="shape.size"
          :rx="shape.rx"
          :transform="`rotate(${shape.rotate} ${shape.cx} ${shape.cy})`"
          :style="paint(shape)"
        />
      </g>
    </svg>
  </div>
</template>
