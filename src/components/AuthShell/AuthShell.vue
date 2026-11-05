<script setup lang="ts">
import BrandWordmark from "@/components/BrandWordmark/BrandWordmark.vue";

/**
 * The page frame of a sign-in or account page. See `auth-shell.usage.ts`.
 * Slots: `hero` goes above the title, the default slot goes under the title, and `footer` holds links under the card.
 */
export interface AuthShellProps {
  /** Rendered as the page's only h1. */
  title: string;
  /** One sentence under the title. */
  subtitle?: string;
  /** Centers the brand and heading; used for status pages such as email confirmation. */
  centered?: boolean;
}

const { title, subtitle, centered } = defineProps<AuthShellProps>();
</script>

<template>
  <main class="relative flex min-h-dvh flex-col overflow-hidden bg-base-bg-primary">
    <!-- Decorative backdrop: a soft brand glow plus the concentric rings used across the app. -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 left-1/2 h-120 w-176 -translate-x-1/2 rounded-full bg-radial from-core-alpha-brand-20 from-0% via-core-alpha-brand-5 via-45% to-transparent to-70%"
      />
      <div class="absolute -top-24 -right-24 size-80 rounded-full border border-core-alpha-brand-10" />
      <div class="absolute -top-40 -right-40 size-112 rounded-full border border-core-alpha-brand-5" />
      <div class="absolute -bottom-36 -left-28 size-80 rounded-full border border-core-alpha-brand-10" />
      <div class="absolute -bottom-52 -left-44 size-112 rounded-full border border-core-alpha-brand-5" />
    </div>

    <div
      class="relative mx-auto flex w-full max-w-md flex-1 flex-col gap-8 pt-safe-12 px-safe-5 pb-safe-10 sm:justify-center sm:pb-safe-12"
    >
      <header :class="['auth-reveal flex items-center', centered ? 'justify-center' : '']">
        <BrandWordmark size="auth" />
      </header>

      <section
        class="auth-reveal flex flex-col gap-6 sm:rounded-3xl sm:border sm:border-util-alpha-black-5 sm:bg-util-alpha-white-60 sm:p-8 sm:shadow-xl sm:shadow-core-alpha-brand-10 sm:backdrop-blur-md"
      >
        <slot name="hero" />

        <!-- A status page changes this text without a new page, so a screen reader must read the change. -->
        <div
          :class="['flex flex-col gap-2', centered ? 'items-center text-center' : '']"
          :aria-live="centered ? 'polite' : undefined"
        >
          <h1 class="text-display-sm font-semibold tracking-tight text-base-text-primary">{{ title }}</h1>
          <p v-if="subtitle" class="text-base text-base-text-tertiary">{{ subtitle }}</p>
        </div>

        <slot />
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
