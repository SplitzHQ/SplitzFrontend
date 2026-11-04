<script setup lang="ts">
import { PhCircleNotch } from "@phosphor-icons/vue";
import { computed, useSlots } from "vue";

import type { ButtonSize, ButtonVariant } from "./button";

/**
 * The look of every button in the app. Only SButton, SIconButton and SLinkButton use it.
 * They render the real `<button>` or link around it and add the behavior. Pages must not import it.
 */
export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Makes the button a circle that holds only the `icon-left` slot. */
  iconOnly?: boolean;
  /** Turns the button grey. The wrapper blocks the tap. */
  disabled?: boolean;
  /** Shows a spinner. The spinner replaces the left icon. Without a left icon, it covers the label. */
  loading?: boolean;
}

const {
  variant = "primary",
  size = "md",
  iconOnly = false,
  disabled = false,
  loading = false,
} = defineProps<ButtonBaseProps>();

const slots = useSlots();

const shouldSpinnerCoverContent = computed(() => !iconOnly && slots["icon-left"] === undefined);
</script>

<template>
  <span
    :class="[
      's-button',
      `variant-${variant}`,
      `size-${size}`,
      {
        'icon-only': iconOnly,
        'is-disabled': disabled,
        'is-loading': loading,
      },
    ]"
  >
    <span v-if="$slots['icon-left']" class="icon">
      <Transition name="s-button-swap" mode="out-in">
        <PhCircleNotch v-if="loading" key="spinner" class="animate-spin" aria-hidden="true" />
        <slot key="icon" v-else name="icon-left" class="icon-slot" />
      </Transition>
    </span>
    <span v-if="$slots.default" :class="['label', loading && shouldSpinnerCoverContent ? 'opacity-0' : '']">
      <slot />
    </span>
    <span v-if="$slots['icon-right']" :class="['icon', loading && shouldSpinnerCoverContent ? 'opacity-0' : '']">
      <slot name="icon-right" class="icon-slot" />
    </span>
    <Transition name="s-button-fade">
      <span v-if="loading && shouldSpinnerCoverContent" class="spinner-overlay">
        <PhCircleNotch class="icon animate-spin" aria-hidden="true" />
      </span>
    </Transition>
  </span>
</template>

<style lang="scss" scoped>
// Hover applies only on devices that can hover, so a tap on a phone does not leave a stuck hover color.
// `data-force-state` lets the design-system page show a state without a pointer.
// A disabled or loading button does not react to hover or press.
// The states come from the parent, because the parent is the real <button> or link. It takes focus and attributes.
@mixin hover {
  @media (hover: hover) {
    :hover > &:not(.is-disabled, .is-loading) {
      @content;
    }
  }

  [data-force-state="hover"] > &:not(.is-disabled, .is-loading) {
    @content;
  }
}

@mixin pressed {
  :active > &:not(.is-disabled, .is-loading),
  [data-force-state="pressed"] > &:not(.is-disabled, .is-loading) {
    @content;
  }
}

// The parent takes layout classes such as w-full or fixed (see BUTTON_ROOT_CLASS). This element fills the parent.
@layer components {
  .s-button {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: var(--_gap);
    height: var(--_height);
    min-width: 0;
    padding-inline: var(--_padding);
    border: 1px solid transparent;
    border-radius: 9999px;
    background-color: var(--_bg, transparent);
    color: var(--_text);
    font-size: var(--_font);
    line-height: var(--_line);
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    // Removes the double-tap zoom delay on touch screens.
    touch-action: manipulation;
    transition:
      background-color var(--motion-duration-hover-in) var(--motion-easing-standard),
      border-color var(--motion-duration-hover-in) var(--motion-easing-standard),
      color var(--motion-duration-hover-in) var(--motion-easing-standard),
      transform var(--motion-duration-feedback) var(--motion-easing-standard);

    // The visible button can be smaller than a finger. This box makes the tap area at least 44px × 44px.
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: max(100%, 44px);
      height: max(100%, 44px);
      transform: translate(-50%, -50%);
    }

    @include pressed {
      transform: scale(var(--_press-scale, 0.97));
    }

    // The ring shows only for keyboard focus. A tap does not show it.
    :focus-visible > &,
    [data-force-state="focus"] > & {
      outline: 2px solid var(--_ring, var(--base-border-brand-solid));
      outline-offset: 2px;
    }
  }

  // Reduced motion: the press does not scale. The second rule is the same for <html data-reduce-motion> (see motion.css).
  @media (prefers-reduced-motion: reduce) {
    .s-button {
      --_press-scale: 1;
    }
  }

  :root[data-reduce-motion] .s-button {
    --_press-scale: 1;
  }

  // Size steps.
  .size-sm {
    --_height: 32px;
    --_padding: 12px;
    --_font: 14px;
    --_line: 20px;
    --_icon: 16px;
    --_icon-only: 18px;
    --_gap: 4px;
  }

  .size-md {
    --_height: 40px;
    --_padding: 16px;
    --_font: 15px;
    --_line: 20px;
    --_icon: 18px;
    --_icon-only: 20px;
    --_gap: 6px;
  }

  .size-xl {
    --_height: 52px;
    --_padding: 24px;
    --_font: 17px;
    --_line: 24px;
    --_icon: 20px;
    --_icon-only: 24px;
    --_gap: 8px;
  }

  .icon-only {
    width: var(--_height);
    padding-inline: 0;
    --_icon: var(--_icon-only);
  }

  // Variants. Each one sets the colors through private custom properties, and the disabled rules below override them.
  // The class names have a prefix because Tailwind has an `outline` utility. A class named `outline` draws an extra ring.
  .variant-primary {
    --_bg: var(--base-bg-brand-reverse);
    --_text: var(--base-text-primary-reverse);
    --_icon-color: var(--base-fg-primary-reverse);

    @include hover {
      --_bg: var(--base-bg-brand-reverse_hover);
    }

    @include pressed {
      --_bg: var(--base-bg-brand-reverse_pressed);
    }
  }

  .variant-secondary {
    --_bg: var(--base-bg-neutral);
    --_text: var(--base-text-primary);
    --_icon-color: var(--base-fg-primary);

    @include hover {
      --_bg: var(--base-bg-neutral_hover);
    }

    @include pressed {
      --_bg: var(--base-bg-neutral_pressed);
    }
  }

  // A translucent line takes the hue of the surface, so it stays visible on every tinted surface.
  .variant-outline {
    --_outline-line: var(--core-alpha-black-20);
    --_outline-hover: var(--core-alpha-black-5);
    --_outline-pressed: var(--core-alpha-black-10);
    --_outline-disabled-line: var(--core-alpha-black-10);
    --_outline-disabled-text: var(--core-alpha-black-40);
    --_text: var(--base-text-primary);
    --_icon-color: var(--base-fg-primary);
    border-color: var(--_outline-line);

    @include hover {
      --_bg: var(--_outline-hover);
    }

    @include pressed {
      --_bg: var(--_outline-pressed);
    }
  }

  .dark .variant-outline {
    --_outline-line: var(--core-alpha-white-30);
    --_outline-hover: var(--core-alpha-white-5);
    --_outline-pressed: var(--core-alpha-white-10);
    --_outline-disabled-line: var(--core-alpha-white-10);
    --_outline-disabled-text: var(--core-alpha-white-40);
  }

  .variant-ghost {
    --_text: var(--base-text-primary);
    --_icon-color: var(--base-fg-primary);

    @include hover {
      --_bg: var(--base-bg-neutral);
    }

    @include pressed {
      --_bg: var(--base-bg-neutral_hover);
    }
  }

  .variant-destructive {
    --_bg: var(--base-bg-error-reverse);
    --_text: var(--base-text-primary-reverse);
    --_icon-color: var(--base-fg-primary-reverse);
    --_ring: var(--base-border-error-solid);

    @include hover {
      --_bg: var(--base-bg-error-reverse_hover);
    }

    @include pressed {
      --_bg: var(--base-bg-error-reverse_pressed);
    }
  }

  .variant-destructive-soft {
    --_bg: var(--base-bg-error);
    --_text: var(--base-text-error_hover);
    --_icon-color: var(--base-fg-error_hover);
    --_ring: var(--base-border-error-solid);

    @include hover {
      --_bg: var(--base-bg-error_hover);
    }

    @include pressed {
      --_bg: var(--base-bg-error_pressed);
    }
  }

  // Disabled keeps the shape of the variant: filled buttons get a grey fill, outline keeps its border, ghost stays clear.
  .is-disabled {
    --_text: var(--base-text-disabled);
    --_icon-color: var(--base-fg-disabled);
    cursor: default;

    &.variant-primary,
    &.variant-secondary,
    &.variant-destructive,
    &.variant-destructive-soft {
      --_bg: var(--base-bg-disabled);
    }

    // A fixed grey label gets lost on a tinted surface, so outline uses a translucent label.
    &.variant-outline {
      --_text: var(--_outline-disabled-text);
      --_icon-color: var(--_outline-disabled-text);
      border-color: var(--_outline-disabled-line);
    }
  }

  // A loading button keeps its colors. Only a disabled button turns grey.
  .is-loading {
    cursor: default;
  }

  .label {
    min-width: 0;
    overflow: hidden;
    padding-inline: 2px;
    text-overflow: ellipsis;
    transition: opacity var(--motion-duration-feedback) var(--motion-easing-standard);
  }

  .icon {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    width: var(--_icon);
    height: var(--_icon);
    color: var(--_icon-color, currentColor);
    font-size: var(--_icon);
    transition: opacity var(--motion-duration-feedback) var(--motion-easing-standard);
  }

  .icon-slot {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // Without a left icon, the label and right icon fade out and the spinner covers them. The width does not change.
  .spinner-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .s-button-swap-enter-active,
  .s-button-swap-leave-active,
  .s-button-fade-enter-active,
  .s-button-fade-leave-active {
    transition:
      opacity var(--motion-duration-feedback) var(--motion-easing-standard),
      transform var(--motion-duration-feedback) var(--motion-easing-standard);
  }

  .s-button-swap-enter-from,
  .s-button-swap-leave-to {
    opacity: 0;
    transform: scale(0.6);
  }

  .s-button-fade-enter-from,
  .s-button-fade-leave-to {
    opacity: 0;
  }
}
</style>
