<script setup lang="ts">
import { PhCaretRight } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";

import Sheet from "@/components/Sheet/Sheet.vue";

import { leadTotal, type HomeBalance } from "./home-balances";
import HomeAmount from "./HomeAmount.vue";

/**
 * The total balance of the user above the group list. It is one row with a surface, so it reads as one control
 * and not as a second title above the list. The row shows one total with a + or a − sign, so the direction does not
 * depend on the color. When the user has more than one total, a tap on the row opens a sheet with all totals, one group
 * for each direction.
 *
 * The app has no exchange rates, so the row and the sheet show no converted total.
 */
const { commonCurrency, totals } = defineProps<{
  /** The currency that the most groups use. The row shows the total in this currency. */
  commonCurrency?: string;
  /** The totals of the user, one for each currency. A zero total does not show. */
  totals: readonly HomeBalance[];
}>();

const { $t } = useFluent();

const open = ref(false);

const openTotals = computed(() => totals.filter(({ amount }) => amount !== 0));
const lead = computed(() => leadTotal(openTotals.value, commonCurrency));
/** The row opens the sheet only when the sheet shows more than the row. */
const hasDetails = computed(() => openTotals.value.length > 1);

/** The groups of the sheet: one for each direction that has a total, the owed totals first. */
const detailParts = computed(() =>
  [
    {
      key: "owed",
      label: "home-you-lent",
      tone: "text-base-text-success",
      totals: openTotals.value.filter(({ amount }) => amount > 0),
    },
    {
      key: "owes",
      label: "home-you-owe",
      tone: "text-base-text-error",
      totals: openTotals.value.filter(({ amount }) => amount < 0),
    },
  ].filter((part) => part.totals.length > 0)
);
</script>

<template>
  <component
    :is="hasDetails ? 'button' : 'div'"
    :type="hasDetails ? 'button' : undefined"
    class="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-base-bg-secondary px-4 text-left text-base whitespace-nowrap"
    :class="
      hasDetails &&
      'touch-manipulation transition-colors duration-(--motion-duration-hover-in) ease-(--motion-easing-standard) hover:bg-base-bg-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid active:bg-base-bg-secondary_hover'
    "
    data-testid="home-total-balance"
    @click="hasDetails && (open = true)"
  >
    <span class="text-sm font-medium text-base-text-quaternary">{{ $t("home-total-balance") }}</span>
    <span class="flex items-center gap-1.5">
      <!-- One element for each sign, so the digits roll and the color fades when the sign changes. -->
      <span
        v-if="lead"
        class="font-semibold tabular-nums"
        :class="lead.amount < 0 ? 'text-base-text-error' : 'text-base-text-success'"
      >
        {{ lead.amount < 0 ? "−" : "+" }}<HomeAmount :amount="lead.amount" :currency="lead.currency" />
      </span>
      <span v-else class="text-sm font-medium text-base-text-quaternary">{{ $t("home-you-are-settled-up") }}</span>
      <PhCaretRight v-if="hasDetails" class="icon-4 text-base-text-quinary" aria-hidden="true" />
    </span>
  </component>

  <Sheet v-model="open" :title="$t('home-total-balance')" detent="medium" show-close-button>
    <!-- One group for each direction. A line names the currency on the left and the amount on the right. -->
    <div class="flex flex-col gap-5 text-base">
      <section v-for="part in detailParts" :key="part.key" class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold text-base-text-quaternary">{{ $t(part.label) }}</h3>
        <p
          v-for="total in part.totals"
          :key="total.currency"
          class="flex min-h-10 items-center justify-between gap-3 whitespace-nowrap"
        >
          <span class="text-base-text-secondary">{{ total.currency }}</span>
          <span class="font-medium tabular-nums" :class="part.tone">
            <HomeAmount :amount="total.amount" :currency="total.currency" />
          </span>
        </p>
      </section>
    </div>
  </Sheet>
</template>
