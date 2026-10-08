<script setup lang="ts">
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { useId } from "vue";

/**
 * Search field for the home page header.
 *
 * This is a pill-shaped input with a tinted background and a magnifying
 * glass on the left. It follows the Figma "Search bar" design, which
 * differs from the shared TextInput component, so the home page uses
 * this component instead.
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
  <label
    :for="inputId"
    class="flex w-full items-center gap-2 rounded-full bg-util-alpha-black-5 p-2.5 text-base-fg-placeholder focus-within:bg-util-alpha-black-10"
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
      class="min-w-0 flex-1 bg-transparent text-sm leading-5 font-normal text-base-text-primary placeholder:text-base-text-placeholder focus-visible:outline-hidden [&::-webkit-search-cancel-button]:hidden"
    />
  </label>
</template>
