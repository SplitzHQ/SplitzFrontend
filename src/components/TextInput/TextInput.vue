<script setup lang="ts">
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, useId } from "vue";

export interface TextInputProps {
  placeholder: string;
  /** Visible label rendered above the field. */
  label?: string;
  /** Keeps the label for assistive tech only. */
  hideLabel?: boolean;
  /** Helper text rendered under the field. */
  hint?: string;
  id?: string;
  name?: string;
  type?: "text" | "email" | "password";
  autocomplete?: string;
  inputmode?: "text" | "numeric" | "email";
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** `plain` renders the bare input for inline layouts that provide their own container. */
  variant?: "outlined" | "plain";
}

const model = defineModel<string | null | undefined>();

const {
  placeholder,
  label,
  hideLabel,
  hint,
  id,
  name,
  type = "text",
  autocomplete,
  inputmode,
  required,
  disabled,
  invalid,
  variant = "outlined",
} = defineProps<TextInputProps>();

const { $t } = useFluent();

const generatedId = useId();
const inputId = computed(() => id ?? generatedId);

const revealed = ref(false);
const isPassword = computed(() => type === "password");
const resolvedType = computed(() => (isPassword.value && revealed.value ? "text" : type));
const hasValue = computed(() => (model.value ?? "").length > 0);

// States follow the Figma "Input" component: default, hover/focus, filled, error.
const containerClass = computed(() => {
  if (disabled) return "border-base-border-disabled_subtle bg-base-bg-disabled_subtle";
  if (invalid) return "border-base-border-error-solid";
  if (hasValue.value) return "border-base-border-brand-solid";
  return "border-base-border-secondary hover:border-base-border-brand-solid focus-within:border-base-border-brand-solid";
});

const iconClass = computed(() => {
  if (disabled) return "text-base-fg-disabled";
  if (invalid) return "text-base-fg-error";
  if (hasValue.value) return "text-base-fg-primary";
  return "text-base-fg-placeholder";
});

const textClass = computed(() => (invalid ? "text-base-text-error" : "text-base-text-primary"));
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/form-control-has-label -->
  <input
    v-if="variant === 'plain'"
    :id="inputId"
    v-model="model"
    :name="name"
    :type="resolvedType"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :inputmode="inputmode"
    :required="required"
    :disabled="disabled"
    class="bg-transparent text-sm font-normal text-base-text-primary placeholder:text-sm placeholder:font-normal placeholder:text-base-text-placeholder focus-visible:outline-hidden"
  />

  <div v-else class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" :class="hideLabel ? 'sr-only' : 'text-sm font-semibold text-base-text-primary'">
      {{ label }}
    </label>

    <div :class="['flex w-full items-center gap-2 rounded-xl border p-3', containerClass]">
      <span v-if="$slots.icon" :class="['flex size-5 shrink-0 items-center justify-center [&>svg]:size-5', iconClass]">
        <slot name="icon" />
      </span>

      <input
        :id="inputId"
        v-model="model"
        :name="name"
        :type="resolvedType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :aria-invalid="invalid ? 'true' : undefined"
        :class="[
          'min-w-0 flex-1 bg-transparent text-base leading-6 font-normal placeholder:text-base-text-placeholder focus-visible:outline-hidden disabled:text-base-text-disabled',
          textClass,
        ]"
      />

      <!-- The label lives in visually hidden text (not aria-label) so label-based lookups only match the input. -->
      <button
        v-if="isPassword"
        type="button"
        class="flex size-6 shrink-0 items-center justify-center rounded-full text-base-fg-quaternary hover:text-base-fg-primary_hover [&>svg]:size-5"
        :disabled="disabled"
        @click="revealed = !revealed"
      >
        <PhEyeSlash v-if="revealed" />
        <PhEye v-else />
        <span class="sr-only">{{ revealed ? $t("text-input-hide-password") : $t("text-input-show-password") }}</span>
      </button>
    </div>

    <p v-if="hint" class="px-1 text-xs text-base-text-quaternary">{{ hint }}</p>
  </div>
</template>
