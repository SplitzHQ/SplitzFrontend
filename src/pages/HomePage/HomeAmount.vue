<script setup lang="ts">
import NumberFlow from "@number-flow/vue";
import { computed } from "vue";

import { currencyFormatOptions, formatCurrency } from "@/libs/format-currency";
import { MOTION_EASING, motionMs } from "@/libs/motion";

/**
 * Animated unsigned currency amount for `HomePage` balance summaries and group rows.
 * Rolls digits smoothly when `amount` updates after mount while staying static on initial render.
 * Surroundings convey direction (via labels or explicit `+`/`−` prefixes), so `amount` always renders as `Math.abs(amount)`.
 * `NumberFlow` exposes the full formatted string to screen readers via `role="img"` + `aria-label`; unrecognized
 * currency codes fall back to plain text via `formatCurrency`.
 */
export interface HomeAmountProps {
  /** Signed or unsigned amount (rendered as `Math.abs(amount)`). */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
}

const { amount, currency } = defineProps<HomeAmountProps>();

const numberFormatOptions = computed(() => currencyFormatOptions(currency));

// Override NumberFlow's 900ms spring default with `container` duration and `enter` easing for a crisp, bounce-free roll.
const rollTiming = { duration: motionMs("container"), easing: MOTION_EASING.enter };
</script>

<template>
  <NumberFlow
    v-if="numberFormatOptions"
    :value="Math.abs(amount)"
    :format="numberFormatOptions"
    :transform-timing="rollTiming"
    :spin-timing="rollTiming"
    :opacity-timing="rollTiming"
  />
  <template v-else>{{ formatCurrency(amount, currency) }}</template>
</template>
