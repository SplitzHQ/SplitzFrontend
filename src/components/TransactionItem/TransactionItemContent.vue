<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import type { TransactionDto } from "@/backend";
import { categoryColorMap } from "@/components/Category/category-color";
import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import AmountChip from "@/components/ListRow/AmountChip.vue";
import { LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import ListRowContent from "@/components/ListRow/ListRowContent.vue";
import { getCategory, getMainCategory } from "@/libs/categories";
import { formatCurrency } from "@/libs/format-currency";
import { useUserStore } from "@/stores/user";

import { balanceOf, findTransactionPayer } from "./transaction-row";

/**
 * The parts of a transaction row: the category tile, the name, the payer and the balance of the current user.
 * The root is a fragment, so the parent must be a flex row. Use `TransactionItem` or a button with
 * `LIST_ROW_CLASS`. See `transaction-item.usage.ts`.
 *
 * The default slot goes at the end of the row, for example a check mark.
 */
export interface TransactionItemContentProps {
  transaction: TransactionDto;
}

const props = defineProps<TransactionItemContentProps>();

const { $t } = useFluent();
const userStore = useUserStore();

const subcategory = computed(() => getCategory(props.transaction.icon));
const mainCategory = computed(() => getMainCategory(props.transaction.icon));
const colorClass = computed(() => categoryColorMap[mainCategory.value]);

const payer = computed(() => findTransactionPayer(props.transaction.balances));

const myBalance = computed(() => {
  const balances = props.transaction.balances ?? [];
  const myEntry = balances.find((b) => b.userId === userStore.user?.id);
  return myEntry ? balanceOf(myEntry) : 0;
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
</script>

<template>
  <ListRowContent :title="displayName" :subtitle="payerDescription">
    <template #leading>
      <div class="flex size-12 shrink-0 items-center justify-center rounded-xl" :class="colorClass">
        <CategoryIcon :category="subcategory" class="icon-7" />
      </div>
    </template>
    <template #trailing>
      <div v-if="myBalance !== 0" class="flex shrink-0 flex-col items-end gap-0.5">
        <p :class="LIST_ROW_TEXT.direction">
          {{ myBalance < 0 ? $t("group-detail-you-owe-label") : $t("group-detail-you-lent-label") }}
        </p>
        <p class="flex">
          <AmountChip :tone="myBalance < 0 ? 'owes' : 'owed'" :amount="myBalance" :currency="transaction.currency" />
        </p>
      </div>
      <slot />
    </template>
  </ListRowContent>
</template>
