<script setup lang="ts">
import { PhCircleNotch } from "@phosphor-icons/vue";

/**
 * A setting that is on or off. See `switch.usage.ts` for when to use it.
 * The track is 28px high. An invisible box around it makes the tap area 44px high.
 * Set `aria-label` to the text of the visible label of the row, because the switch has no text.
 */
export interface SSwitchProps {
  /** Blocks the switch because another action is in progress. A disabled switch loses the keyboard focus. */
  disabled?: boolean;
  /** Shows that a change of this switch saves. The switch keeps its color and the keyboard focus, and ignores taps. */
  busy?: boolean;
  /** Shows that the value comes from a parent setting and is not set here. */
  inherited?: boolean;
}

const model = defineModel<boolean>({ required: true });
const { disabled = false, busy = false, inherited = false } = defineProps<SSwitchProps>();

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
    :aria-busy="busy ? 'true' : undefined"
    :aria-disabled="busy ? 'true' : undefined"
    :disabled="disabled"
    :class="[
      'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-state ease-standard',
      'after:absolute after:top-1/2 after:left-0 after:h-11 after:w-full after:-translate-y-1/2',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid disabled:cursor-not-allowed',
      model
        ? 'bg-util-color-brand-700 disabled:bg-core-alpha-brand-40'
        : 'bg-util-alpha-black-20 disabled:bg-base-bg-disabled',
      inherited ? 'ring-1 ring-base-border-tertiary ring-inset enabled:opacity-70' : '',
      busy ? 'cursor-default' : '',
    ]"
    @click="toggle"
  >
    <span
      aria-hidden="true"
      :class="[
        'switch-thumb flex size-6 items-center justify-center rounded-full bg-base-bg-primary shadow-sm',
        model ? 'translate-x-5' : 'translate-x-0',
      ]"
    >
      <Transition name="switch-spinner">
        <PhCircleNotch v-if="busy" class="size-4 animate-spin text-base-fg-brand" aria-hidden="true" />
      </Transition>
    </span>
  </button>
</template>

<style scoped>
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

.switch-spinner-enter-active,
.switch-spinner-leave-active {
  transition: opacity var(--motion-duration-state) var(--motion-easing-standard);
}

.switch-spinner-enter-from,
.switch-spinner-leave-to {
  opacity: 0;
}
</style>
