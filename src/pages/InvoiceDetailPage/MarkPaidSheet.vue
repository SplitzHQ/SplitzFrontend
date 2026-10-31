<script setup lang="ts">
import { PhArrowRight } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";

import type { SplitzUserReducedDto } from "@/backend";
import Avatar from "@/components/Avatar/Avatar.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";

/** The payment the user is about to record. */
export interface PendingPayment {
  fromUser: SplitzUserReducedDto;
  toUser: SplitzUserReducedDto;
  /** Formatted amount, for display only. */
  amountLabel: string;
}

defineProps<{
  modelValue: boolean;
  payment: PendingPayment | null;
  isSubmitting: boolean;
  /** Returns "You" for the current user, otherwise the user name. */
  displayName: (user: SplitzUserReducedDto) => string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();

const { $t } = useFluent();
</script>

<template>
  <Sheet :model-value="modelValue" detent="medium" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="payment" class="flex flex-col gap-6 p-6">
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
            <Avatar :images="[{ alt: payment.fromUser.userName, src: payment.fromUser.photo ?? null }]" size="sm" />
            <p class="w-full truncate text-center text-sm font-medium text-base-text-primary">
              {{ displayName(payment.fromUser) }}
            </p>
          </div>
          <PhArrowRight class="shrink-0 text-xl text-base-text-quaternary" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 flex-col items-center gap-1">
            <Avatar :images="[{ alt: payment.toUser.userName, src: payment.toUser.photo ?? null }]" size="sm" />
            <p class="w-full truncate text-center text-sm font-medium text-base-text-primary">
              {{ displayName(payment.toUser) }}
            </p>
          </div>
        </div>
        <p class="text-2xl font-bold text-base-text-primary tabular-nums">{{ payment.amountLabel }}</p>
      </div>

      <div class="flex flex-col gap-2">
        <SButton
          variant="primary"
          color="brand"
          size="xxl"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-test="mark-paid-confirm"
          @click="emit('confirm')"
        >
          {{ $t("invoice-detail-mark-paid") }}
        </SButton>
        <SButton
          variant="secondary"
          color="neutral"
          size="xxl"
          :disabled="isSubmitting"
          @click="emit('update:modelValue', false)"
        >
          {{ $t("invoice-detail-cancel") }}
        </SButton>
      </div>
    </div>
  </Sheet>
</template>
