<script setup lang="ts">
export interface SSwitchProps {
  /** Accessible name, used when there is no visible label wired through `aria-labelledby`. */
  label?: string;
  disabled?: boolean;
  /** Visual hint that the value is inherited rather than set here. */
  inherited?: boolean;
}

const model = defineModel<boolean>({ required: true });
const { label, disabled = false, inherited = false } = defineProps<SSwitchProps>();

function toggle() {
  if (disabled) return;
  model.value = !model.value;
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    :disabled="disabled"
    :class="[
      'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      model ? 'bg-util-color-brand-700' : 'bg-util-alpha-black-10',
      inherited ? 'opacity-70 ring-1 ring-base-border-tertiary ring-inset' : '',
    ]"
    @click="toggle"
  >
    <span
      aria-hidden="true"
      :class="[
        'block size-6 rounded-full bg-base-bg-primary shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)]',
        model ? 'translate-x-5' : 'translate-x-0',
      ]"
    />
  </button>
</template>
