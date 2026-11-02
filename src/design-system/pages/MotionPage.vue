<script setup lang="ts">
import { PhCheck } from "@phosphor-icons/vue";
import { onBeforeUnmount, ref, watch } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import SPopover from "@/components/SPopover/SPopover.vue";
import SSwitch from "@/components/SSwitch/SSwitch.vue";
import { MOTION_DURATION_MS, MOTION_EASING, easingPoints, type MotionDuration, type MotionEasing } from "@/libs/motion";

import DocExample from "../components/DocExample.vue";
import DocSection from "../components/DocSection.vue";

/** Turns a JS key into its CSS token name part: "hoverIn" → "hover-in". */
const kebab = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const DURATION_ROLES: Record<MotionDuration, string> = {
  container: "Menus, panels and lists that open, close or change size.",
  exit: "Things that leave. Small things leave faster than they enter.",
  feedback: "Press, release, hover out and selection changes.",
  hoverIn: "Hover in.",
  sheet: "Bottom sheets and their backdrop, both ways.",
  state: "Things that enter, and state changes such as a switch.",
};

const EASING_ROLES: Record<MotionEasing, string> = {
  enter: "Things that enter or move into place. Fast start, soft stop.",
  exit: "Things that leave. Soft start, fast finish.",
  pop: "Small marks that pop in, such as badges. Overshoots a little.",
  sheet: "Bottom sheets, in the style of iOS.",
  standard: "Fades and color changes. The same as the CSS keyword ease.",
};

const durations = (Object.keys(MOTION_DURATION_MS) as MotionDuration[])
  .sort((a, b) => MOTION_DURATION_MS[a] - MOTION_DURATION_MS[b])
  .map((key) => ({
    key,
    ms: MOTION_DURATION_MS[key],
    role: DURATION_ROLES[key],
    token: `--motion-duration-${kebab(key)}`,
  }));

/** Maps a curve point to the SVG box. The curve goes from (0, 0) to (1, 1) with 8 units of room for the overshoot. */
const point = (x: number, y: number) => `${8 + x * 64} ${72 - y * 64}`;

const easings = (Object.keys(MOTION_EASING) as MotionEasing[]).map((key) => {
  const [x1, y1, x2, y2] = easingPoints(key);
  return {
    key,
    path: `M${point(0, 0)} C${point(x1, y1)} ${point(x2, y2)} ${point(1, 1)}`,
    role: EASING_ROLES[key],
    token: `--motion-easing-${kebab(key)}`,
    value: MOTION_EASING[key],
  };
});
const diagonal = "M8 72 L72 8";

const RULES = [
  "Every visible change gets a transition: position, size, content, and things that appear or disappear.",
  "Use the tokens for every duration and curve. In Tailwind, write duration-(--motion-duration-state) ease-(--motion-easing-enter).",
  "In script code, use motionMs(), motionSeconds() and easingPoints() from src/libs/motion.ts. They follow reduced motion.",
  "Things that enter use the enter curve. Things that leave use the exit curve and the exit duration.",
  "Move things with transform. Do not animate top, left, width or height when a transform can do it.",
  "Things that follow a finger or a scroll position move at once, with no transition.",
  "Under reduced motion, every duration is 0. Check each new transition with the switch below.",
] as const;

const slow = ref(false);
const reduce = ref(false);
watch(slow, (on) => {
  if (on) document.documentElement.style.setProperty("--motion-slow", "5");
  else document.documentElement.style.removeProperty("--motion-slow");
});
watch(reduce, (on) => document.documentElement.toggleAttribute("data-reduce-motion", on));
// The switches act on the whole page, so put things back when the tab closes.
onBeforeUnmount(() => {
  document.documentElement.style.removeProperty("--motion-slow");
  document.documentElement.removeAttribute("data-reduce-motion");
});

const played = ref(false);
const shown = ref(true);
const popoverOpen = ref(false);
const marked = ref(false);
</script>

<template>
  <div class="flex flex-col gap-10">
    <div
      class="sticky top-20 z-dropdown flex flex-wrap items-center gap-6 rounded-2xl border border-base-border-tertiary bg-base-bg-primary px-4 py-3"
    >
      <label class="flex items-center gap-3 text-sm font-medium">
        <SSwitch v-model="slow" />
        Slow motion ×5
      </label>
      <label class="flex items-center gap-3 text-sm font-medium">
        <SSwitch v-model="reduce" />
        Reduce motion
      </label>
    </div>

    <DocSection title="Rules">
      <ul class="flex list-disc flex-col gap-2 pl-5 text-sm text-base-text-secondary">
        <li v-for="rule in RULES" :key="rule">{{ rule }}</li>
      </ul>
    </DocSection>

    <DocSection title="Durations" tag="motion.css" summary="Press Play to move every dot with its own duration.">
      <div>
        <SButton color="brand" variant="primary" size="sm" @click="played = !played">Play</SButton>
      </div>
      <ul class="flex flex-col gap-3">
        <li v-for="d in durations" :key="d.key" class="grid gap-2 sm:grid-cols-[18rem_1fr] sm:items-center sm:gap-6">
          <span class="flex flex-col gap-0.5">
            <code class="font-mono text-xs font-semibold">{{ d.token }} · {{ d.ms }}ms</code>
            <span class="text-xs text-base-text-tertiary">{{ d.role }}</span>
          </span>
          <span class="relative h-4 overflow-hidden rounded-full bg-base-bg-secondary">
            <!-- The carrier is as wide as the travel distance, so translateX(100%) moves the dot to the end. -->
            <span
              class="ds-carrier absolute top-0.5 right-3.5 left-0.5 h-3"
              :class="{ 'ds-carrier-on': played }"
              :style="{ transitionDuration: `var(${d.token})` }"
            >
              <i class="block size-3 rounded-full bg-util-color-brand-600" />
            </span>
          </span>
        </li>
      </ul>
    </DocSection>

    <DocSection title="Easing curves" tag="motion.css">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
        <figure
          v-for="e in easings"
          :key="e.key"
          class="flex flex-col gap-2 rounded-2xl border border-base-border-tertiary p-4"
        >
          <svg viewBox="0 0 80 80" class="size-24 self-center overflow-visible" aria-hidden="true">
            <path :d="diagonal" class="stroke-base-border-primary" stroke-dasharray="2 2" fill="none" />
            <path :d="e.path" class="stroke-util-color-brand-600" stroke-width="2" fill="none" />
          </svg>
          <figcaption class="flex flex-col gap-0.5">
            <code class="font-mono text-xs font-semibold">{{ e.token }}</code>
            <code class="font-mono text-[11px] text-base-text-tertiary">{{ e.value }}</code>
            <span class="text-xs text-base-text-secondary">{{ e.role }}</span>
          </figcaption>
        </figure>
      </div>
    </DocSection>

    <DocSection title="Patterns" summary="The shared ways things enter and leave. Each demo uses only the tokens.">
      <DocExample title="Rise in, fade out: cards, notices, page content">
        <SButton color="neutral" variant="outline" size="sm" @click="shown = !shown">
          {{ shown ? "Hide" : "Show" }}
        </SButton>
        <div class="flex h-16 min-w-56 items-center">
          <Transition name="ds-rise">
            <div v-if="shown" class="rounded-2xl bg-base-bg-secondary px-4 py-3 text-sm font-medium">
              You owe Alex ¥ 42.00
            </div>
          </Transition>
        </div>
      </DocExample>
      <DocExample title="Pop: popovers and menus (SPopover)">
        <SPopover v-model="popoverOpen" label="Example popover" side="bottom" align="start" class="w-64">
          <template #trigger>
            <SButton color="neutral" variant="secondary" size="sm">Open popover</SButton>
          </template>
          <p class="text-sm">The panel moves 4px in from the trigger side and fades in.</p>
        </SPopover>
      </DocExample>
      <DocExample title="Mark: small icons that pop in with the pop curve">
        <SButton color="neutral" variant="outline" size="sm" @click="marked = !marked">Toggle mark</SButton>
        <span class="flex size-8 items-center justify-center">
          <Transition name="ds-mark">
            <span
              v-if="marked"
              class="flex size-8 items-center justify-center rounded-full bg-util-color-success-100 text-util-color-success-700"
            >
              <PhCheck class="icon-5" weight="bold" />
            </span>
          </Transition>
        </span>
      </DocExample>
    </DocSection>
  </div>
</template>

<style scoped>
.ds-carrier {
  transition-property: transform;
  transition-timing-function: var(--motion-easing-enter);
}
.ds-carrier-on {
  transform: translateX(100%);
}

.ds-rise-enter-active {
  transition:
    opacity var(--motion-duration-state) var(--motion-easing-enter),
    transform var(--motion-duration-state) var(--motion-easing-enter);
}
.ds-rise-leave-active {
  transition:
    opacity var(--motion-duration-exit) var(--motion-easing-exit),
    transform var(--motion-duration-exit) var(--motion-easing-exit);
}
.ds-rise-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.ds-rise-leave-to {
  opacity: 0;
  transform: translateY(3px);
}

.ds-mark-enter-active {
  transition:
    opacity var(--motion-duration-state) var(--motion-easing-standard),
    transform var(--motion-duration-state) var(--motion-easing-pop);
}
.ds-mark-leave-active {
  transition:
    opacity var(--motion-duration-exit) var(--motion-easing-exit),
    transform var(--motion-duration-exit) var(--motion-easing-exit);
}
.ds-mark-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.ds-mark-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
