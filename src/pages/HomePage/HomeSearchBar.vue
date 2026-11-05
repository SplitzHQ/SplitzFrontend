<script setup lang="ts">
import { PhMagnifyingGlass, PhX } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, useId, useSlots, useTemplateRef } from "vue";

import SIconButton from "@/components/SButton/SIconButton.vue";

/**
 * Search field for the home page header.
 *
 * This is a pill-shaped input with a light fill and a magnifying glass on
 * the left. It differs from the shared TextInput component, so the home
 * page uses this component instead. The field has a muted border at rest,
 * because the fill alone is hard to see on the header. With the focus, it
 * shows the same brand border as an outlined TextInput. A clear button shows while the field has text. The `action`
 * slot holds one small icon button at the right end of the field.
 */
export interface HomeSearchBarProps {
  /** Text shown while the field is empty. Defaults to the localized "Search groups" string. */
  placeholder?: string;
}

const model = defineModel<string>({ default: "" });

const { placeholder } = defineProps<HomeSearchBarProps>();

const { $t } = useFluent();
const slots = useSlots();

const inputId = useId();
const input = useTemplateRef("input");

const hasText = computed(() => model.value.length > 0);

/**
 * Keeps the text clear of the buttons at the right end of the field.
 * One button takes 44px with its gap, and two buttons take 80px.
 */
const trailingPadding = computed(() => {
  if (slots.action && hasText.value) return "pr-20";
  return slots.action || hasText.value ? "pr-11" : undefined;
});

/** Removes the text and keeps the focus in the field, so the user can type a new word at once. */
function clear() {
  model.value = "";
  input.value?.focus();
}
</script>

<template>
  <div class="relative w-full">
    <!--
      The buttons are not in the label, because a click on them must not focus the field through the label.
      The padding is 1px smaller than 2.5 because of the border, so the field stays 40px high.
      The ring is inset and 0px wide at rest. A box shadow cannot blend an inset shadow with no shadow, and the global color
      transition does not cover a box shadow. So the field names `box-shadow`, and the ring fades with the border.
    -->
    <label
      :for="inputId"
      :class="[
        'flex w-full items-center gap-2 rounded-full border border-base-border-muted bg-base-bg-primary_alt p-[calc(--spacing(2.5)-1px)] text-base-fg-placeholder ring-0 ring-transparent transition-[color,background-color,border-color,box-shadow] ring-inset focus-within:border-base-border-brand-solid focus-within:ring-1 focus-within:ring-base-border-brand-solid',
        trailingPadding,
      ]"
    >
      <PhMagnifyingGlass class="size-5 shrink-0" aria-hidden="true" />
      <span class="sr-only">{{ placeholder ?? $t("home-search-placeholder") }}</span>
      <input
        :id="inputId"
        ref="input"
        v-model="model"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        :placeholder="placeholder ?? $t('home-search-placeholder')"
        class="min-w-0 flex-1 bg-transparent text-base leading-5 font-normal text-base-text-primary placeholder:text-base-text-placeholder focus-visible:outline-hidden [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
    <div class="absolute top-1 right-1 flex gap-1">
      <!-- The span takes the motion classes, because the button has its own transition. -->
      <Transition
        enter-active-class="transition-[opacity,scale] duration-(--motion-duration-state) ease-(--motion-easing-enter)"
        enter-from-class="scale-75 opacity-0"
        leave-active-class="transition-[opacity,scale] duration-(--motion-duration-exit) ease-(--motion-easing-exit)"
        leave-to-class="scale-75 opacity-0"
      >
        <span v-if="hasText" class="flex">
          <SIconButton
            variant="ghost"
            size="sm"
            :aria-label="$t('home-button-clear-search')"
            data-testid="home-search-clear"
            @click="clear"
          >
            <PhX />
          </SIconButton>
        </span>
      </Transition>
      <slot name="action" />
    </div>
  </div>
</template>
