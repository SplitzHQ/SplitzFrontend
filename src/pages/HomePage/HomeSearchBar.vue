<script setup lang="ts">
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { useId } from "vue";

/**
 * Search field for the home page header.
 *
 * This is a pill-shaped input with a light fill and a magnifying glass on
 * the left. It differs from the shared TextInput component, so the home
 * page uses this component instead. The field has a muted border at rest,
 * because the fill alone is hard to see on the header. With the focus, it
 * shows the same brand border as an outlined TextInput. The `action` slot
 * holds one small icon button at the right end of the field.
 */
export interface HomeSearchBarProps {
  /** Text shown while the field is empty. Defaults to the localized "Search" string. */
  placeholder?: string;
}

const model = defineModel<string>({ default: "" });

const { placeholder } = defineProps<HomeSearchBarProps>();

const { $t } = useFluent();

const inputId = useId();
</script>

<template>
  <div class="relative w-full">
    <!--
      The button is not in the label, because a click on it must not focus the field.
      The padding is smaller than `p-2.5` by the width of the border, so the field has the same height as a field with
      no border.
      The ring is inset and `ring-0` at rest. A box shadow cannot blend an inset shadow with no shadow, and the global color
      transition does not cover a box shadow. So the field names `box-shadow`, and the ring fades with the border.
    -->
    <label
      :for="inputId"
      :class="[
        'flex w-full items-center gap-2 rounded-full border border-base-border-muted bg-base-bg-primary_alt p-[calc(--spacing(2.5)-1px)] text-base-fg-placeholder ring-0 ring-transparent transition-[color,background-color,border-color,box-shadow] ring-inset focus-within:border-base-border-brand-solid focus-within:ring-1 focus-within:ring-base-border-brand-solid',
        $slots.action && 'pr-11',
      ]"
    >
      <PhMagnifyingGlass class="size-5 shrink-0" aria-hidden="true" />
      <span class="sr-only">{{ placeholder ?? $t("home-search-placeholder") }}</span>
      <input
        :id="inputId"
        v-model="model"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        :placeholder="placeholder ?? $t('home-search-placeholder')"
        class="min-w-0 flex-1 bg-transparent text-base leading-5 font-normal text-base-text-primary placeholder:text-base-text-placeholder focus-visible:outline-hidden [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
    <div v-if="$slots.action" class="absolute top-1 right-1 flex">
      <slot name="action" />
    </div>
  </div>
</template>
