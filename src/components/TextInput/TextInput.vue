<script setup lang="ts">
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, useId, useTemplateRef } from "vue";

/** A text field with an optional label and hint. See `text-input.usage.ts` for when to use it. */
export interface TextInputProps {
  /** The text in the empty field. It is a sample of the value, not the name of the field. */
  placeholder: string;
  /** The name of the field. It shows above the field. The `plain` variant uses it only for a screen reader. */
  label?: string;
  /** Keeps the label for a screen reader only. */
  hideLabel?: boolean;
  /** Help text under the field. A screen reader reads it after the label. */
  hint?: string;
  /** The error text under the field. It replaces the hint and shows the error colors. The `plain` variant does not show it. */
  error?: string;
  /** The ID of an element outside the field that describes it, for example a Notice with the error. */
  describedBy?: string;
  /** The ID of the input. The default is a generated ID. Set it when a `<label>` outside the field names the input. */
  id?: string;
  /** The name of the input in a form. */
  name?: string;
  /** The type of the input. A password field gets a show and hide button. */
  type?: "text" | "email" | "password";
  /** The native `autocomplete` value of the input. */
  autocomplete?: string;
  /** The keyboard that a phone shows. */
  inputmode?: "text" | "numeric" | "email";
  /** Marks the input as required for the browser. The field shows no visible mark. */
  required?: boolean;
  /** Blocks input and shows the disabled colors. */
  disabled?: boolean;
  /** Shows the error colors and tells a screen reader that the value is wrong. Use it when the error text is outside the field. */
  invalid?: boolean;
  /** `outlined` is the full field. `plain` is the bare input, for an inline layout that has its own container. */
  variant?: "outlined" | "plain";
}

const model = defineModel<string | null | undefined>();

const {
  placeholder,
  label,
  hideLabel,
  hint,
  error,
  describedBy,
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
const hintId = computed(() => `${inputId.value}-hint`);
const errorId = computed(() => `${inputId.value}-error`);
const isInvalid = computed(() => invalid || Boolean(error));

/** Returns the ID of the text under the field. The `plain` variant shows no text there. */
const messageId = computed(() => {
  if (variant === "plain") return undefined;
  if (error) return errorId.value;
  return hint ? hintId.value : undefined;
});
// A screen reader reads the text under the field first, then the element outside the field.
const describedByIds = computed(() => [messageId.value, describedBy].filter(Boolean).join(" ") || undefined);

const revealed = ref(false);
const isPassword = computed(() => type === "password");
const resolvedType = computed(() => (isPassword.value && revealed.value ? "text" : type));
const hasValue = computed(() => (model.value ?? "").length > 0);

// The brand border shows hover and focus. A filled field at rest has a darker gray border, so a finished form does not look focused.
// A field with an error does not change the border color on focus, so an inset ring shows the focus.
const containerClass = computed(() => {
  if (disabled) return "border-base-border-disabled_subtle bg-base-bg-disabled_subtle";
  if (isInvalid.value) return "border-base-border-error-solid has-[input:focus]:ring-base-border-error-solid";
  const restBorder = hasValue.value ? "border-base-border-primary" : "border-base-border-secondary";
  return `${restBorder} hover:border-base-border-brand-solid focus-within:border-base-border-brand-solid has-[input:focus]:ring-base-border-brand-solid`;
});

const iconClass = computed(() => {
  if (disabled) return "text-base-fg-disabled";
  if (isInvalid.value) return "text-base-fg-error";
  if (hasValue.value) return "text-base-fg-primary";
  return "text-base-fg-placeholder";
});

const textClass = computed(() => (isInvalid.value ? "text-base-text-error" : "text-base-text-primary"));

const inputEl = useTemplateRef<HTMLInputElement>("input");

/** Returns true when a press hits the input or the reveal button, which handle the press themselves. */
function hitsOwnControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("input, button") !== null;
}

/** A press on the padding or the icon does not take the focus away, so a phone keeps its keyboard open. */
function onFieldMouseDown(event: MouseEvent): void {
  if (!hitsOwnControl(event.target)) event.preventDefault();
}

/** The whole field is the touch target, but only the input takes the focus. `click` counts as a user gesture on iOS. */
function onFieldClick(event: MouseEvent): void {
  if (!hitsOwnControl(event.target)) inputEl.value?.focus();
}
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
    :aria-label="label"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :aria-describedby="describedByIds"
    class="h-11 bg-transparent text-sm font-normal text-base-text-primary placeholder:text-sm placeholder:font-normal placeholder:text-base-text-placeholder focus-visible:outline-hidden"
  />

  <div v-else class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" :class="hideLabel ? 'sr-only' : 'text-sm font-semibold text-base-text-primary'">
      {{ label }}
    </label>

    <!--
      The whole field is the tap target, but the input is smaller than the field. Without these handlers, a tap on the
      padding or the icon does nothing.
      - `mousedown` stops the browser from moving the focus away from the input, so a phone keeps its keyboard open.
      - `click` then gives the focus to the input. iOS opens the keyboard only in a user gesture, and `click` is one.
      - A press on a control in the field, for example the password button, goes to that control. See `hitsOwnControl`.
      The handlers are only for a pointer. The input stays in the tab order and the label names it, so a keyboard or a
      screen reader does not use this `div`. That is why the `div` has no role or key handlers.
    -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <div
      :class="[
        'flex w-full items-center gap-2 rounded-xl border p-3 has-[input:focus]:ring-1 has-[input:focus]:ring-inset',
        disabled ? 'cursor-not-allowed' : 'cursor-text',
        containerClass,
      ]"
      @mousedown="onFieldMouseDown"
      @click="onFieldClick"
    >
      <span v-if="$slots.icon" :class="['flex size-5 shrink-0 items-center justify-center [&>svg]:size-5', iconClass]">
        <slot name="icon" />
      </span>

      <input
        :id="inputId"
        ref="input"
        v-model="model"
        :name="name"
        :type="resolvedType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-describedby="describedByIds"
        :class="[
          'min-w-0 flex-1 bg-transparent text-base leading-6 font-normal placeholder:text-base-text-placeholder focus-visible:outline-hidden disabled:text-base-text-disabled',
          textClass,
        ]"
      />

      <!-- The label lives in visually hidden text (not aria-label) so label-based lookups only match the input. -->
      <!-- The button is 24px. An invisible box around it makes the tap area 44px. -->
      <button
        v-if="isPassword"
        type="button"
        class="relative flex size-6 shrink-0 items-center justify-center rounded-full text-base-fg-quaternary after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-base-fg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid [&>svg]:size-5"
        :disabled="disabled"
        @click="revealed = !revealed"
      >
        <PhEyeSlash v-if="revealed" />
        <PhEye v-else />
        <span class="sr-only">{{ revealed ? $t("text-input-hide-password") : $t("text-input-show-password") }}</span>
      </button>
    </div>

    <!-- The error appears after the first render, so `role="alert"` makes a screen reader read it. -->
    <p v-if="error" :id="errorId" role="alert" class="px-1 text-xs text-base-text-error">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="px-1 text-xs text-base-text-quaternary">{{ hint }}</p>
  </div>
</template>
