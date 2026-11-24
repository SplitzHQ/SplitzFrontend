<script setup lang="ts">
import { onBeforeUnmount, shallowRef, useTemplateRef } from "vue";

import { MOTION_EASING, motionMs } from "@/libs/motion";

import { BRAND_GLYPH, BRAND_GLYPH_BOX } from "./brand-glyph";
import BrandTapWordmark from "./BrandTapWordmark.vue";

/**
 * Scroll-scrubbed brand logo for the `HomePage` header.
 * Renders `BrandTapWordmark` at rest and morphs smoothly into the standalone 18px glyph as the header collapses.
 * `HomeHeader` drives the transition by calling `scrub(progress)` from `0` (wordmark) to `1` (glyph): the letters
 * fade out with a stagger, the diamond tittle above the `i` translates and scales into the glyph's diamond position,
 * and the dot and diagonal bar scale in. Reversing `progress` scrubs the same paused Web Animations backward.
 * See `brand-wordmark.usage.ts` for usage rules.
 *
 * Pointer events on `BrandTapWordmark` are disabled once `progress > 0` because the tap animation requires the full
 * wordmark at rest.
 */

/** Rendered width and height (in CSS pixels) of the collapsed header glyph. */
const COLLAPSED_GLYPH_SIZE_PX = 18;
/** Stagger delay (in milliseconds) between adjacent letters fading out during collapse. */
const LETTER_STAGGER_MS = 30;

/**
 * Standalone glyph parts, each rendered in its own full-viewBox `<svg>`.
 * Animating CSS `transform` on an outer `<svg>` element stays on the compositor without triggering SVG layout on every
 * scrubbed scroll frame.
 */
const GLYPH_PARTS = ["dot", "bar", "diamond"] as const;

const wordmarkElement = useTemplateRef<HTMLElement>("wordmarkElement");
const glyphElement = useTemplateRef<HTMLElement>("glyphElement");

let scrubAnimations: Animation[] = [];
/** `true` whenever `progress > 0` and the paused scrub timeline controls part visibility. */
const isScrubActive = shallowRef(false);
/** Total end timestamp (in milliseconds) of the paused scrub timeline. */
let timelineDurationMs = 0;

/** Cancels all paused scrub animations so resting CSS rules take over. */
function cancelScrubTimeline(): void {
  scrubAnimations.forEach((animation) => animation.cancel());
  scrubAnimations = [];
}

/** Measures an element's viewport center coordinates and rendered width. */
function getElementCenter(element: Element): { width: number; x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { width: rect.width, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Sets each part `<svg>`'s `transform-origin` to its inner shape's center, expressed as a percentage of `BRAND_GLYPH_BOX`. */
function setGlyphPartOrigins(partSvgs: SVGSVGElement[]): void {
  partSvgs.forEach((partSvg) => {
    const shape = partSvg.firstElementChild as SVGGraphicsElement | null;
    if (!shape) return;
    const bbox = shape.getBBox();
    const originXPercent = ((bbox.x + bbox.width / 2 - BRAND_GLYPH_BOX.min) / BRAND_GLYPH_BOX.size) * 100;
    const originYPercent = ((bbox.y + bbox.height / 2 - BRAND_GLYPH_BOX.min) / BRAND_GLYPH_BOX.size) * 100;
    partSvg.style.transformOrigin = `${originXPercent}% ${originYPercent}%`;
  });
}

/**
 * Builds the paused Web Animations timeline from wordmark (`0`) to collapsed glyph (`timelineDurationMs`).
 * Every track uses `fill: "both"` so scrubbing to any intermediate timestamp holds initial and final states cleanly.
 */
function buildScrubTimeline(): void {
  cancelScrubTimeline();
  const glyphContainer = glyphElement.value;
  const letterElements = [...(wordmarkElement.value?.querySelectorAll<SVGElement>('[data-part^="letter-"]') ?? [])];
  const tittleElement = wordmarkElement.value?.querySelector<SVGElement>('[data-part="tittle"]');
  const diamondSvg = glyphContainer?.querySelector<SVGSVGElement>('[data-glyph="diamond"]');
  const dotAndBarSvgs = [
    ...(glyphContainer?.querySelectorAll<SVGSVGElement>('[data-glyph="dot"], [data-glyph="bar"]') ?? []),
  ];
  const diamondShape = diamondSvg?.firstElementChild;
  if (!glyphContainer || !tittleElement || !diamondSvg || !diamondShape || typeof glyphContainer.animate !== "function")
    return;
  setGlyphPartOrigins([diamondSvg, ...dotAndBarSvgs]);

  // Each part `<svg>` sits unscaled in screen pixels, so translate/scale maps the glyph diamond onto the `i`'s tittle.
  const tittleCenter = getElementCenter(tittleElement);
  const diamondCenter = getElementCenter(diamondShape);
  const initialDiamondTransform = `translate(${tittleCenter.x - diamondCenter.x}px, ${tittleCenter.y - diamondCenter.y}px) scale(${tittleCenter.width / diamondCenter.width})`;
  const exitTiming = { duration: motionMs("exit"), easing: MOTION_EASING.exit, fill: "both" as const };
  const moveTiming = { duration: motionMs("container"), easing: MOTION_EASING.enter, fill: "both" as const };
  const enterTiming = { duration: motionMs("state"), easing: MOTION_EASING.enter, fill: "both" as const };
  const lettersExitEndMs = letterElements.length * LETTER_STAGGER_MS;

  scrubAnimations = [
    ...letterElements.map((letterElement, index) =>
      letterElement.animate({ opacity: [1, 0] }, { ...exitTiming, delay: index * LETTER_STAGGER_MS })
    ),
    diamondSvg.animate(
      { transform: [initialDiamondTransform, "none"] },
      { ...moveTiming, delay: lettersExitEndMs / 2 }
    ),
    ...dotAndBarSvgs.map((partSvg) =>
      partSvg.animate(
        { opacity: [0, 1], transform: ["scale(0)", "none"] },
        { ...enterTiming, delay: lettersExitEndMs / 2 + moveTiming.duration / 2 }
      )
    ),
  ];
  scrubAnimations.forEach((animation) => animation.pause());
  timelineDurationMs = Math.max(
    0,
    ...scrubAnimations.map((animation) => Number(animation.effect?.getComputedTiming().endTime ?? 0))
  );
}

/** Scrubs the wordmark-to-glyph timeline to `progress` (`0` = resting wordmark, `1` = collapsed glyph). */
function scrub(progress: number): void {
  if (progress <= 0) {
    if (isScrubActive.value) {
      cancelScrubTimeline();
      isScrubActive.value = false;
    }
    return;
  }
  if (!isScrubActive.value || scrubAnimations.length === 0) {
    buildScrubTimeline();
    isScrubActive.value = true;
  }
  const targetTimeMs = Math.min(1, progress) * timelineDurationMs;
  scrubAnimations.forEach((animation) => {
    animation.currentTime = targetTimeMs;
  });
}

defineExpose({ scrub });
onBeforeUnmount(cancelScrubTimeline);
</script>

<template>
  <div :class="['relative flex h-10 items-center', isScrubActive && 'is-scrubbing']">
    <span ref="wordmarkElement" :class="['word block', isScrubActive && 'pointer-events-none']">
      <BrandTapWordmark />
    </span>
    <span
      ref="glyphElement"
      aria-hidden="true"
      :style="{ height: `${COLLAPSED_GLYPH_SIZE_PX}px`, width: `${COLLAPSED_GLYPH_SIZE_PX}px` }"
      class="glyph pointer-events-none absolute top-1/2 left-0 block -translate-y-1/2 text-util-color-brand-700"
    >
      <svg
        v-for="part in GLYPH_PARTS"
        :key="part"
        :data-glyph="part"
        :viewBox="BRAND_GLYPH_BOX.viewBox"
        fill="currentColor"
        class="absolute inset-0 size-full overflow-visible"
      >
        <circle v-if="part === 'dot'" :cx="BRAND_GLYPH.dot.cx" :cy="BRAND_GLYPH.dot.cy" :r="BRAND_GLYPH.dot.r" />
        <path v-else :d="part === 'bar' ? BRAND_GLYPH.bar : BRAND_GLYPH.diamond" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
/* Base visibility states overridden frame-by-frame while `scrub()` drives the paused Web Animations. */
.glyph {
  opacity: 0;
}

.is-scrubbing .glyph {
  opacity: 1;
}

.is-scrubbing .word :deep([data-part]) {
  opacity: 0;
}
</style>
