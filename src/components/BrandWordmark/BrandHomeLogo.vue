<script setup lang="ts">
import { onBeforeUnmount, shallowRef, useTemplateRef } from "vue";

import { MOTION_EASING, motionMs } from "@/libs/motion";

import { BRAND_GLYPH } from "./brand-glyph";
import BrandTapLogo from "./BrandTapLogo.vue";

/**
 * The logo of the HomePage header. It is `BrandTapLogo`, and it can change to the glyph when the header collapses. The
 * parent calls `scrub()` with the progress of the collapse, from 0 (the word) to 1 (the glyph), so the logo moves with
 * the other parts of the header. The change keeps the diamond: the letters leave one by one, the diamond on the i moves
 * to the place of the diamond in the glyph, and the dot and the bar grow. The way back moves the same steps backward.
 * The rules are in `brand-wordmark.usage.ts`.
 *
 * While the glyph shows, a tap on the logo does nothing, because the tap motion needs the letters.
 */

/** The width of the glyph in the collapsed header. The user picked 18px in the prototype `2026-11-05-home-motion`. */
const GLYPH_PX = 18;
/** The box of the glyph in the units of `brand-glyph.ts`: it starts at 150 and is 300 wide. */
const GLYPH_ORIGIN = 150;
const GLYPH_UNITS = 300;
/** The time between two letters that leave. */
const LETTER_STAGGER_MS = 30;

/**
 * The three parts of the glyph. Each part is its own `<svg>` over the full glyph box. A transform on an `<svg>` box needs
 * no layout, but a transform on a shape inside an `<svg>` does, and the scrub changes it on each frame.
 */
const GLYPH_PARTS = ["dot", "bar", "diamond"] as const;

const word = useTemplateRef<HTMLElement>("word");
const glyph = useTemplateRef<HTMLElement>("glyph");

let animations: Animation[] = [];
/** True while the relay is past its start. The classes then show the glyph state. */
const collapsed = shallowRef(false);
/** The length of the relay, in milliseconds. */
let relayLength = 0;

/** Stops the relay. The classes then show their own state. */
function stop(): void {
  animations.forEach((animation) => animation.cancel());
  animations = [];
}

/** Returns the center and the width of an element on the screen. */
function centerOf(el: Element): { width: number; x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return { width: rect.width, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Sets the transform origin of each part to the center of its shape, as a share of the glyph box. */
function setPartOrigins(parts: SVGSVGElement[]): void {
  parts.forEach((part) => {
    const shape = part.firstElementChild as SVGGraphicsElement | null;
    if (!shape) return;
    const box = shape.getBBox();
    const x = ((box.x + box.width / 2 - GLYPH_ORIGIN) / GLYPH_UNITS) * 100;
    const y = ((box.y + box.height / 2 - GLYPH_ORIGIN) / GLYPH_UNITS) * 100;
    part.style.transformOrigin = `${x}% ${y}%`;
  });
}

/**
 * Builds the relay toward the glyph, paused. Each animation holds its first and its last frame, so a time before or
 * after its own part shows the right state.
 */
function buildRelay(): void {
  stop();
  const box = glyph.value;
  const letters = [...(word.value?.querySelectorAll<SVGElement>('[data-part^="letter-"]') ?? [])];
  const tittle = word.value?.querySelector<SVGElement>('[data-part="tittle"]');
  const diamond = box?.querySelector<SVGSVGElement>('[data-glyph="diamond"]');
  const growing = [...(box?.querySelectorAll<SVGSVGElement>('[data-glyph="dot"], [data-glyph="bar"]') ?? [])];
  const diamondShape = diamond?.firstElementChild;
  if (!box || !tittle || !diamond || !diamondShape || typeof box.animate !== "function") return;
  setPartOrigins([diamond, ...growing]);

  // The part boxes are not scaled, so the diamond moves in screen pixels around the center of its shape.
  const from = centerOf(tittle);
  const to = centerOf(diamondShape);
  const onWord = `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.width / to.width})`;
  const exit = { duration: motionMs("exit"), easing: MOTION_EASING.exit, fill: "both" as const };
  const move = { duration: motionMs("container"), easing: MOTION_EASING.enter, fill: "both" as const };
  const enter = { duration: motionMs("state"), easing: MOTION_EASING.enter, fill: "both" as const };
  const lettersEnd = letters.length * LETTER_STAGGER_MS;

  animations = [
    ...letters.map((letter, index) =>
      letter.animate({ opacity: [1, 0] }, { ...exit, delay: index * LETTER_STAGGER_MS })
    ),
    diamond.animate({ transform: [onWord, "none"] }, { ...move, delay: lettersEnd / 2 }),
    ...growing.map((part) =>
      part.animate(
        { opacity: [0, 1], transform: ["scale(0)", "none"] },
        { ...enter, delay: lettersEnd / 2 + move.duration / 2 }
      )
    ),
  ];
  animations.forEach((animation) => animation.pause());
  relayLength = Math.max(
    0,
    ...animations.map((animation) => Number(animation.effect?.getComputedTiming().endTime ?? 0))
  );
}

/** Moves the logo to `progress`, from 0 (the word) to 1 (the glyph). */
function scrub(progress: number): void {
  if (progress <= 0) {
    if (collapsed.value) {
      stop();
      collapsed.value = false;
    }
    return;
  }
  if (!collapsed.value || animations.length === 0) {
    buildRelay();
    collapsed.value = true;
  }
  animations.forEach((animation) => (animation.currentTime = Math.min(1, progress) * relayLength));
}

defineExpose({ scrub });
onBeforeUnmount(stop);
</script>

<template>
  <div :class="['relative flex h-10 items-center', collapsed && 'is-glyph']">
    <span ref="word" :class="['word block', collapsed && 'pointer-events-none']">
      <BrandTapLogo />
    </span>
    <span
      ref="glyph"
      aria-hidden="true"
      :style="{ height: `${GLYPH_PX}px`, width: `${GLYPH_PX}px` }"
      class="glyph pointer-events-none absolute top-1/2 left-0 block -translate-y-1/2 text-util-color-brand-700"
    >
      <svg
        v-for="part in GLYPH_PARTS"
        :key="part"
        :data-glyph="part"
        viewBox="150 150 300 300"
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
/* The end states. `scrub()` moves the relay between them. */
.glyph {
  opacity: 0;
}

.is-glyph .glyph {
  opacity: 1;
}

.is-glyph .word :deep([data-part]) {
  opacity: 0;
}
</style>
