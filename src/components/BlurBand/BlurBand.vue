<script setup lang="ts">
/**
 * A progressive blur over the content that scrolls. See `blur-band.usage.ts`.
 * It has four blur layers. Each layer blurs more than the layer before it and has a mask that starts nearer the edge.
 * A tint on top keeps the area near the edge calm. The band does not take a tap and a screen reader does not read it.
 *
 * The parent sets the position of a `top` band. A `bottom` band fills its parent and goes `--blur-band-height` above it,
 * so the parent must have a position. The parent sets `--blur-band-strength` from 0 to 1 when the strength must change,
 * and `--blur-band-size` when the fade must have another height.
 * The comparison is the prototype `2026-11-04-sheet-action-divider`.
 */
const { edge } = defineProps<{
  /** The edge where the blur is the strongest. */
  edge: "bottom" | "top";
}>();

/** The radius of each layer in pixels. `from` and `to` are the band of its mask, as parts of the band height. */
const LAYERS = [
  { blur: 1, from: 0, to: 0.5 },
  { blur: 2, from: 0.25, to: 0.75 },
  { blur: 4, from: 0.5, to: 1 },
  { blur: 8, from: 0.75, to: 1.25 },
];
</script>

<template>
  <div :class="['blur-band', `is-${edge}`]" aria-hidden="true">
    <i
      v-for="layer in LAYERS"
      :key="layer.blur"
      class="blur-layer"
      :style="{
        '--layer-blur': `${layer.blur}px`,
        '--layer-from': layer.from,
        '--layer-to': layer.to,
      }"
    />
    <i class="blur-tint" />
  </div>
</template>

<style scoped>
/* A registered number can change a stop of a gradient. The layers inherit it from the band. */
@property --blur-band-strength {
  syntax: "<number>";
  inherits: true;
  initial-value: 1;
}

/* The band does not set `--blur-band-color`, so a parent can set the color on the band or on an ancestor. */
.blur-band {
  --blur-band-height: var(--blur-band-size, 1.5rem);
  position: absolute;
  right: 0;
  left: 0;
  pointer-events: none;
}

.blur-band.is-bottom {
  --blur-direction: to bottom;
  top: calc(var(--blur-band-height) * -1);
  bottom: 0;
}

.blur-band.is-top {
  --blur-direction: to top;
  height: calc(var(--blur-band-height) * 1.25);
}

.blur-layer,
.blur-tint {
  position: absolute;
  inset: 0;
}

/* The layers change their mask and not their opacity. A report from iOS 18 shows a black area when a blur changes its opacity. */
.blur-layer {
  -webkit-backdrop-filter: blur(var(--layer-blur));
  backdrop-filter: blur(var(--layer-blur));
  -webkit-mask-image: linear-gradient(
    var(--blur-direction),
    transparent calc(var(--blur-band-height) * var(--layer-from)),
    rgb(0 0 0 / var(--blur-band-strength)) calc(var(--blur-band-height) * var(--layer-to))
  );
  mask-image: linear-gradient(
    var(--blur-direction),
    transparent calc(var(--blur-band-height) * var(--layer-from)),
    rgb(0 0 0 / var(--blur-band-strength)) calc(var(--blur-band-height) * var(--layer-to))
  );
}

.is-bottom .blur-tint {
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in oklch, var(--blur-band-color, var(--base-bg-primary)) 70%, transparent) var(--blur-band-height)
  );
}

/* The top of this tint has the full color, so a strip of that color above the band has no edge with it. */
.is-top .blur-tint {
  background: linear-gradient(
    to top,
    transparent,
    color-mix(in oklch, var(--blur-band-color, var(--base-bg-primary)) 85%, transparent) var(--blur-band-height),
    var(--blur-band-color, var(--base-bg-primary))
  );
  opacity: var(--blur-band-strength);
}
</style>
