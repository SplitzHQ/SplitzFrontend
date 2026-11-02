<script setup lang="ts">
/**
 * One variant of a prototype, in a phone-width frame. Put the variants side by side in a flex row so they can be compared.
 * `current` marks the variant that shows what the app does today, so it never reads like a new proposal.
 */
export interface VariantFrameProps {
  /** A short ID, for example "A". The choices and the notes refer to the variant by this ID. */
  id: string;
  title: string;
  /** What is different in this variant, one point each. */
  notes?: string[];
  /** True for the variant that shows the app as it is now. */
  current?: boolean;
}

const { id, title, notes = [], current = false } = defineProps<VariantFrameProps>();
</script>

<template>
  <section class="flex w-[390px] max-w-full min-w-0 flex-col gap-3" :aria-labelledby="`variant-${id}`">
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <span
          class="rounded-full border px-2 py-0.5 text-xs font-semibold"
          :class="
            current
              ? 'border-base-border-secondary bg-base-bg-secondary text-base-text-tertiary'
              : 'border-base-border-brand-solid bg-core-alpha-brand-10 text-base-text-brand'
          "
        >
          {{ id }} · {{ current ? "Current" : "New" }}
        </span>
        <h2 :id="`variant-${id}`" class="text-md font-semibold">{{ title }}</h2>
      </div>
      <ul v-if="notes.length > 0" class="flex list-disc flex-col gap-0.5 pl-5 text-sm text-base-text-tertiary">
        <li v-for="note in notes" :key="note">{{ note }}</li>
      </ul>
    </div>
    <div class="rounded-3xl border border-base-border-tertiary bg-base-bg-primary p-4 shadow-sm">
      <slot />
    </div>
  </section>
</template>
