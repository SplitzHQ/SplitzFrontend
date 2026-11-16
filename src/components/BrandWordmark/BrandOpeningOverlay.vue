<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from "vue";

import { MOTION_EASING, motionSlow, prefersReducedMotion } from "@/libs/motion";
import { holdStatusBarColor } from "@/libs/status-bar-color";

import { BRAND_COLOR, BRAND_GLYPH_BOX, LIGHT_COLOR } from "./brand-glyph";
import {
  cancelAnimationsWhenFinished,
  claimOpeningPlay,
  OPENING_FADE_MS,
  OPENING_GLYPH_SIZE_PX,
  OPENING_GLYPH_STEPS,
  OPENING_OPAQUE_MS,
  playMotionSteps,
} from "./brand-motion";
import BrandAnimatedGlyphParts from "./BrandAnimatedGlyphParts.vue";

/**
 * Full-screen brand opening overlay shown once per cold app start over `HomePage`: displays the centered glyph
 * assembly animation on the brand plate color, holds briefly, then fades out to reveal the already-mounted page
 * underneath. See `brand-wordmark.usage.ts` for usage rules.
 *
 * Skipped altogether when reduced motion is enabled. `pointer-events-none` keeps the underlying page interactive
 * throughout the animation.
 */

/** CSS color variable matching `BRAND_COLOR` for syncing the phone status bar. */
const OPENING_STATUS_BAR_TOKEN = "--core-color-brand-600";

const isVisible = shallowRef(claimOpeningPlay() && !prefersReducedMotion());
/** Switches positioning from `fixed` to `absolute` once fade-out begins so iOS 27 releases the status bar color. */
const isFadingOut = shallowRef(false);
const overlayElement = useTemplateRef<HTMLElement>("overlayElement");

let releaseStatusBarColor: (() => void) | undefined;
let activeAnimations: Animation[] = [];
let fadeStartTimer: ReturnType<typeof setTimeout> | undefined;

// Claim the status bar color synchronously during setup so the first rendered frame already matches the overlay.
if (isVisible.value) releaseStatusBarColor = holdStatusBarColor(OPENING_STATUS_BAR_TOKEN);

/** Hands status bar color control back to the underlying page. */
function restoreStatusBarColor(): void {
  releaseStatusBarColor?.();
  releaseStatusBarColor = undefined;
}

onMounted(() => {
  const element = overlayElement.value;
  // Reveal the page immediately in environments without Web Animations API support (such as jsdom unit tests).
  if (!element || typeof element.animate !== "function") {
    restoreStatusBarColor();
    isVisible.value = false;
    return;
  }
  const durationScale = motionSlow();
  const totalDurationMs = OPENING_OPAQUE_MS + OPENING_FADE_MS;
  const overlayFadeAnimation = element.animate(
    [
      { offset: 0, opacity: 1 },
      { easing: MOTION_EASING.standard, offset: OPENING_OPAQUE_MS / totalDurationMs, opacity: 1 },
      { offset: 1, opacity: 0 },
    ],
    { duration: totalDurationMs * durationScale, fill: "both" }
  );
  activeAnimations = [overlayFadeAnimation, ...playMotionSteps(element, OPENING_GLYPH_STEPS, durationScale)];
  fadeStartTimer = setTimeout(() => {
    isFadingOut.value = true;
    restoreStatusBarColor();
  }, OPENING_OPAQUE_MS * durationScale);
  void cancelAnimationsWhenFinished(activeAnimations).then(() => {
    isVisible.value = false;
  });
});

onBeforeUnmount(() => {
  clearTimeout(fadeStartTimer);
  activeAnimations.forEach((animation) => {
    animation.cancel();
  });
  restoreStatusBarColor();
});
</script>

<template>
  <Teleport to="body">
    <!--
      iOS 27 locks onto a full-screen `position: fixed` layer's background color for as long as it stays `fixed`,
      so switch to `absolute` as soon as fade-out starts (see `status-bar-color.ts`). `z-opening` layers above sheets
      and toasts.
    -->
    <div
      v-if="isVisible"
      ref="overlayElement"
      :class="[
        'pointer-events-none inset-0 z-opening flex items-center justify-center',
        isFadingOut ? 'absolute' : 'fixed',
      ]"
      :style="{ backgroundColor: BRAND_COLOR }"
      aria-hidden="true"
      data-test="brand-opening"
    >
      <svg
        :viewBox="BRAND_GLYPH_BOX.viewBox"
        :width="OPENING_GLYPH_SIZE_PX"
        :height="OPENING_GLYPH_SIZE_PX"
        class="block overflow-visible"
        :fill="LIGHT_COLOR"
        xmlns="http://www.w3.org/2000/svg"
      >
        <BrandAnimatedGlyphParts />
      </svg>
    </div>
  </Teleport>
</template>
