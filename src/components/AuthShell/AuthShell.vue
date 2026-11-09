<script setup lang="ts">
import { computed } from "vue";

import { SIGN_IN_PATTERN } from "@/components/BrandPattern/brand-pattern";
import BrandPattern from "@/components/BrandPattern/BrandPattern.vue";
import BrandTapMark from "@/components/BrandWordmark/BrandTapMark.vue";
import { useKeyboardFreeHeight } from "@/libs/use-keyboard-free-height";

/**
 * The page frame of a sign-in or account page. See `auth-shell.usage.ts`.
 * Distance makes three groups: the title, the content and the actions. The actions stay at the bottom of the screen.
 * Slots: `icon` goes above the title on a status page, the default slot holds the content, `actions` holds the main
 * button and its links, and `footer` holds the links to other account pages.
 */
export interface AuthShellProps {
  /** Rendered as the page's only h1. */
  title: string;
  /** One sentence under the title. */
  subtitle?: string;
  /** A part of the subtitle in a stronger color, for example the email address of the person. */
  highlight?: string;
  /** A page that shows a result. It has no logo, and a screen reader reads a change of the title. */
  status?: boolean;
  /** Makes the content and the actions one form, so the Return key of the keyboard submits it. */
  onSubmit?: () => void;
}

const { title, subtitle, highlight, status, onSubmit } = defineProps<AuthShellProps>();

/** The subtitle in parts. Without the highlighted text in it, the whole subtitle is the first part. */
const subtitleParts = computed(() => {
  const [before = "", after = ""] = highlight ? (subtitle ?? "").split(highlight) : [subtitle ?? ""];
  return { after, before, hasHighlight: Boolean(highlight && subtitle?.includes(highlight)) };
});

const keyboardFreeHeight = useKeyboardFreeHeight();
</script>

<template>
  <!-- The parts rise from below during the entry. The clip stops this motion from making the page scroll for a moment. -->
  <main
    class="relative isolate flex min-h-dvh flex-col overflow-hidden bg-base-bg-primary"
    :style="keyboardFreeHeight === undefined ? undefined : { minHeight: `${keyboardFreeHeight}px` }"
  >
    <!-- The brand pattern in the top right corner of the screen, under the content. It fades toward the logo and the title. -->
    <BrandPattern :pattern="SIGN_IN_PATTERN" class="absolute top-0 right-0 -z-10 h-1/3 w-1/2" />
    <!-- A wide screen has no thumb to help. The column then has the height of a phone, in the center of the screen. -->
    <div
      class="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 pt-safe-10 px-safe-5 pb-safe-6 sm:my-auto sm:min-h-176 sm:flex-none"
    >
      <!-- The side space is the padding and the border of a field, so the mark and the title line up with its text. -->
      <header v-if="!status" class="auth-reveal flex items-center px-3.25">
        <BrandTapMark class="text-util-color-brand-700" />
      </header>

      <section class="auth-reveal flex flex-1 flex-col gap-10">
        <!-- A status page changes this text without a new page, so a screen reader must read the change. -->
        <div class="flex flex-col gap-4 px-3.25" :aria-live="status ? 'polite' : undefined">
          <slot name="icon" />
          <div class="flex flex-col gap-2">
            <h1 class="text-display-sm font-semibold tracking-tight text-base-text-primary">{{ title }}</h1>
            <!-- No space around the highlight: the text of the subtitle already has its spaces. -->
            <p v-if="subtitle" class="text-base text-base-text-tertiary">
              {{ subtitleParts.before
              }}<span v-if="subtitleParts.hasHighlight" class="font-medium text-base-text-primary">{{ highlight }}</span
              >{{ subtitleParts.after }}
            </p>
          </div>
        </div>

        <component
          :is="onSubmit ? 'form' : 'div'"
          v-if="$slots.default || $slots.actions"
          class="flex flex-1 flex-col gap-6"
          @submit.prevent="onSubmit?.()"
        >
          <div v-if="$slots.default" class="flex flex-col gap-4">
            <slot />
          </div>
          <div v-if="$slots.actions" class="mt-auto flex flex-col gap-3">
            <slot name="actions" />
          </div>
        </component>
      </section>

      <!-- An invisible box around each link makes the tap area 44px high. The space around the footer holds the box. -->
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
 * The steps start one after the other, in the order of the three parts. At normal speed, one part takes 550ms and
 * the next part starts 90ms later. The values come from a token, so they are 0 under reduced motion.
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
