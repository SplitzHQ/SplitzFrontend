<!--
  @fallthroughAttributes true
  The type check accepts the native attributes of the root element, such as `id` or `tabindex`, on this component.
-->
<script setup lang="ts">
/**
 * A setting that is on or off. See `switch.usage.ts` for when to use it.
 * An invisible box around the track makes the tap area 44px high.
 */
export interface SSwitchProps {
  /** The name for a screen reader. Use the text of the visible label of the row. */
  label: string;
  /** Blocks the switch because another action is in progress. A disabled switch loses the keyboard focus. */
  disabled?: boolean;
  /**
   * Shows that a change of this switch saves. The switch keeps the keyboard focus and ignores taps. After a short delay
   * it fades and shows an arc on the thumb, so a fast save shows nothing.
   */
  busy?: boolean;
  /** Shows that the value comes from a parent setting and is not set here. */
  inherited?: boolean;
}

const model = defineModel<boolean>({ required: true });
const { label, disabled = false, busy = false, inherited = false } = defineProps<SSwitchProps>();

/** Changes the value, except while a change saves. A busy switch is not natively disabled, so it still gets clicks. */
function toggle() {
  if (busy) return;
  model.value = !model.value;
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    :aria-busy="busy ? 'true' : undefined"
    :aria-disabled="busy ? 'true' : undefined"
    :disabled="disabled"
    :class="[
      'switch-track relative inline-flex h-6 w-12 shrink-0 items-center rounded-full p-0.5',
      'after:absolute after:top-1/2 after:left-0 after:h-11 after:w-full after:-translate-y-1/2',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid disabled:cursor-not-allowed',
      model
        ? 'bg-util-color-brand-700 disabled:bg-core-alpha-brand-40'
        : 'bg-util-alpha-black-20 disabled:bg-base-bg-disabled',
      inherited ? 'ring-1 ring-base-border-tertiary ring-inset enabled:opacity-70' : '',
      busy ? 'is-busy cursor-default' : '',
    ]"
    @click="toggle"
  >
    <span
      aria-hidden="true"
      :class="[
        'switch-thumb relative h-5 w-7 rounded-full bg-base-bg-primary shadow-sm',
        model ? 'translate-x-4' : 'translate-x-0',
      ]"
    >
      <Transition name="switch-arc">
        <!-- The arc sits inside the edge. On the edge it has the color of the track and looks like a bite in the thumb. -->
        <svg
          v-if="busy"
          class="switch-arc absolute inset-0 size-full text-base-fg-brand"
          viewBox="0 0 28 20"
          fill="none"
        >
          <rect
            x="2.5"
            y="2.5"
            width="23"
            height="15"
            rx="7.5"
            pathLength="100"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-dasharray="26 74"
          />
        </svg>
      </Transition>
    </span>
  </button>
</template>

<style scoped>
.switch-track {
  /* A save that ends sooner than this delay shows no fade and no arc. It is not a motion token: only this wait uses it. */
  --switch-busy-delay: calc(300ms * var(--motion-slow));

  transition:
    background-color var(--motion-duration-state) var(--motion-easing-standard),
    outline-color var(--motion-duration-state) var(--motion-easing-standard),
    opacity var(--motion-duration-exit) var(--motion-easing-standard);
}

/* Only the fade waits. A tap must show the new track and the new thumb position at once. */
.switch-track.is-busy {
  opacity: 0.6;
  transition:
    background-color var(--motion-duration-state) var(--motion-easing-standard),
    outline-color var(--motion-duration-state) var(--motion-easing-standard),
    opacity var(--motion-duration-state) var(--motion-easing-standard) var(--switch-busy-delay);
}

/* The thumb moves with the pop easing. Its color uses the standard easing, because a color must not overshoot. */
.switch-thumb {
  transition:
    translate var(--motion-duration-state) var(--motion-easing-pop),
    background-color var(--motion-duration-state) var(--motion-easing-standard);
}

/* The dark thumb is near black, so it sinks into a disabled track. No token is light in light mode and grey in dark mode. */
.dark :disabled > .switch-thumb {
  background-color: var(--base-fg-disabled);
}

.switch-arc-enter-active {
  transition: opacity var(--motion-duration-state) var(--motion-easing-standard) var(--switch-busy-delay);
}

.switch-arc-leave-active {
  transition: opacity var(--motion-duration-exit) var(--motion-easing-standard);
}

.switch-arc-enter-from,
.switch-arc-leave-to {
  opacity: 0;
}

/* The dash moves along the edge of the thumb. A negative offset moves it clockwise. With reduced motion, the loop token is 0, so the arc stays still. */
.switch-arc rect {
  animation: switch-arc-run var(--motion-duration-loop) var(--motion-easing-loop) infinite;
}

@keyframes switch-arc-run {
  to {
    stroke-dashoffset: -100;
  }
}
</style>
