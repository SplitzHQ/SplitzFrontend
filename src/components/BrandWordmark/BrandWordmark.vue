<script setup lang="ts">
import { computed } from "vue";

import {
  WORDMARK_FONT_SIZE,
  WORDMARK_LAYOUT,
  WORDMARK_LETTERS,
  WORDMARK_TITTLE,
  WORDMARK_WORD,
  type WordmarkSize,
} from "./brand-wordmark";

/**
 * Static SVG `"Splitz"` wordmark rendered from vector letter outlines, with the brand diamond replacing the dot on
 * the `i`. See `brand-wordmark.usage.ts` for usage rules.
 *
 * Slots:
 * - `default`: Optional SVG elements rendered behind the wordmark inside the same coordinate space (used by
 *   `BrandTapWordmark` to layer the animated glyph and morphing tittle `<rect>`).
 *
 * Each letter (`data-part="letter-0"`..`"letter-5"`) and the `i`'s diamond (`data-part="tittle"`) expose `data-part`
 * selectors so `brand-motion.ts` can animate them individually.
 */
export interface BrandWordmarkProps {
  /** Named size preset matching the UI surface where the wordmark appears. */
  size: WordmarkSize;
}

const { size } = defineProps<BrandWordmarkProps>();

const { box: wordmarkBox, emUnits } = WORDMARK_LAYOUT;

const viewBox = `0 ${wordmarkBox.y} ${wordmarkBox.width} ${wordmarkBox.height}`;

/** Ratio converting SVG user units (`100` per em) into CSS pixels for the selected `size` preset. */
const pixelScale = computed(() => WORDMARK_FONT_SIZE[size] / emUnits);
</script>

<template>
  <!-- Keep `overflow-visible` because the top tip of the `i`'s diamond extends above `wordmarkBox.y`. -->
  <svg
    :viewBox="viewBox"
    :width="wordmarkBox.width * pixelScale"
    :height="wordmarkBox.height * pixelScale"
    fill="currentColor"
    class="block shrink-0 overflow-visible text-util-color-brand-700 select-none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="WORDMARK_WORD"
  >
    <slot />
    <path
      v-for="(letterPath, letterIndex) in WORDMARK_LETTERS"
      :key="letterIndex"
      :data-part="`letter-${letterIndex}`"
      :d="letterPath"
    />
    <path data-part="tittle" :d="WORDMARK_TITTLE" />
  </svg>
</template>

<style scoped>
/* Scale and translate each letter path and the tittle around its own bounding-box center. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
