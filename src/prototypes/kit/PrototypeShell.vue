<script setup lang="ts">
import { PhMoon, PhSun } from "@phosphor-icons/vue";
import { shallowRef } from "vue";

import SButton from "@/components/SButton/SButton.vue";

/**
 * The page frame of a prototype: a back link to the index, the title, a description, and a light/dark switch.
 * Put the variants in the default slot and extra page actions in the `actions` slot.
 */
const { title = document.title } = defineProps<{ title?: string }>();

const THEME_KEY = "splitz:prototype-theme";

function readDark(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

const dark = shallowRef(readDark());
document.documentElement.classList.toggle("dark", dark.value);

/** Switches the `.dark` class on `<html>` and remembers the choice for all prototype pages. */
function toggleTheme() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle("dark", dark.value);
  try {
    localStorage.setItem(THEME_KEY, dark.value ? "dark" : "light");
  } catch {}
}
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 pt-14 pb-24 text-base-text-primary">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex max-w-prose flex-col gap-1">
        <a href="../" class="text-sm text-base-text-quaternary hover:text-base-text-brand">← All prototypes</a>
        <h1 class="text-display-xs font-semibold">{{ title }}</h1>
        <div class="text-sm text-base-text-tertiary"><slot name="description" /></div>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
        <SButton color="neutral" variant="ghost" size="sm" @click="toggleTheme">
          <template #icon-left>
            <PhSun v-if="dark" />
            <PhMoon v-else />
          </template>
          {{ dark ? "Light" : "Dark" }}
        </SButton>
      </div>
    </header>
    <slot />
  </div>
</template>
