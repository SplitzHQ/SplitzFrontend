<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import type { TransactionDto } from "@/backend";
import { categoryColorMap } from "@/components/Category/category-color";
import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import { getCategory, getMainCategory } from "@/libs/categories";
import { useUserStore } from "@/stores/user";

const props = defineProps<{
  transaction: TransactionDto;
}>();

const { $t } = useFluent();
const userStore = useUserStore();

const subcategory = computed(() => getCategory(props.transaction.icon));
const mainCategory = computed(() => getMainCategory(props.transaction.icon));
const colorClass = computed(() => categoryColorMap[mainCategory.value]);

const payer = computed(() => {
  // Find the payer: the person whose balance is negative (they paid more than their share)
  // Or more simply: the person who paid is indicated by the largest negative balance
  const balances = props.transaction.balances ?? [];
  // Actually, look at who paid: the one with the most negative balance is the net payer
  const sortedByBalance = [...balances].sort((a, b) => Number(a.balance) - Number(b.balance));
  return sortedByBalance[0]?.user ?? null;
});

const myBalance = computed(() => {
  const balances = props.transaction.balances ?? [];
  const myEntry = balances.find((b) => b.userId === userStore.user?.id);
  return myEntry ? Number(myEntry.balance) : 0;
});

const displayName = computed(() => {
  return props.transaction.name || formatCurrency(Number(props.transaction.amount), props.transaction.currency);
});

const payerDescription = computed(() => {
  if (!payer.value) return "";
  const amount = formatCurrency(Number(props.transaction.amount), props.transaction.currency);
  if (payer.value.id === userStore.user?.id) {
    return $t("group-detail-you-paid", { amount });
  }
  return $t("group-detail-paid-by", { amount, name: payer.value.userName });
});

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { currency, style: "currency" }).format(Math.abs(amount));
  } catch {
    return `${Math.abs(amount).toFixed(2)} ${currency}`;
  }
};
</script>

<template>
  <div class="flex items-center gap-3 rounded-2xl py-2">
    <div class="flex size-12 shrink-0 items-center justify-center rounded-05xl" :class="colorClass">
      <CategoryIcon :category="subcategory" class="icon-7" />
    </div>
    <div class="flex min-w-0 flex-1 flex-col">
      <p class="truncate text-lg font-medium text-base-text-primary">{{ displayName }}</p>
      <p class="truncate text-sm text-base-text-quaternary">{{ payerDescription }}</p>
    </div>
    <div v-if="myBalance !== 0" class="flex shrink-0 flex-col items-end gap-1">
      <p class="text-sm text-base-text-quaternary">
        {{ myBalance > 0 ? $t("group-detail-you-owe-label") : $t("group-detail-you-lent-label") }}
      </p>
      <p class="text-sm font-medium" :class="myBalance > 0 ? 'text-base-text-error' : 'text-util-color-success-600'">
        {{ formatCurrency(myBalance, transaction.currency) }}
      </p>
    </div>
  </div>
</template>
