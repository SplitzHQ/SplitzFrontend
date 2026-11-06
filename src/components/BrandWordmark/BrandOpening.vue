<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from "vue";

import { MOTION_EASING, motionSlow, prefersReducedMotion } from "@/libs/motion";
import { holdStatusBarColor } from "@/libs/status-bar-color";

import { BRAND_COLOR, LIGHT_COLOR } from "./brand-glyph";
import {
  cancelWhenDone,
  claimOpening,
  OPENING_FADE_MS,
  OPENING_MARK_PX,
  OPENING_STAY_MS,
  OPENING_STEPS,
  playSteps,
} from "./brand-motion";
import BrandMotionGlyph from "./BrandMotionGlyph.vue";

/**
 * The full-screen opening of the app: the plate color with the mark in the center. The mark plays the small motion and
 * rests, and the whole layer fades out. The page is already there under it. The rules are in `brand-wordmark.usage.ts`.
 *
 * It plays one time for each run of the app. Under reduced motion it does not show. The layer takes no pointer events,
 * so a person can tap the page at any time.
 */

/** The token that has the same value as `BRAND_COLOR`. */
const PLATE_COLOR_TOKEN = "--core-color-brand-700";

const showing = shallowRef(claimOpening() && !prefersReducedMotion());
/** True from the start of the fade. See the template. */
const leaving = shallowRef(false);
const layer = useTemplateRef<HTMLElement>("layer");

let releaseStatusBar: (() => void) | undefined;
let animations: Animation[] = [];
let fadeTimer: ReturnType<typeof setTimeout> | undefined;

// In setup, so the status bar has this color from the first frame of the layer.
if (showing.value) releaseStatusBar = holdStatusBarColor(PLATE_COLOR_TOKEN);

/** Gives the status bar back to the page. */
function release(): void {
  releaseStatusBar?.();
  releaseStatusBar = undefined;
}

onMounted(() => {
  const element = layer.value;
  // A browser or a test environment without Web Animations shows the page at once.
  if (!element || typeof element.animate !== "function") {
    release();
    showing.value = false;
    return;
  }
  const slow = motionSlow();
  const total = OPENING_STAY_MS + OPENING_FADE_MS;
  const fade = element.animate(
    [
      { offset: 0, opacity: 1 },
      { easing: MOTION_EASING.standard, offset: OPENING_STAY_MS / total, opacity: 1 },
      { offset: 1, opacity: 0 },
    ],
    { duration: total * slow, fill: "both" }
  );
  animations = [fade, ...playSteps(element, OPENING_STEPS, slow)];
  fadeTimer = setTimeout(() => {
    leaving.value = true;
    release();
  }, OPENING_STAY_MS * slow);
  void cancelWhenDone(animations).then(() => {
    showing.value = false;
  });
});

onBeforeUnmount(() => {
  clearTimeout(fadeTimer);
  animations.forEach((animation) => {
    animation.cancel();
  });
  release();
});
</script>

<template>
  <Teleport to="body">
    <!--
      iOS 27 holds the status bar color while a full-screen fixed layer stays, so the layer stops being fixed when its
      fade starts. `status-bar-color.ts` has the details. The order puts the layer over sheets and toasts.
    -->
    <div
      v-if="showing"
      ref="layer"
      :class="[
        'pointer-events-none inset-0 z-opening flex items-center justify-center',
        leaving ? 'absolute' : 'fixed',
      ]"
      :style="{ backgroundColor: BRAND_COLOR }"
      aria-hidden="true"
      data-test="brand-opening"
    >
      <svg
        viewBox="150 150 300 300"
        :width="OPENING_MARK_PX"
        :height="OPENING_MARK_PX"
        class="block overflow-visible"
        :fill="LIGHT_COLOR"
        xmlns="http://www.w3.org/2000/svg"
      >
        <BrandMotionGlyph />
      </svg>
    </div>
  </Teleport>
</template>
