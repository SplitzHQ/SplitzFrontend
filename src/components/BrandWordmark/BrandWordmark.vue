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
 * The Splitz logo: the word as outlines, with the diamond of the glyph on the i. The rules are in
 * `brand-wordmark.usage.ts`.
 *
 * The default slot draws in the same SVG, under the word. `BrandTapLogo` puts the mark there. Each letter and the diamond
 * have a `data-part`, so the steps in `brand-motion.ts` can move them.
 */
const { size } = defineProps<{
  /** The surface that shows the logo. */
  size: WordmarkSize;
}>();

const { box, emUnits } = WORDMARK_LAYOUT;

const viewBox = `0 ${box.y} ${box.width} ${box.height}`;

/** The rendered size in CSS pixels. The SVG scales from the font size of the logo size. */
const scale = computed(() => WORDMARK_FONT_SIZE[size] / emUnits);
</script>

<template>
  <!-- `overflow-visible` keeps the tip of the diamond, which goes above the box. -->
  <svg
    :viewBox="viewBox"
    :width="box.width * scale"
    :height="box.height * scale"
    fill="currentColor"
    class="block shrink-0 overflow-visible text-util-color-brand-700 select-none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="WORDMARK_WORD"
  >
    <slot />
    <path v-for="(letter, index) in WORDMARK_LETTERS" :key="index" :data-part="`letter-${index}`" :d="letter" />
    <path data-part="tittle" :d="WORDMARK_TITTLE" />
  </svg>
</template>

<style scoped>
/* Each part scales and moves around its own center. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
