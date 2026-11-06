<script setup lang="ts">
import NumberFlow from "@number-flow/vue";
import { computed } from "vue";

import { currencyFormatOptions, formatCurrency } from "@/libs/format-currency";
import { MOTION_EASING, motionMs } from "@/libs/motion";

/**
 * An amount of money on the home page. The digits roll when the value changes, and the first render does not roll.
 * The sign comes from the text next to the amount, so the amount shows as a positive number.
 * NumberFlow gives a screen reader the full value as an image label. A currency code that Intl rejects shows as plain text.
 */
export interface HomeAmountProps {
  /** The amount. The component shows its absolute value. */
  amount: number;
  /** The ISO 4217 code of the currency. */
  currency: string;
}

const { amount, currency } = defineProps<HomeAmountProps>();

const format = computed(() => currencyFormatOptions(currency));

// The defaults of NumberFlow take 900ms and overshoot. The container token keeps the roll short and with no bounce.
const timing = { duration: motionMs("container"), easing: MOTION_EASING.enter };
</script>

<template>
  <NumberFlow
    v-if="format"
    :value="Math.abs(amount)"
    :format="format"
    :transform-timing="timing"
    :spin-timing="timing"
    :opacity-timing="timing"
  />
  <template v-else>{{ formatCurrency(amount, currency) }}</template>
</template>
