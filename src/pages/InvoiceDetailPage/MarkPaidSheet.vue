<script setup lang="ts">
import { PhArrowRight } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

import { type SplitzUserReducedDto, type InvoiceDebtDto, InvoiceApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { formatCurrency } from "@/libs/format-currency";
import { useUserStore } from "@/stores/user";

const { modelValue, pendingDebt } = defineProps<{
  modelValue: boolean;
  pendingDebt: InvoiceDebtDto | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const isSubmitting = ref(false);

const { $t } = useFluent();
const route = useRoute();
const queryCache = useQueryCache();
const userStore = useUserStore();

const groupId = computed(() => route.params.groupId as string);
const invoiceId = computed(() => route.params.invoiceId as string);

const invoiceApi = new InvoiceApi(config);

const myId = computed(() => userStore.user?.id);
const displayName = (user: SplitzUserReducedDto) =>
  user.id === myId.value ? $t("new-expense-pronoun-you") : user.userName;

const { state: invoiceQuery } = useQuery({
  key: () => ["getInvoice", invoiceId.value],
  query: () => invoiceApi.getInvoice({ id: invoiceId.value }),
});

const invoice = computed(() => invoiceQuery.value.data);

/** Refetch the invoice and the group list so the status pill there stays in sync. */
async function refreshInvoice() {
  await Promise.all([
    queryCache.invalidateQueries({ key: ["getInvoice", invoiceId.value] }),
    queryCache.invalidateQueries({ key: ["getGroupInvoices", groupId.value] }),
  ]);
}

/** Record a payment with the exact remaining amount. */
async function markDebtPaid() {
  if (isSubmitting.value || !pendingDebt) return;
  const debt = pendingDebt;
  try {
    isSubmitting.value = true;
    // Pay the exact remaining amount, so the backend sees this debt as fully covered.
    await invoiceApi.addSettlement({
      id: invoiceId.value,
      invoiceSettlementInputDto: {
        amount: debt.remaining,
        fromUserId: debt.fromUser.id,
        toUserId: debt.toUser.id,
      },
    });
    await refreshInvoice();
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Error marking debt as paid:", error);
    toast.error($t("invoice-detail-mark-paid-error"));
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Sheet :model-value="modelValue" detent="medium" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="pendingDebt" class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-2">
        <p class="text-lg font-semibold text-base-text-primary">
          {{ $t("invoice-detail-mark-paid-confirm-title") }}
        </p>
        <p class="text-sm text-base-text-secondary">
          {{ $t("invoice-detail-mark-paid-confirm-message") }}
        </p>
      </div>

      <!-- Who pays whom -->
      <div class="flex flex-col items-center gap-3 rounded-2xl bg-base-bg-secondary p-4">
        <div class="flex w-full items-center justify-center gap-3">
          <div class="flex min-w-0 flex-1 flex-col items-center gap-1">
            <Avatar
              :images="[{ alt: pendingDebt.fromUser.userName, src: pendingDebt.fromUser.photo ?? null }]"
              size="sm"
            />
            <p class="w-full truncate text-center text-sm font-medium text-base-text-primary">
              {{ displayName(pendingDebt.fromUser) }}
            </p>
          </div>
          <PhArrowRight class="shrink-0 text-xl text-base-text-quaternary" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 flex-col items-center gap-1">
            <Avatar :images="[{ alt: pendingDebt.toUser.userName, src: pendingDebt.toUser.photo ?? null }]" size="sm" />
            <p class="w-full truncate text-center text-sm font-medium text-base-text-primary">
              {{ displayName(pendingDebt.toUser) }}
            </p>
          </div>
        </div>
        <p class="text-2xl font-bold text-base-text-primary tabular-nums">
          {{ formatCurrency(pendingDebt.remaining, invoice?.currency ?? "USD") }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <SButton
          variant="primary"
          size="xl"
          :loading="isSubmitting"
          data-test="mark-paid-confirm"
          @click="markDebtPaid"
        >
          {{ $t("invoice-detail-mark-paid") }}
        </SButton>
        <SButton variant="secondary" size="xl" :disabled="isSubmitting" @click="emit('update:modelValue', false)">
          {{ $t("invoice-detail-cancel") }}
        </SButton>
      </div>
    </div>
  </Sheet>
</template>
