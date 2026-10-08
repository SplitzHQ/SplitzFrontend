<script setup lang="ts">
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";

export interface FormFieldProps {
  id: string;
  label: string;
  name?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autocomplete?: string;
  inputmode?: "text" | "numeric" | "email";
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Helper text rendered under the field. */
  hint?: string;
  /** Keeps the label for assistive tech only. */
  hideLabel?: boolean;
}

const model = defineModel<string>({ required: true });

const {
  id,
  label,
  name,
  type = "text",
  placeholder,
  autocomplete,
  inputmode,
  required,
  disabled,
  invalid,
  hint,
  hideLabel,
} = defineProps<FormFieldProps>();

const { $t } = useFluent();

const revealed = ref(false);
const isPassword = computed(() => type === "password");
const resolvedType = computed(() => (isPassword.value && revealed.value ? "text" : type));
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" :class="hideLabel ? 'sr-only' : 'text-sm font-semibold text-base-text-primary'">
      {{ label }}
    </label>

    <div
      :class="[
        'flex items-center gap-2.5 rounded-full px-4 py-3 ring-1 ring-transparent ring-inset focus-within:ring-base-border-brand-solid',
        disabled ? 'bg-base-bg-disabled_subtle' : 'bg-util-alpha-black-5',
        invalid ? 'ring-base-border-error-solid' : '',
      ]"
    >
      <span
        v-if="$slots.icon"
        :class="[
          'flex size-5 shrink-0 items-center justify-center [&>svg]:size-5',
          disabled ? 'text-base-fg-disabled' : 'text-base-fg-quaternary',
        ]"
      >
        <slot name="icon" />
      </span>

      <input
        :id="id"
        v-model="model"
        :name="name"
        :type="resolvedType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :aria-invalid="invalid ? 'true' : undefined"
        class="min-w-0 flex-1 bg-transparent text-base text-base-text-primary placeholder:text-base-text-placeholder focus-visible:outline-hidden disabled:text-base-text-disabled"
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
        <span class="sr-only">{{ revealed ? $t("form-field-hide-password") : $t("form-field-show-password") }}</span>
      </button>
    </div>

    <p v-if="hint" class="px-1 text-xs text-base-text-quaternary">{{ hint }}</p>
  </div>
</template>
