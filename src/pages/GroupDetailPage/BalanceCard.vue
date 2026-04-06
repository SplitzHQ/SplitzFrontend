<script setup lang="ts">
import { useFluent } from "fluent-vue";

import SButton from "@/components/SButton/SButton.vue";
import { formatCurrency } from "@/libs/format-currency";

export interface BalanceCardProps {
  totalBalance: number;
  currency: string;
  memberBalances: { name: string; amount: number; currency: string }[];
}

const { totalBalance, currency, memberBalances } = defineProps<BalanceCardProps>();
const emit = defineEmits<{ settleUp: [] }>();

const { $t } = useFluent();
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-core-alpha-brand-5 px-4 py-3">
    <div class="flex items-center gap-3">
      <div class="flex flex-1 flex-col">
        <p class="text-sm text-base-text-quaternary">{{ $t("group-detail-total-balance") }}</p>
        <p
          class="text-display-lg font-medium"
          :class="totalBalance >= 0 ? 'text-util-color-success-600' : 'text-base-text-error'"
        >
          {{ formatCurrency(totalBalance, currency, false) }}
        </p>
      </div>
      <SButton variant="primary" color="brand" size="xl" @click="emit('settleUp')">
        {{ $t("group-detail-settle-up") }}
      </SButton>
    </div>
    <div v-if="memberBalances.length > 0" class="flex flex-col gap-1 text-sm font-medium">
      <div v-for="member in memberBalances" :key="member.name" class="flex items-end gap-1">
        <span v-if="member.amount < 0" class="text-base-text-quinary">
          {{ $t("group-detail-owes-you", { name: member.name }) }}
        </span>
        <span v-else class="text-base-text-quinary">
          {{ $t("group-detail-you-owe", { name: member.name }) }}
        </span>
        <span :class="member.amount < 0 ? 'text-util-color-success-600' : 'text-base-text-error'">
          {{ formatCurrency(member.amount, member.currency) }}
        </span>
      </div>
    </div>
  </div>
</template>
