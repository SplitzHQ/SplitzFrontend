<script setup lang="ts">
import BrandMark from "./BrandMark.vue";

export interface AuthShellProps {
  /** Rendered as the page's only h1. */
  title: string;
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
        class="absolute -top-40 left-1/2 h-[30rem] w-[44rem] -translate-x-1/2 rounded-full bg-radial from-core-alpha-brand-20 from-0% via-core-alpha-brand-5 via-45% to-transparent to-70%"
      />
      <div class="absolute -top-24 -right-24 size-80 rounded-full border border-core-alpha-brand-10" />
      <div class="absolute -top-40 -right-40 size-[28rem] rounded-full border border-core-alpha-brand-5" />
      <div class="absolute -bottom-36 -left-28 size-80 rounded-full border border-core-alpha-brand-10" />
      <div class="absolute -bottom-52 -left-44 size-[28rem] rounded-full border border-core-alpha-brand-5" />
    </div>

    <div class="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-12 pb-10 sm:justify-center sm:py-12">
      <header :class="['auth-reveal flex items-center gap-2.5', centered ? 'justify-center' : '']">
        <BrandMark class="size-9 shrink-0" />
        <span class="text-lg font-bold tracking-tight text-util-color-brand-700">Splitz</span>
      </header>

      <section
        class="auth-reveal mt-8 flex flex-col gap-6 sm:rounded-3xl sm:border sm:border-util-alpha-black-5 sm:bg-util-alpha-white-60 sm:p-8 sm:shadow-xl sm:shadow-core-alpha-brand-10 sm:backdrop-blur-md"
      >
        <slot name="hero" />

        <div :class="['flex flex-col gap-2', centered ? 'items-center text-center' : '']">
          <h1 class="text-display-sm font-semibold tracking-tight text-base-text-primary">{{ title }}</h1>
          <p v-if="subtitle" class="text-base text-base-text-tertiary">{{ subtitle }}</p>
        </div>

        <slot />
      </section>

      <footer
        v-if="$slots.footer"
        class="auth-reveal mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium"
      >
        <slot name="footer" />
      </footer>
    </div>
  </main>
</template>

<style scoped>
.auth-reveal {
  animation: auth-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.auth-reveal:nth-child(2) {
  animation-delay: 90ms;
}

.auth-reveal:nth-child(3) {
  animation-delay: 180ms;
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

@media (prefers-reduced-motion: reduce) {
  .auth-reveal {
    animation: none;
  }
}
</style>
