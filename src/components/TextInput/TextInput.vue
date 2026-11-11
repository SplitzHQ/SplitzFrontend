<script setup lang="ts">
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";
import { useResizeObserver } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { computed, ref, useId, useTemplateRef, watch } from "vue";

import { MOTION_EASING, motionMs } from "@/libs/motion";

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
  // A transition uses the time of the state that it goes to. So these two classes make hover and focus faster than the return to rest.
  const enterTime = "hover:duration-hover-in has-[input:focus]:duration-hover-in";
  return `${restBorder} ${enterTime} hover:border-base-border-brand-solid focus-within:border-base-border-brand-solid has-[input:focus]:ring-base-border-brand-solid`;
});

const iconClass = computed(() => {
  if (disabled) return "text-base-fg-disabled";
  if (isInvalid.value) return "text-base-fg-error";
  if (hasValue.value) return "text-base-fg-primary";
  return "text-base-fg-placeholder";
});

const textClass = computed(() => (isInvalid.value ? "text-base-text-error" : "text-base-text-primary"));

const fieldEl = useTemplateRef<HTMLElement>("field");
const messageEl = useTemplateRef<HTMLElement>("message");

const messageHeight = ref<number>();
useResizeObserver(messageEl, () => {
  messageHeight.value = messageEl.value?.offsetHeight;
});

const messageEnterClass = computed(() =>
  ["transition-[opacity,translate] duration-state ease-enter", hint ? "delay-(--motion-duration-exit)" : ""].join(" ")
);

/** The offsets of the shake in pixels. Each move is smaller than the last, so the field stops softly. */
const SHAKE_OFFSETS = [0, -3, 2, -1, 0];

// A new error shakes the field one time. A change from one error to another error does not. Reduced motion makes the time 0.
watch(
  () => error,
  (next, previous) => {
    const duration = motionMs("container");
    if (!next || previous || duration === 0) return;
    fieldEl.value?.animate?.(
      SHAKE_OFFSETS.map((offset) => ({ translate: `${offset}px 0` })),
      { duration, easing: MOTION_EASING.standard }
    );
  }
);
</script>

<template>
  <!-- The `text-sm` text fits a row of `text-sm` text. The viewport stops the zoom of iOS, so the text can be under 16px. -->
  <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
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
    class="h-11 w-full bg-transparent text-sm font-normal text-ellipsis text-base-text-primary placeholder:font-normal placeholder:text-base-text-placeholder focus-visible:outline-hidden"
  />

  <div v-else class="flex flex-col">
    <div class="flex flex-col gap-1.5">
      <!-- The side space is the padding and the border of the field, so the label, the icon and the text under the field line up. -->
      <label
        v-if="label"
        :for="inputId"
        :class="hideLabel ? 'sr-only' : 'px-3.25 text-sm font-semibold text-base-text-primary'"
      >
        {{ label }}
      </label>

      <!-- The ring is `ring-0` and inset in each state, so it can fade. A ring that exists only on focus would change at once. -->
      <div
        ref="field"
        :class="[
          'flex w-full items-center gap-2 rounded-xl border ring-0 ring-transparent transition-[border-color,box-shadow,background-color] duration-exit ease-standard ring-inset has-[input:focus]:ring-1',
          isPassword && 'pr-3',
          containerClass,
        ]"
      >
        <!--
          The whole field is the tap target, but the input is smaller than the field. This `<label>` holds the padding, the
          icon and the input, so a tap on the padding or the icon gives the focus to the input. The password button is
          outside it, so the button keeps its own press and does not add its name to the name of the input.
          `mousedown.self.prevent` keeps the focus in the input during a press on the padding or the icon, so a phone keeps
          its keyboard open. Without it, the focus leaves the input at `mousedown` and comes back at `click`. A press on the
          input is not on the label itself, so the caret can still move. The icon has `pointer-events-none`, so a press on
          the icon is on the label itself.
        -->
        <label
          :for="inputId"
          :class="[
            'flex min-w-0 flex-1 items-center gap-2 py-3 pl-3',
            !isPassword && 'pr-3',
            disabled ? 'cursor-not-allowed' : 'cursor-text',
          ]"
          @mousedown.self.prevent
        >
          <span
            v-if="$slots.icon"
            :class="[
              'pointer-events-none flex size-5 shrink-0 items-center justify-center transition-colors duration-exit ease-standard [&>svg]:size-5',
              iconClass,
            ]"
          >
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
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-describedby="describedByIds"
            :class="[
              'min-w-0 flex-1 bg-transparent text-base leading-6 font-normal transition-colors duration-exit ease-standard placeholder:text-base-text-placeholder focus-visible:outline-hidden disabled:text-base-text-disabled',
              textClass,
            ]"
          />
        </label>

        <!-- The label lives in visually hidden text (not aria-label) so label-based lookups only match the input. -->
        <!--
          An invisible box around the button makes the tap area larger than the button. The button and the icon have empty
          space around the ink, so the negative margin moves the ink of the icon onto the same line as the start icon, on
          the other side of the field.
        -->
        <button
          v-if="isPassword"
          type="button"
          class="relative mr-[-3.25px] flex size-6 shrink-0 items-center justify-center rounded-full text-base-fg-quaternary after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-base-fg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid [&>svg]:size-5"
          :disabled="disabled"
          @click="revealed = !revealed"
        >
          <PhEyeSlash v-if="revealed" />
          <PhEye v-else />
          <span class="sr-only">{{ revealed ? $t("text-input-hide-password") : $t("text-input-show-password") }}</span>
        </button>
      </div>
    </div>

    <!-- The area changes its height smoothly, so the content below does not jump. The first height comes from `auto`, with no motion. -->
    <div
      class="overflow-hidden transition-[height] duration-container ease-enter"
      :style="messageHeight === undefined ? undefined : { height: `${messageHeight}px` }"
    >
      <div ref="message" class="relative">
        <!--
          The text leaves in `absolute` position, so the area gets its new height at the start of the leave. A hint and an
          error swap in one place, so the new text waits until the old text has left.
          `will-change` keeps the text on its own layer at all times. Without it, Windows draws the text differently during
          the fade and after it, and the color seems to jump from a bright red to a dark red at the end.
        -->
        <Transition
          :enter-active-class="messageEnterClass"
          enter-from-class="-translate-y-1 opacity-0"
          leave-active-class="absolute inset-x-0 top-0 transition-opacity duration-exit ease-exit"
          leave-to-class="opacity-0"
        >
          <!-- The error appears after the first render, so `role="alert"` makes a screen reader read it. -->
          <p
            v-if="error"
            :id="errorId"
            key="error"
            role="alert"
            class="px-3.25 pt-1.5 text-xs text-base-text-error will-change-[opacity]"
          >
            {{ error }}
          </p>
          <p
            v-else-if="hint"
            :id="hintId"
            key="hint"
            class="px-3.25 pt-1.5 text-xs text-base-text-quaternary will-change-[opacity]"
          >
            {{ hint }}
          </p>
        </Transition>
      </div>
    </div>
  </div>
</template>
