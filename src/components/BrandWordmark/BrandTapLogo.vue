<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from "vue";

import { motionSlow, prefersReducedMotion } from "@/libs/motion";

import { cancelWhenDone, playSteps, TAP_MARK, TAP_STEPS, TITTLE_HALF_SIDE } from "./brand-motion";
import { WORDMARK_TITTLE_SHAPE } from "./brand-wordmark";
import BrandMotionGlyph from "./BrandMotionGlyph.vue";
import BrandWordmark from "./BrandWordmark.vue";

/**
 * The word mark in the header of HomePage. It rests as the word. A tap plays the small motion in its place: the letters
 * leave, the mark forms and leaves, the letters come back, and the diamond forms on the i. The rules are in
 * `brand-wordmark.usage.ts`.
 *
 * Under reduced motion a tap does nothing.
 */

/** The scale from the 300-unit glyph of `brand-glyph.ts` to the size of the mark. */
const GLYPH_SCALE = TAP_MARK.size / 300;

const root = useTemplateRef<HTMLElement>("root");

let animations: Animation[] = [];

/** Plays the small motion. A tap during the motion does nothing. */
function play(): void {
  const element = root.value;
  if (!element || animations.length > 0 || prefersReducedMotion() || typeof element.animate !== "function") return;
  animations = playSteps(element, TAP_STEPS, motionSlow());
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
  <!-- The tap area grows outside the button to more than 44px, so the header keeps its height. -->
  <button
    ref="root"
    type="button"
    class="relative block after:absolute after:-inset-x-2.5 after:-inset-y-4"
    data-test="brand-tap-logo"
    @click="play"
  >
    <BrandWordmark size="header">
      <!-- The diamond on the i while it forms. It shows only during the motion. -->
      <rect
        data-part="tittle-shape"
        :x="WORDMARK_TITTLE_SHAPE.x - TITTLE_HALF_SIDE"
        :y="WORDMARK_TITTLE_SHAPE.y - TITTLE_HALF_SIDE"
        :width="TITTLE_HALF_SIDE * 2"
        :height="TITTLE_HALF_SIDE * 2"
        :rx="TITTLE_HALF_SIDE"
        opacity="0"
      />
      <g :transform="`translate(0 ${TAP_MARK.belowBaseline - TAP_MARK.size})`">
        <g data-part="mark" opacity="0">
          <g :transform="`scale(${GLYPH_SCALE}) translate(-150 -150)`">
            <BrandMotionGlyph />
          </g>
        </g>
      </g>
    </BrandWordmark>
  </button>
</template>

<style scoped>
/* The mark and the shape of the diamond move around their own centers. */
[data-part] {
  transform-box: fill-box;
  transform-origin: center;
}
</style>
