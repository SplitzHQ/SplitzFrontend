<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from "vue";

import { motionSlow, prefersReducedMotion } from "@/libs/motion";
import { holdStatusBarColor } from "@/libs/status-bar-color";

import { BRAND_COLOR, LIGHT_COLOR } from "./brand-glyph";
import { claimOpening, OPENING_MARK_PX, playOpening, type OpeningPlay } from "./brand-motion";
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
let play: OpeningPlay | undefined;

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
  play = playOpening(element, motionSlow());
  void play.leaving.then(() => {
    leaving.value = true;
    release();
  });
  void play.done.then(() => {
    showing.value = false;
  });
});

onBeforeUnmount(() => {
  play?.cancel();
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
