<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from "vue";

import { motionSlow, prefersReducedMotion } from "@/libs/motion";

import { BRAND_GLYPH, BRAND_GLYPH_BOX } from "./brand-glyph";
import {
  cancelAnimationsWhenFinished,
  GLYPH_TAP_STEPS,
  playMotionSteps,
  WORDMARK_GLYPH_ALIGNMENT,
} from "./brand-motion";
import { WORDMARK_LAYOUT, WORDMARK_LETTERS, WORDMARK_TITTLE, WORDMARK_WORD } from "./brand-wordmark";
import BrandAnimatedGlyphParts from "./BrandAnimatedGlyphParts.vue";

/**
 * Interactive standalone glyph button used on `AuthShell` screens. Displays the static Splitz glyph at rest; tapping
 * shrinks the static glyph out, reassembles the glyph, temporarily reveals the `"Splitz"` wordmark beside it, and
 * fades the wordmark back out. Color is inherited via `currentColor` from the caller's text color class. See
 * `brand-wordmark.usage.ts` for usage rules.
 *
 * Taps while the animation is running or when reduced motion is enabled are ignored.
 */

/** Rendered width and height of the glyph button in CSS pixels (matches Tailwind `size-8`). */
const GLYPH_SIZE_PX = 32;

const { box: wordmarkBox, emUnits } = WORDMARK_LAYOUT;

/** Scales the wordmark so `1em` (`100` SVG units) matches `GLYPH_SIZE_PX`, keeping the 1:1 glyph-to-em ratio. */
const WORDMARK_PIXEL_SCALE = GLYPH_SIZE_PX / emUnits;

/** Vertical offset from the top of the glyph button to the top of the wordmark SVG so capitals align with the glyph center. */
const WORDMARK_TOP_OFFSET_PX =
  (WORDMARK_GLYPH_ALIGNMENT.sizeUnits - WORDMARK_GLYPH_ALIGNMENT.belowBaselineUnits + wordmarkBox.y) *
  WORDMARK_PIXEL_SCALE;

const buttonElement = useTemplateRef<HTMLElement>("buttonElement");

let activeAnimations: Animation[] = [];

/** Plays the glyph tap animation, ignoring repeat taps until the current run completes. */
function playTapAnimation(): void {
  const element = buttonElement.value;
  if (!element || activeAnimations.length > 0 || prefersReducedMotion() || typeof element.animate !== "function") {
    return;
  }
  activeAnimations = playMotionSteps(element, GLYPH_TAP_STEPS, motionSlow());
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
  <!-- Extend an invisible `::after` hit area to 44×44px (`32px + 6px * 2`) without affecting surrounding page layout. -->
  <button
    ref="buttonElement"
    type="button"
    class="relative block size-8 after:absolute after:-inset-1.5"
    :aria-label="WORDMARK_WORD"
    data-test="brand-tap-glyph"
    @click="playTapAnimation"
  >
    <svg
      :viewBox="BRAND_GLYPH_BOX.viewBox"
      fill="currentColor"
      aria-hidden="true"
      class="block size-full overflow-visible"
    >
      <!-- Static glyph shown at rest; shrinks out on tap and reappears once `BrandAnimatedGlyphParts` finishes on the same shapes. -->
      <g data-part="resting-glyph">
        <circle :cx="BRAND_GLYPH.dot.cx" :cy="BRAND_GLYPH.dot.cy" :r="BRAND_GLYPH.dot.r" />
        <path :d="BRAND_GLYPH.bar" />
        <path :d="BRAND_GLYPH.diamond" />
      </g>
      <BrandAnimatedGlyphParts />
    </svg>

    <!-- Wordmark shown only during the tap animation; positioned out of flow so revealing it never shifts the page. -->
    <svg
      :viewBox="`0 ${wordmarkBox.y} ${wordmarkBox.width} ${wordmarkBox.height}`"
      :width="wordmarkBox.width * WORDMARK_PIXEL_SCALE"
      :height="wordmarkBox.height * WORDMARK_PIXEL_SCALE"
      fill="currentColor"
      aria-hidden="true"
      class="pointer-events-none absolute left-full ml-2 block max-w-none overflow-visible"
      :style="{ top: `${WORDMARK_TOP_OFFSET_PX}px` }"
    >
      <path
        v-for="(letterPath, letterIndex) in WORDMARK_LETTERS"
        :key="letterIndex"
        :data-part="`letter-${letterIndex}`"
        :d="letterPath"
        opacity="0"
      />
      <path data-part="tittle" :d="WORDMARK_TITTLE" opacity="0" />
    </svg>
  </button>
</template>

<style scoped>
/* Scale and translate each SVG part around its own bounding-box center. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
