<script setup lang="ts">
import { PhBooks, PhBug, PhDeviceMobile, PhFlask, PhListChecks, PhPalette, PhWrench } from "@phosphor-icons/vue";
import type { Component } from "vue";

import type { ToolIconKey } from "./tools";

/** The icon of a dev tool. `tools.ts` names it by key, so the catalog stays free of components. */
const { icon } = defineProps<{ icon: ToolIconKey }>();

const ICONS: Record<ToolIconKey, Component> = {
  app: PhDeviceMobile,
  backlog: PhListChecks,
  bug: PhBug,
  "design-system": PhPalette,
  devtools: PhWrench,
  prototypes: PhFlask,
  storybook: PhBooks,
};
</script>

<template>
  <component :is="ICONS[icon]" aria-hidden="true" />
</template>
