<script setup lang="ts">
import { Big } from "big.js";
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import { formatCurrency } from "@/libs/format-currency";
import type { BalanceCardProps } from "@/pages/GroupDetailPage/BalanceCard.vue";

/**
 * Variant B: two totals ("You're owed" and "You owe") instead of one net number,
 * then one row per member with the amount on the right.
 * It takes the same props as the real BalanceCard, so it can replace it without data changes.
 */
const { currency, memberBalances } = defineProps<BalanceCardProps>();
const emit = defineEmits<{ settleUp: [] }>();

const { $t } = useFluent();

// A negative member amount means that member pays you.
const owedToYou = computed(() =>
  memberBalances.filter((m) => Number(m.amount) < 0).reduce((sum, m) => sum.plus(m.amount), new Big(0))
);
const youOwe = computed(() =>
  memberBalances.filter((m) => Number(m.amount) > 0).reduce((sum, m) => sum.plus(m.amount), new Big(0))
);
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-core-alpha-brand-5 p-4">
    <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col gap-0.5 rounded-xl bg-base-bg-primary px-3 py-2">
        <p class="text-xs text-base-text-quaternary">You're owed</p>
        <p class="text-display-xs font-medium text-util-color-success-600">
          {{ formatCurrency(owedToYou.toString(), currency) }}
        </p>
      </div>
      <div class="flex flex-col gap-0.5 rounded-xl bg-base-bg-primary px-3 py-2">
        <p class="text-xs text-base-text-quaternary">{{ $t("group-detail-you-owe-label") }}</p>
        <p class="text-display-xs font-medium text-base-text-error">
          {{ formatCurrency(youOwe.toString(), currency) }}
        </p>
      </div>
    </div>

    <ul v-if="memberBalances.length > 0" class="flex flex-col gap-2">
      <li v-for="m in memberBalances" :key="m.userId" class="flex items-center gap-2 text-sm font-medium">
        <span
          class="grid size-7 shrink-0 place-items-center rounded-full bg-core-alpha-brand-10 text-xs text-base-text-brand"
          aria-hidden="true"
        >
          {{ m.name.slice(0, 1) }}
        </span>
        <span class="flex-1 text-base-text-tertiary">
          {{
            Number(m.amount) < 0
              ? $t("group-detail-owes-you", { name: m.name })
              : $t("group-detail-you-owe", { name: m.name })
          }}
        </span>
        <span :class="Number(m.amount) < 0 ? 'text-util-color-success-600' : 'text-base-text-error'">
          {{ formatCurrency(m.amount, m.currency) }}
        </span>
      </li>
    </ul>
    <p v-else class="text-sm text-base-text-quaternary">Everyone is settled up.</p>

    <SButton
      variant="primary"
      color="brand"
      size="lg"
      :disabled="memberBalances.length === 0"
      @click="emit('settleUp')"
    >
      {{ $t("group-detail-settle-up") }}
    </SButton>
  </div>
</template>
