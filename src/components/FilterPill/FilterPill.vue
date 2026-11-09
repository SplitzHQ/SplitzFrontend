<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";

import { FILTER_PILL_STATE_CLASS } from "./filter-pill";

/**
 * A round choice button for a filter or a sort. See `filter-pill.usage.ts`.
 * The `sm` pill sits in a row on a page and opens a sheet for one kind of condition. The `md` pill is one choice in that
 * sheet. An unselected pill has a thin line and no fill, and a selected pill has the brand fill of a secondary button.
 * Both states keep a border, so the size does not change when the pill turns on.
 */
export interface FilterPillProps {
  /** On a page: the pill shows a value that is not the default. In a sheet: the pill is the current choice. */
  selected?: boolean;
  /** Ends the pill with a down caret. Use it when a tap opens a sheet. */
  caret?: boolean;
  /** `sm` for a row of pills on a page, `md` for the choices in a sheet. */
  size?: "sm" | "md";
}

const { selected = false, caret = false, size = "sm" } = defineProps<FilterPillProps>();
</script>

<template>
  <!--
    The `after` area makes the tap target 44px high at each size. The press scale and the color change use the motion
    tokens, so reduced motion turns them off.
  -->
  <button
    type="button"
    :class="[
      'relative flex shrink-0 touch-manipulation items-center gap-1 rounded-full border text-sm font-medium whitespace-nowrap select-none',
      'transition-[color,background-color,border-color,scale] duration-state ease-standard active:scale-97',
      'after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid',
      '[&_svg]:shrink-0 [&_svg]:icon-4',
      size === 'md' ? 'h-10 px-4' : ['h-8', caret ? 'pr-2.5 pl-3' : 'px-3'],
      FILTER_PILL_STATE_CLASS[selected ? 'selected' : 'idle'],
    ]"
  >
    <slot />
    <PhCaretDown v-if="caret" aria-hidden="true" />
  </button>
</template>
