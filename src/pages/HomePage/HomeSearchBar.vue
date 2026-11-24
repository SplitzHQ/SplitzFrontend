<script setup lang="ts">
import { PhMagnifyingGlass, PhX } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, useId, useSlots, useTemplateRef } from "vue";

import SIconButton from "@/components/SButton/SIconButton.vue";

/**
 * Pill-shaped group search input for the `HomePage` header.
 *
 * Uses a custom pill frame rather than `TextInput`: rests with `border-base-border-muted` so the input stays distinct
 * against the frosted header, transitions to the brand focus ring on `:focus-within`, reveals a clear button while
 * non-empty, and accepts a trailing `#action` icon button slot.
 */
export interface HomeSearchBarProps {
  /** Placeholder copy shown while empty. Defaults to localized `"home-search-placeholder"`. */
  placeholder?: string;
}

const model = defineModel<string>({ default: "" });

const { placeholder } = defineProps<HomeSearchBarProps>();

const { $t } = useFluent();
const slots = useSlots();

const inputId = useId();
const inputElement = useTemplateRef("inputElement");

const hasText = computed(() => model.value.length > 0);

/** Reserves right padding so typed text never runs underneath the clear or `#action` icon buttons. */
const trailingPaddingClass = computed(() => {
  if (slots.action && hasText.value) return "pr-20";
  return slots.action || hasText.value ? "pr-11" : undefined;
});

/** Clears the query and keeps focus inside `<input>` so the user can type a replacement immediately. */
function clearSearch(): void {
  model.value = "";
  inputElement.value?.focus();
}
</script>

<template>
  <div class="relative w-full">
    <!--
      Keep trailing buttons outside `<label>` so tapping them does not forward focus to `<input>`.
      Subtract `1px` from `p-2.5` to offset the border width, and include `box-shadow` in `transition` with a resting
      `ring-0 ring-inset` so the focus ring fades in alongside `border-color`.
    -->
    <label
      :for="inputId"
      :class="[
        'flex w-full items-center gap-2 rounded-full border border-base-border-muted bg-base-bg-primary_alt p-[calc(--spacing(2.5)-1px)] text-base-fg-placeholder ring-0 ring-transparent transition-[color,background-color,border-color,box-shadow] ring-inset focus-within:border-base-border-brand-solid focus-within:ring-1 focus-within:ring-base-border-brand-solid',
        trailingPaddingClass,
      ]"
    >
      <PhMagnifyingGlass class="size-5 shrink-0" aria-hidden="true" />
      <span class="sr-only">{{ placeholder ?? $t("home-search-placeholder") }}</span>
      <input
        :id="inputId"
        ref="inputElement"
        v-model="model"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        :placeholder="placeholder ?? $t('home-search-placeholder')"
        class="min-w-0 flex-1 appearance-none bg-transparent text-base leading-5 font-normal text-base-text-primary placeholder:text-base-text-placeholder focus-visible:outline-hidden [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
    <!--
      Center trailing buttons vertically across the full pill (`inset-y-0`) rather than pinning to `top`, preventing
      misalignment if iOS Safari renders `<input type="search">` taller than 20px (`appearance-none` strips native chrome).
    -->
    <div class="absolute inset-y-0 right-1 flex items-center gap-1">
      <!-- Wrap `SIconButton` in a `<span>` so enter/leave scale transitions do not conflict with the button's own CSS transition. -->
      <Transition
        enter-active-class="transition-[opacity,scale] duration-state ease-enter"
        enter-from-class="scale-75 opacity-0"
        leave-active-class="transition-[opacity,scale] duration-exit ease-exit"
        leave-to-class="scale-75 opacity-0"
      >
        <span v-if="hasText" class="flex">
          <SIconButton
            variant="ghost"
            size="sm"
            :aria-label="$t('home-button-clear-search')"
            data-testid="home-search-clear"
            @click="clearSearch"
          >
            <PhX />
          </SIconButton>
        </span>
      </Transition>
      <slot name="action" />
    </div>
  </div>
</template>
