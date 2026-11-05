<script setup lang="ts">
import { BRAND_GLYPH } from "./brand-glyph";
import { DIAMOND_CENTER, DIAMOND_HALF_SIDE } from "./brand-motion";

/**
 * The glyph as separate parts, for the steps in `brand-motion.ts`. Put it in an SVG with the coordinates of
 * `brand-glyph.ts`. The diamond is a rounded square, so it can start as a circle.
 */
</script>

<template>
  <circle data-part="dot" :cx="BRAND_GLYPH.dot.cx" :cy="BRAND_GLYPH.dot.cy" :r="BRAND_GLYPH.dot.r" opacity="0" />
  <path data-part="bar" :d="BRAND_GLYPH.bar" opacity="0" />
  <rect
    data-part="diamond"
    :x="DIAMOND_CENTER - DIAMOND_HALF_SIDE"
    :y="DIAMOND_CENTER - DIAMOND_HALF_SIDE"
    :width="DIAMOND_HALF_SIDE * 2"
    :height="DIAMOND_HALF_SIDE * 2"
    :rx="DIAMOND_HALF_SIDE"
    opacity="0"
  />
</template>

<style scoped>
/* Each part scales and turns around its own center. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
