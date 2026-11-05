<script setup lang="ts">
import { computed } from "vue";

import { BRAND_GLYPH } from "./brand-glyph";
import { WORDMARK_FONT_SIZE, WORDMARK_LAYOUT, WORDMARK_WORD, type WordmarkSize } from "./brand-wordmark";

/** The horizontal Splitz logo: the glyph and the word. The rules are in `brand-wordmark.usage.ts`. */
const { size } = defineProps<{
  /** The surface that shows the logo. */
  size: WordmarkSize;
}>();

const { box, emUnits, font, glyph, textX } = WORDMARK_LAYOUT;

const viewBox = `0 ${box.y} ${box.width} ${box.height}`;

/** The rendered size in CSS pixels. The SVG scales from the font size of the logo size. */
const scale = computed(() => WORDMARK_FONT_SIZE[size] / emUnits);
</script>

<template>
  <!-- `overflow-visible` keeps the word whole if the fallback font is wider than Manrope. -->
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
    <svg :y="glyph.y" :width="glyph.size" :height="glyph.size" viewBox="150 150 300 300">
      <circle :cx="BRAND_GLYPH.dot.cx" :cy="BRAND_GLYPH.dot.cy" :r="BRAND_GLYPH.dot.r" />
      <path :d="BRAND_GLYPH.bar" />
      <path :d="BRAND_GLYPH.diamond" />
    </svg>
    <text
      :x="textX"
      y="0"
      :font-family="font.family"
      :font-size="emUnits"
      :font-weight="font.weight"
      :letter-spacing="font.letterSpacing"
      text-rendering="geometricPrecision"
    >
      {{ WORDMARK_WORD }}
    </text>
  </svg>
</template>
