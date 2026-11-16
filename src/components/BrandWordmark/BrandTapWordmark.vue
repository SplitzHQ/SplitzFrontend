<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from "vue";

import { motionSlow, prefersReducedMotion } from "@/libs/motion";

import { BRAND_GLYPH_BOX } from "./brand-glyph";
import {
  cancelAnimationsWhenFinished,
  playMotionSteps,
  TITTLE_SQUARE_HALF_SIDE,
  WORDMARK_GLYPH_ALIGNMENT,
  WORDMARK_TAP_STEPS,
} from "./brand-motion";
import { WORDMARK_TITTLE_GEOMETRY } from "./brand-wordmark";
import BrandAnimatedGlyphParts from "./BrandAnimatedGlyphParts.vue";
import BrandWordmark from "./BrandWordmark.vue";

/**
 * Interactive wordmark button for the `HomePage` header. Displays `BrandWordmark` at rest; tapping fades out the
 * letters, assembles and dismisses the glyph in place, brings the letters back in, and morphs a circle into the
 * diamond tittle above the `i`. See `brand-wordmark.usage.ts` for usage rules.
 *
 * Taps while the animation is already running or when reduced motion is enabled are ignored.
 */

/** Scale factor mapping the 300-unit glyph (`BRAND_GLYPH_BOX.size`) into `WORDMARK_GLYPH_ALIGNMENT.sizeUnits`. */
const GLYPH_TO_WORDMARK_SCALE = WORDMARK_GLYPH_ALIGNMENT.sizeUnits / BRAND_GLYPH_BOX.size;
/** Top `y` coordinate of the glyph box in `WORDMARK_LAYOUT` units (`-86`), centering it on the capital letters. */
const GLYPH_TOP_Y = WORDMARK_GLYPH_ALIGNMENT.belowBaselineUnits - WORDMARK_GLYPH_ALIGNMENT.sizeUnits;
const tittleSquareSide = TITTLE_SQUARE_HALF_SIDE * 2;

const buttonElement = useTemplateRef<HTMLElement>("buttonElement");

let activeAnimations: Animation[] = [];

/** Plays the wordmark tap animation, ignoring repeat taps until the current run completes. */
function playTapAnimation(): void {
  const element = buttonElement.value;
  if (!element || activeAnimations.length > 0 || prefersReducedMotion() || typeof element.animate !== "function") {
    return;
  }
  activeAnimations = playMotionSteps(element, WORDMARK_TAP_STEPS, motionSlow());
  void cancelAnimationsWhenFinished(activeAnimations).then(() => {
    activeAnimations = [];
  });
}

onBeforeUnmount(() => {
  activeAnimations.forEach((animation) => {
    animation.cancel();
  });
});
</script>

<template>
  <!-- Extend an invisible `::after` hit area beyond 44px tall without increasing the header's layout height. -->
  <button
    ref="buttonElement"
    type="button"
    class="relative block after:absolute after:-inset-x-2.5 after:-inset-y-4"
    data-test="brand-tap-wordmark"
    @click="playTapAnimation"
  >
    <BrandWordmark size="header">
      <!-- Temporary `<rect>` that morphs from a circle into the rotated diamond tittle before `data-part="tittle"` returns. -->
      <rect
        data-part="tittle-morph"
        :x="WORDMARK_TITTLE_GEOMETRY.centerX - TITTLE_SQUARE_HALF_SIDE"
        :y="WORDMARK_TITTLE_GEOMETRY.centerY - TITTLE_SQUARE_HALF_SIDE"
        :width="tittleSquareSide"
        :height="tittleSquareSide"
        :rx="TITTLE_SQUARE_HALF_SIDE"
        opacity="0"
      />
      <g :transform="`translate(0 ${GLYPH_TOP_Y})`">
        <g data-part="glyph" opacity="0">
          <g
            :transform="`scale(${GLYPH_TO_WORDMARK_SCALE}) translate(${-BRAND_GLYPH_BOX.min} ${-BRAND_GLYPH_BOX.min})`"
          >
            <BrandAnimatedGlyphParts />
          </g>
        </g>
      </g>
    </BrandWordmark>
  </button>
</template>

<style scoped>
/* Scale and rotate the glyph group and morphing tittle `<rect>` around their own bounding-box centers. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
