<script setup lang="ts">
import { computed } from "vue";

import BrandTapGlyph from "@/components/BrandWordmark/BrandTapGlyph.vue";
import { useKeyboardFreeHeight } from "@/libs/use-keyboard-free-height";

/**
 * Shared layout shell for signed-out authentication pages (sign in, register, password reset, email confirmation).
 * See `auth-shell.usage.ts` for full usage and layout rules.
 *
 * Slots:
 * - `icon`: Status icon shown above the title on result pages.
 * - `default`: Page body and primary actions. Pages with a form render their own `<form>` and submit handler here.
 * - `footer`: Secondary navigation links to other auth pages, pinned to the bottom.
 */
export interface AuthShellProps {
  /** Main page heading (`<h1>`). */
  title: string;
  /** Short supporting sentence displayed below the title. */
  subtitle?: string;
  /** Exact substring inside `subtitle` to emphasize in bold primary text (such as the user's email address). */
  highlight?: string;
  /**
   * Renders the shell as a result screen (such as "Check your email" or "Email confirmed") instead of a form screen.
   * Hides the top brand logo so an `AuthStatusIcon` can take its place, and enables `aria-live="polite"` on the
   * heading block so screen readers announce in-place state updates.
   */
  isResultPage?: boolean;
}

const { title, subtitle, highlight, isResultPage } = defineProps<AuthShellProps>();

/** Splits `subtitle` around `highlight` so the matched substring can be styled inline. */
const subtitleParts = computed(() => {
  const [before = "", after = ""] = highlight ? (subtitle ?? "").split(highlight) : [subtitle ?? ""];
  return { after, before, hasHighlight: Boolean(highlight && subtitle?.includes(highlight)) };
});

const keyboardFreeHeight = useKeyboardFreeHeight();
</script>

<template>
  <!-- Clip overflow so the upward entrance animation does not briefly create a page scrollbar. -->
  <main
    class="flex min-h-dvh flex-col overflow-hidden bg-base-bg-primary"
    :style="keyboardFreeHeight === undefined ? undefined : { minHeight: `${keyboardFreeHeight}px` }"
  >
    <!-- Fill the viewport on mobile; on `sm+` screens, center a phone-sized column instead of stretching edge to edge. -->
    <div
      class="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 pt-safe-10 px-safe-5 pb-safe-6 sm:my-auto sm:min-h-176 sm:flex-none"
    >
      <!-- `px-3.25` matches `TextInput`'s horizontal inset (12px padding + 1px border) so the logo aligns with input text. -->
      <header v-if="!isResultPage" class="auth-reveal flex items-center px-3.25">
        <BrandTapGlyph class="text-util-color-brand-700" />
      </header>

      <section class="auth-reveal flex flex-1 flex-col gap-10">
        <!-- Result pages can transition between loading, success, and error in place; announce heading updates to screen readers. -->
        <div class="flex flex-col gap-4 px-3.25" :aria-live="isResultPage ? 'polite' : undefined">
          <slot name="icon" />
          <div class="flex flex-col gap-2">
            <h1 class="text-display-sm font-semibold tracking-tight text-base-text-primary">{{ title }}</h1>
            <!-- Keep the `<span>` tight against `before` and `after` because those slices already preserve surrounding spaces. -->
            <p v-if="subtitle" class="text-base text-base-text-tertiary">
              {{ subtitleParts.before
              }}<span v-if="subtitleParts.hasHighlight" class="font-medium text-base-text-primary">{{ highlight }}</span
              >{{ subtitleParts.after }}
            </p>
          </div>
        </div>

        <slot />
      </section>

      <!-- Give each footer child an invisible 44px-tall `::after` hit area to meet touch target size guidelines without adding visual height. -->
      <footer
        v-if="$slots.footer"
        class="auth-reveal flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium *:relative *:after:absolute *:after:top-1/2 *:after:left-0 *:after:h-11 *:after:w-full *:after:-translate-y-1/2"
      >
        <slot name="footer" />
      </footer>
    </div>
  </main>
</template>

<style scoped>
/*
 * Staggered entrance animation for the header, content section, and footer (550ms duration, 90ms stagger at default speed).
 * Derived from `--motion-duration-container`, which resolves to 0ms when reduced motion is enabled.
 */
.auth-reveal {
  --auth-reveal-duration: calc(var(--motion-duration-container) * 2.2);
  --auth-reveal-stagger: calc(var(--motion-duration-container) * 0.36);

  animation: auth-rise var(--auth-reveal-duration) var(--motion-easing-enter) both;
}

.auth-reveal:nth-child(2) {
  animation-delay: var(--auth-reveal-stagger);
}

.auth-reveal:nth-child(3) {
  animation-delay: calc(var(--auth-reveal-stagger) * 2);
}

@keyframes auth-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
</style>
