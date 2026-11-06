<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from "vue";

import { motionSlow, prefersReducedMotion } from "@/libs/motion";

import { BRAND_GLYPH } from "./brand-glyph";
import { cancelWhenDone, MARK_TAP_STEPS, playSteps, TAP_MARK } from "./brand-motion";
import { WORDMARK_LAYOUT, WORDMARK_LETTERS, WORDMARK_TITTLE, WORDMARK_WORD } from "./brand-wordmark";
import BrandMotionGlyph from "./BrandMotionGlyph.vue";

/**
 * The glyph alone, on a page that shows no word. It rests as the glyph. A tap plays the whole logo in its place: the mark
 * forms, the word comes in next to it, and the word leaves again. The rules are in `brand-wordmark.usage.ts`. The class
 * sets the color.
 *
 * Under reduced motion a tap does nothing.
 */

/** The size of the mark in CSS pixels. */
const MARK_PX = 32;

const { box, emUnits } = WORDMARK_LAYOUT;

/** The word has one em of the size of the mark, the same ratio as the mark on the word in `BrandTapLogo`. */
const WORD_SCALE = MARK_PX / emUnits;

/** The distance from the top of the mark to the top of the word box. It puts the baseline where `TAP_MARK` puts it. */
const WORD_TOP = (TAP_MARK.size - TAP_MARK.belowBaseline + box.y) * WORD_SCALE;

const root = useTemplateRef<HTMLElement>("root");

let animations: Animation[] = [];

/** Plays the motion. A tap during the motion does nothing. */
function play(): void {
  const element = root.value;
  if (!element || animations.length > 0 || prefersReducedMotion() || typeof element.animate !== "function") return;
  animations = playSteps(element, MARK_TAP_STEPS, motionSlow());
  void cancelWhenDone(animations).then(() => {
    animations = [];
  });
}

onBeforeUnmount(() => {
  animations.forEach((animation) => {
    animation.cancel();
  });
});
</script>

<template>
  <!-- The tap area grows outside the button to 44px, so the page keeps its layout. -->
  <button
    ref="root"
    type="button"
    class="relative block size-8 after:absolute after:-inset-1.5"
    :aria-label="WORDMARK_WORD"
    data-test="brand-tap-mark"
    @click="play"
  >
    <svg viewBox="150 150 300 300" fill="currentColor" aria-hidden="true" class="block size-full overflow-visible">
      <!-- The glyph at rest. It leaves first, and the moving parts end on the same shapes. -->
      <g data-part="rest">
        <circle :cx="BRAND_GLYPH.dot.cx" :cy="BRAND_GLYPH.dot.cy" :r="BRAND_GLYPH.dot.r" />
        <path :d="BRAND_GLYPH.bar" />
        <path :d="BRAND_GLYPH.diamond" />
      </g>
      <BrandMotionGlyph />
    </svg>

    <!-- The word shows only during the motion. It is outside the layout, so the page does not move. -->
    <svg
      :viewBox="`0 ${box.y} ${box.width} ${box.height}`"
      :width="box.width * WORD_SCALE"
      :height="box.height * WORD_SCALE"
      fill="currentColor"
      aria-hidden="true"
      class="pointer-events-none absolute left-full ml-2 block max-w-none overflow-visible"
      :style="{ top: `${WORD_TOP}px` }"
    >
      <path
        v-for="(letter, index) in WORDMARK_LETTERS"
        :key="index"
        :data-part="`letter-${index}`"
        :d="letter"
        opacity="0"
      />
      <path data-part="tittle" :d="WORDMARK_TITTLE" opacity="0" />
    </svg>
  </button>
</template>

<style scoped>
/* Each part moves around its own center. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
