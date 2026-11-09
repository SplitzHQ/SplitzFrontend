<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import type { GroupMemberTransferDto } from "@/backend";
import Avatar from "@/components/Avatar/Avatar.vue";
import AmountChip from "@/components/ListRow/AmountChip.vue";
import { LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import SButton from "@/components/SButton/SButton.vue";
import { formatCurrency } from "@/libs/format-currency";

/** One member line of the card: the money between the user and one member, and the photo of that member. */
export interface BalanceCardMember extends GroupMemberTransferDto {
  /** The photo path of the member. Leave it out when the member has no photo. */
  photo?: string | null;
}

/** Net balance and the money between the user and each member, for one currency. */
export interface BalanceCardProps {
  totalBalance: string;
  currency: string;
  memberBalances: BalanceCardMember[];
}

const { totalBalance, currency, memberBalances } = defineProps<BalanceCardProps>();
const emit = defineEmits<{ settleUp: [] }>();

const { $t } = useFluent();

const total = computed(() => Number(totalBalance));
const settled = computed(() => memberBalances.length === 0);

/** The title says the direction of the net amount, so the amount has no sign. */
const totalLabel = computed(() => {
  if (settled.value) return $t("group-detail-all-settled");
  if (total.value === 0) return $t("group-detail-total-balance");
  return total.value < 0 ? $t("group-detail-you-owe-label") : $t("group-detail-you-lent-label");
});

const totalColor = computed(() => {
  if (total.value === 0) return "text-base-text-primary";
  return total.value < 0 ? "text-base-text-error" : "text-base-text-success";
});

/** A negative amount is money that the member owes the user. */
const owesYou = (member: BalanceCardMember) => Number(member.amount) < 0;
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl bg-core-alpha-brand-5 p-4" data-test="balance-card">
    <div class="flex items-center gap-3">
      <div class="flex min-w-0 flex-1 flex-col">
        <p class="text-sm text-base-text-quaternary">{{ totalLabel }}</p>
        <p class="text-display-lg font-medium wrap-break-word" :class="totalColor" data-test="balance-card-total">
          {{ formatCurrency(totalBalance, currency) }}
        </p>
      </div>
      <!-- A settled group has nothing to settle, so the button does not show. -->
      <SButton v-if="!settled" class="shrink-0" variant="primary" size="md" @click="emit('settleUp')">
        {{ $t("group-detail-settle-up") }}
      </SButton>
    </div>

    <!--
      One line for each member: the avatar, the direction with the name in a darker color, and the amount at the end.
      A long name must not push the amount out of the card, and the words of the direction must stay. The sentence is
      a flex row, so each text part of the message is its own item. Only the name can shrink, so the name is cut and
      the other words keep their width. The message puts the name first in English and last in Chinese, so the row
      cannot use a fixed order. `whitespace-pre` keeps the space at the edge of each text part.
    -->
    <ul v-if="!settled" class="flex flex-col gap-2">
      <li v-for="member in memberBalances" :key="member.userId" class="flex items-center gap-2">
        <Avatar aria-hidden="true" class="shrink-0" :images="[{ alt: member.name, src: member.photo }]" size="xxs" />
        <i18n
          :path="owesYou(member) ? 'group-detail-owes-you' : 'group-detail-you-owe'"
          :class="['flex min-w-0 flex-1 whitespace-pre', LIST_ROW_TEXT.direction]"
          data-test="balance-card-direction"
        >
          <template #name>
            <span class="min-w-0 truncate text-base-text-primary">{{ member.name }}</span>
          </template>
        </i18n>
        <AmountChip
          class="shrink-0"
          :tone="owesYou(member) ? 'owed' : 'owes'"
          :amount="member.amount"
          :currency="member.currency"
        />
      </li>
    </ul>
  </div>
</template>
