<script setup lang="ts">
import { PhCheckCircle, PhCircle } from "@phosphor-icons/vue";

import { LIST_ROW_CLASS } from "@/components/ListRow/list-row";

/** The props of SelectableRow. */
export interface SelectableRowProps {
  /** True when the row is in the selection. */
  selected: boolean;
  /** True when the row cannot be selected, for example a friend with an open invite. */
  disabled?: boolean;
}

/**
 * A row in a list where the user selects more than one item. A tap on the row toggles it. The default slot holds the
 * content of the row, and the check mark goes after it. See `selectable-row.usage.ts`.
 */
const { selected, disabled = false } = defineProps<SelectableRowProps>();

const emit = defineEmits<{ toggle: [] }>();

/*
 * The classes of the selected state. `aria-pressed` comes after `hover` and `active` in the variant order of Tailwind,
 * so the brand fill replaces the gray fill of the shared row.
 * The content of the row uses `base-text-primary` for its main text. The row sets this variable to `base-text-brand`,
 * so the main text of each kind of content changes color without a prop. The other text keeps its own color.
 */
const SELECTED_CLASS = [
  "aria-pressed:bg-base-bg-brand-subtle aria-pressed:hover:bg-base-bg-brand_hover",
  "aria-pressed:active:bg-base-bg-brand_pressed",
  "aria-pressed:[--base-text-primary:var(--base-text-brand)]",
].join(" ");
</script>

<template>
  <!-- The ring stays inside the row, because the row can touch the edge of a scroll area, which cuts an outer ring. -->
  <button
    type="button"
    :class="[
      LIST_ROW_CLASS,
      SELECTED_CLASS,
      'text-left focus-visible:-outline-offset-2 disabled:pointer-events-none disabled:opacity-60',
    ]"
    :aria-pressed="selected"
    :disabled="disabled"
    @click="emit('toggle')"
  >
    <slot />
    <span aria-hidden="true" class="relative size-6 shrink-0">
      <!-- The two marks are on top of each other, so one fades out while the other fades in. -->
      <Transition
        enter-active-class="transition-opacity duration-hover-in ease-standard"
        leave-active-class="transition-opacity duration-hover-in ease-standard"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <PhCheckCircle v-if="selected" weight="fill" class="absolute inset-0 size-6 text-base-fg-brand" />
        <PhCircle v-else class="absolute inset-0 size-6 text-base-text-quaternary" />
      </Transition>
    </span>
  </button>
</template>
