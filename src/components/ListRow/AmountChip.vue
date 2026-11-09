<script setup lang="ts">
import { formatCurrency } from "@/libs/format-currency";

/**
 * An amount of money on a tinted fill, in green for money that the user gets and in red for money that the user owes.
 * The amount has no sign, because the direction label next to it gives the direction. See `list-row.usage.ts`.
 */
export interface AmountChipProps {
  /** `owed`: someone owes the user this money. `owes`: the user owes this money. */
  tone: "owed" | "owes";
  /** The amount. The chip shows its absolute value. Leave it out when the default slot gives the content. */
  amount?: number | string;
  /** The ISO 4217 code of the currency. */
  currency?: string;
}

const { tone, amount = 0, currency = "" } = defineProps<AmountChipProps>();

defineSlots<{
  /** Other content for the amount, for example an amount whose digits roll. */
  default?: () => unknown;
}>();

// Full class strings keep the Tailwind scanner able to find them.
const TONE_CLASS: Record<AmountChipProps["tone"], string> = {
  owed: "bg-base-bg-success-subtle text-base-text-success",
  owes: "bg-base-bg-error text-base-text-error",
};
</script>

<template>
  <span :class="['rounded-md px-1 text-sm font-medium whitespace-nowrap', TONE_CLASS[tone]]">
    <slot>{{ formatCurrency(amount, currency) }}</slot>
  </span>
</template>
