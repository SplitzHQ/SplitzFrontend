<script lang="ts" setup>
// The host of the toasts. The app has one instance. To show a toast, call `toast` from `vue-sonner`.
import { PhCheckCircle, PhCircleNotch, PhInfo, PhWarning, PhX, PhXCircle } from "@phosphor-icons/vue";
import { useMutationObserver } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { computed, shallowRef } from "vue";
import { type ToasterProps, Toaster as Sonner } from "vue-sonner";

/**
 * The host of the toasts. The app has one instance. To show a toast, call `toast` from `vue-sonner`.
 * The rules are in `sonner.usage.ts`.
 */
const props = defineProps<ToasterProps>();

const { $t } = useFluent();

/**
 * By default a toast swipes only toward its edge. A phone user also expects to swipe it to the side. vue-sonner takes
 * one list for all positions, so the list has both edges: a toast at the bottom, such as the new-version prompt, swipes
 * down.
 */
const SWIPE_DIRECTIONS: ToasterProps["swipeDirections"] = ["top", "bottom", "left", "right"];

/** Returns the theme of the page. The `dark` class on the root element sets the dark tokens in color.css. */
function readPageTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

const pageTheme = shallowRef(readPageTheme());
useMutationObserver(
  document.documentElement,
  () => {
    pageTheme.value = readPageTheme();
  },
  { attributeFilter: ["class"] }
);

// vue-sonner has English defaults for these two names and a light default theme. A prop of the caller wins.
const toasterProps = computed(() => ({
  ...props,
  containerAriaLabel: props.containerAriaLabel ?? $t("toast-region-label"),
  swipeDirections: props.swipeDirections ?? SWIPE_DIRECTIONS,
  theme: props.theme ?? pageTheme.value,
  toastOptions: { closeButtonAriaLabel: $t("toast-close"), ...props.toastOptions },
}));
</script>

<template>
  <Sonner v-bind="toasterProps">
    <template #success-icon>
      <PhCheckCircle class="icon-4" />
    </template>
    <template #info-icon>
      <PhInfo class="icon-4" />
    </template>
    <template #warning-icon>
      <PhWarning class="icon-4" />
    </template>
    <template #error-icon>
      <PhXCircle class="icon-4" />
    </template>
    <template #loading-icon>
      <PhCircleNotch class="animate-spin icon-4" />
    </template>
    <template #close-icon>
      <PhX class="icon-3" />
    </template>
  </Sonner>
</template>

<!-- Not scoped: vue-sonner renders these parts, and a scoped selector does not reach them. -->
<style>
/* `html` makes each selector stronger than the same selector in vue-sonner. The order of the two style sheets can change. */
html [data-sonner-toaster][data-sonner-theme] {
  --border-radius: 16px;
  --normal-bg: var(--base-bg-primary-reverse);
  --normal-bg-hover: var(--base-bg-primary-reverse_hover);
  --normal-border: transparent;
  --normal-border-hover: transparent;
  --normal-text: var(--base-text-primary-reverse);
  font-family: inherit;
}

html [data-sonner-toast][data-styled="true"] {
  font-size: 14px;
}

html [data-sonner-toast][data-styled="true"] [data-title] {
  text-wrap: pretty;
}

/*
 * On a desktop a toast is as wide as its content. A long text wraps at the width of the toaster. At phone width
 * vue-sonner makes each toast fill the row, and that stays. The breakpoint is the phone breakpoint of vue-sonner.
 * A toast is `position: absolute` and its `transform` moves it in and out, so `margin-inline: auto` centers it and
 * does not use `transform`.
 */
@media (width > 600px) {
  html [data-sonner-toast][data-styled="true"] {
    width: fit-content;
    max-width: var(--width);
  }

  html [data-sonner-toast][data-x-position="center"] {
    right: 0;
    left: 0;
    margin-inline: auto;
  }
}

/* The surface has the opposite theme of the page, so the icons use core colors and not the theme colors. */
html [data-sonner-theme="light"] [data-type="success"] [data-icon] {
  color: var(--core-color-success-400);
}

html [data-sonner-theme="light"] [data-type="error"] [data-icon] {
  color: var(--core-color-error-400);
}

html [data-sonner-theme="light"] [data-type="info"] [data-icon] {
  color: var(--core-color-brand-300);
}

html [data-sonner-theme="dark"] [data-type="success"] [data-icon] {
  color: var(--core-color-success-600);
}

html [data-sonner-theme="dark"] [data-type="error"] [data-icon] {
  color: var(--core-color-error-600);
}

html [data-sonner-theme="dark"] [data-type="info"] [data-icon] {
  color: var(--core-color-brand-600);
}

/* The action button is 28px high. An invisible box makes its tap area 44px high. */
html [data-sonner-toast][data-styled="true"] [data-button] {
  position: relative;
  height: 28px;
  border-radius: 9999px;
  padding-inline: 12px;
  background: var(--base-bg-primary);
  color: var(--base-text-primary);
}

[data-sonner-toast] [data-button]::after {
  content: "";
  position: absolute;
  inset: -8px 0;
}

/* Only a toast that stays has a close button. The button sits in the toast, at the end of the row. */
html [data-sonner-toast][data-styled="true"]:has([data-close-button]) {
  padding-right: 44px;
}

html [data-sonner-toast][data-styled="true"] [data-close-button] {
  top: 50%;
  right: 12px;
  left: auto;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--normal-text);
}

html [data-sonner-toast][data-styled="true"]:hover [data-close-button]:hover {
  background: var(--normal-bg-hover);
}

/* The close button is 20px high. An invisible box makes its tap area 44px high. */
[data-sonner-toast] [data-close-button]::after {
  content: "";
  position: absolute;
  inset: -12px;
}
</style>
