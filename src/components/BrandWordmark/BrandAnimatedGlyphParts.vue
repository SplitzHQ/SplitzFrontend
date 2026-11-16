<script setup lang="ts">
import { BRAND_GLYPH, BRAND_GLYPH_DIAMOND_SQUARE } from "./brand-glyph";

/**
 * Animatable SVG child elements (`dot`, `bar`, and `diamond`) for the Splitz glyph assembly animation in
 * `brand-motion.ts`. Must be placed inside a parent `<svg>` using `brand-glyph.ts` coordinates (for example,
 * `viewBox="150 150 300 300"`).
 *
 * All three parts render at `opacity="0"` so they stay hidden until `playMotionSteps` runs. The `diamond` part uses a
 * `<rect>` with initial corner radius `rx = halfSide` so it begins as a circle and sharpens into a square while
 * rotating 45° into the final diamond.
 */
const diamondSideLength = BRAND_GLYPH_DIAMOND_SQUARE.halfSide * 2;
const diamondTopLeft = BRAND_GLYPH_DIAMOND_SQUARE.center - BRAND_GLYPH_DIAMOND_SQUARE.halfSide;
</script>

<template>
  <circle data-part="dot" :cx="BRAND_GLYPH.dot.cx" :cy="BRAND_GLYPH.dot.cy" :r="BRAND_GLYPH.dot.r" opacity="0" />
  <path data-part="bar" :d="BRAND_GLYPH.bar" opacity="0" />
  <rect
    data-part="diamond"
    :x="diamondTopLeft"
    :y="diamondTopLeft"
    :width="diamondSideLength"
    :height="diamondSideLength"
    :rx="BRAND_GLYPH_DIAMOND_SQUARE.halfSide"
    opacity="0"
  />
</template>

<style scoped>
/* Rotate and scale each SVG primitive around its own bounding-box center instead of the SVG canvas origin. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
