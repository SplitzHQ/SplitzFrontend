<script setup lang="ts">
import { PhCheckCircle, PhHandCoins } from "@phosphor-icons/vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

import { LIST_ROW_CLASS } from "@/components/ListRow/list-row";
import ListRowContent from "@/components/ListRow/ListRowContent.vue";

/**
 * A settle-up round as one row of the expense list, on the day that it started. The expenses that it covers do not
 * show in the list; the row opens the round, which lists them. The prototype `2026-11-09-settle-up-flow` (SPZ-105)
 * picked this in flow F.
 */
defineProps<{
  title: string;
  /** What the round needs next, or the summary of a finished round. */
  subtitle: string;
  /** True when every transfer of the round is confirmed. */
  done: boolean;
  to: RouteLocationRaw;
}>();
</script>

<template>
  <RouterLink :to="to" :class="[LIST_ROW_CLASS, 'focus-visible:outline-offset-2']" data-test="round-row">
    <ListRowContent :title="title" :subtitle="subtitle">
      <template #leading>
        <div
          :class="[
            'flex size-12 shrink-0 items-center justify-center rounded-xl',
            done ? 'bg-base-bg-success-subtle' : 'bg-base-bg-brand-subtle',
          ]"
        >
          <PhCheckCircle v-if="done" class="icon-7 text-base-text-success" aria-hidden="true" />
          <PhHandCoins v-else class="icon-7 text-base-text-brand" aria-hidden="true" />
        </div>
      </template>
    </ListRowContent>
  </RouterLink>
</template>
