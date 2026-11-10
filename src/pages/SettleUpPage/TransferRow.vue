<script setup lang="ts">
import { PhCheckCircle, PhClock } from "@phosphor-icons/vue";
import { computed } from "vue";

import type { SplitzUserReducedDto } from "@/backend";
import Avatar from "@/components/Avatar/Avatar.vue";
import AmountChip from "@/components/ListRow/AmountChip.vue";
import { LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import SButton from "@/components/SButton/SButton.vue";
import { formatCurrency } from "@/libs/format-currency";

import type { TransferState } from "./settle-up-round";

/**
 * One transfer of a settle-up: who pays whom, the amount, and in a running round the state and the button of the
 * current user. The first line is the sentence and the amount. The second line is the state and the button, so a long
 * state does not push the amount out of the row. The prototype `2026-11-09-settle-up-flow` (SPZ-105) decided the row.
 */
const {
  amount,
  currency,
  from,
  loading = false,
  state = null,
  to,
  userId,
} = defineProps<{
  from: SplitzUserReducedDto;
  to: SplitzUserReducedDto;
  amount: string;
  currency: string;
  /** The ID of the current user. */
  userId: string | undefined;
  /** The state in a running round. Null in the start sheet, where the row shows no state and no button. */
  state?: TransferState | null;
  /** True while the action of this row saves. */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** The current user tapped Mark paid. */
  markPaid: [];
  /** The current user tapped Confirm. */
  confirm: [];
}>();

const fromMe = computed(() => from.id === userId);
const toMe = computed(() => to.id === userId);

/** The message of the sentence. The names go in slots, so they get the darker color. */
const sentencePath = computed(() => {
  if (fromMe.value) return "settle-up-transfer-you-pay";
  if (toMe.value) return "settle-up-transfer-pays-you";
  return "settle-up-transfer-between";
});

/** The payer marks an open transfer, and the receiver confirms a transfer that the payer marked. */
const action = computed(() => {
  if (fromMe.value && state === "open") return "markPaid";
  if (toMe.value && state === "sent") return "confirm";
  return null;
});
</script>

<template>
  <!-- The avatar is centered on the text block, so it lines up with a row of one line and with a row of two lines. -->
  <li class="flex items-center gap-3 py-2" data-test="transfer-row">
    <Avatar aria-hidden="true" class="shrink-0" :images="[{ alt: from.userName, src: from.photo ?? null }]" size="xs" />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="flex items-center gap-2">
        <!-- `whitespace-pre` keeps the space at the edge of each text part. Only a name can shrink. -->
        <i18n :path="sentencePath" :class="['flex min-w-0 flex-1 whitespace-pre', LIST_ROW_TEXT.direction]">
          <template #name>
            <span class="min-w-0 truncate text-base-text-primary">{{ fromMe ? to.userName : from.userName }}</span>
          </template>
          <template #from>
            <span class="min-w-0 truncate text-base-text-primary">{{ from.userName }}</span>
          </template>
          <template #to>
            <span class="min-w-0 truncate text-base-text-primary">{{ to.userName }}</span>
          </template>
        </i18n>
        <AmountChip
          v-if="fromMe || toMe"
          class="shrink-0"
          :tone="fromMe ? 'owes' : 'owed'"
          :amount="amount"
          :currency="currency"
        />
        <span v-else class="shrink-0 text-sm font-medium text-base-text-secondary">
          {{ formatCurrency(amount, currency) }}
        </span>
      </div>
      <div v-if="state" class="flex min-h-8 items-center gap-2">
        <p
          :class="[
            'flex min-w-0 flex-1 items-center gap-1 text-sm',
            state === 'done' ? 'text-base-text-success' : 'text-base-text-muted',
          ]"
          data-test="transfer-state"
        >
          <PhCheckCircle v-if="state === 'done'" weight="fill" class="shrink-0 icon-4" />
          <PhClock v-else-if="state === 'sent'" class="shrink-0 icon-4" />
          <span class="truncate">
            <template v-if="state === 'done'">{{ $t("settle-up-state-done") }}</template>
            <template v-else-if="state === 'sent' && toMe">
              {{ $t("settle-up-state-sent-to-you", { name: from.userName }) }}
            </template>
            <template v-else-if="state === 'sent'">{{ $t("settle-up-state-sent", { name: to.userName }) }}</template>
            <template v-else>{{ $t("settle-up-state-open") }}</template>
          </span>
        </p>
        <SButton
          v-if="action"
          class="shrink-0"
          variant="primary"
          size="sm"
          :loading="loading"
          :data-test="`transfer-${action}`"
          @click="action === 'markPaid' ? emit('markPaid') : emit('confirm')"
        >
          {{ action === "markPaid" ? $t("settle-up-mark-paid") : $t("settle-up-confirm") }}
        </SButton>
      </div>
    </div>
  </li>
</template>
