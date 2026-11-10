<script setup lang="ts">
import { PhFiles } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useTransactionStore } from "@/stores/transaction";
import { useUserStore } from "@/stores/user";

const { $t } = useFluent();
const transactionStore = useTransactionStore();
const { transaction } = storeToRefs(transactionStore);

const userStore = useUserStore();

const amountOwed = computed(() => {
  if (transactionStore.paidBy && userStore.user?.id && transaction.value.amount) {
    let owed = transactionStore.finalSplitAmount[userStore.user.id] ?? 0;
    if (transactionStore.paidBy === userStore.user.id) {
      owed = owed - transaction.value.amount;
    }
    return owed;
  }
  return 0;
});
</script>

<template>
  <div
    class="flex flex-col justify-center gap-3 rounded-2xl bg-base-bg-brand-subtle p-3 outline-1 -outline-offset-1 outline-base-border-default outline-solid"
  >
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center rounded-xl bg-base-bg-active p-2.5">
        <PhFiles class="text-[28px] text-base-text-brand" />
      </div>
      <div class="flex flex-1 flex-col justify-center">
        <div class="text-lg font-medium text-base-text-primary">
          {{
            transaction.amount?.toLocaleString(undefined, {
              style: "currency",
              currency: transaction.currency ?? "USD",
            })
          }}
        </div>
        <div class="flex items-end gap-1">
          <div class="text-sm font-normal text-base-text-muted">
            {{
              $t("new-expense-split-paid-by", {
                username:
                  transactionStore.members.find((member) => member.id === transactionStore.paidBy)?.userName ?? "",
              })
            }}
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end justify-center gap-1">
        <div class="text-sm font-normal text-base-text-muted">
          {{ amountOwed > 0 ? $t("new-expense-review-you-owe") : $t("new-expense-review-you-are-owed") }}
        </div>
        <div class="flex items-end gap-1">
          <div v-if="amountOwed > 0" class="text-sm font-medium text-base-text-owe">
            {{
              amountOwed.toLocaleString(undefined, {
                style: "currency",
                currency: transactionStore.transaction.currency ?? "USD",
              })
            }}
          </div>
          <div v-else class="text-sm font-medium text-base-text-success">
            {{
              (0 - amountOwed).toLocaleString(undefined, {
                style: "currency",
                currency: transactionStore.transaction.currency ?? "USD",
              })
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
