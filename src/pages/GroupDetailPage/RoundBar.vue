<script setup lang="ts">
import { PhCaretRight, PhHandCoins } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed } from "vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

import { nextAction, roundProgress, type RoundTransfer } from "@/pages/SettleUpPage/settle-up-round";

/**
 * The running settle-up at the top of the group page, in one line: the progress and what the current user must do
 * next. A tap opens the round. The prototype `2026-11-09-settle-up-flow` (SPZ-105) picked this as A3 in flow F, where
 * the list also has a row for the round. SPZ-115 decides a stronger hint for an action of the user.
 */
const { to, transfers, userId } = defineProps<{
  /** The transfers of all currencies of the running round. */
  transfers: RoundTransfer[];
  userId: string | undefined;
  /** The page of the round. */
  to: RouteLocationRaw;
}>();

const { $t } = useFluent();

const progress = computed(() => roundProgress(transfers));

const next = computed(() => {
  const action = nextAction(transfers, userId);
  if (!action) return $t("settle-up-next-none");
  return action.kind === "confirm"
    ? $t("settle-up-next-confirm", { name: action.transfer.from.userName })
    : $t("settle-up-next-pay", { name: action.transfer.to.userName });
});
</script>

<template>
  <RouterLink
    :to="to"
    class="flex min-h-11 items-center gap-3 rounded-2xl bg-base-bg-brand-subtle px-4 py-3 transition-[scale] duration-state ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid active:scale-98 motion-reduce:active:scale-100"
    data-test="round-bar"
  >
    <PhHandCoins class="shrink-0 icon-6 text-base-text-brand" aria-hidden="true" />
    <span class="flex min-w-0 flex-1 flex-col">
      <span class="truncate text-sm font-semibold text-base-text-primary">
        {{ $t("settle-up-round-in-progress") }} · {{ $t("settle-up-round-progress", progress) }}
      </span>
      <span class="truncate text-sm text-base-text-secondary">{{ next }}</span>
    </span>
    <PhCaretRight class="shrink-0 icon-4 text-base-text-quaternary" aria-hidden="true" />
  </RouterLink>
</template>
