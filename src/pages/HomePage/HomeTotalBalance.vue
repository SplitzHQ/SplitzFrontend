<script setup lang="ts">
import { PhCaretRight } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";

import Sheet from "@/components/Sheet/Sheet.vue";

import { selectPrimaryTotal, type HomeBalance } from "./home-balances";
import HomeAmount from "./HomeAmount.vue";

/**
 * Summary card displaying the user's net balance above the group list on `HomePage`.
 * Rendered as a single filled row so it reads as a summary control rather than a second section heading, with an
 * explicit `+` or `−` prefix so direction never relies on color alone. When the user carries non-zero totals across
 * multiple currencies, tapping opens a breakdown sheet grouped into owed-to-you and owed-by-you sections.
 *
 * Because Splitz does not convert between currencies, neither the card nor the sheet displays a converted sum.
 */
const { commonCurrency, totals } = defineProps<{
  /** Most frequent non-zero currency across the user's groups, preferred as the headline total. */
  commonCurrency?: string;
  /** Per-currency net balances for the current user (zero-valued entries are omitted from display). */
  totals: readonly HomeBalance[];
}>();

const { $t } = useFluent();

const isSheetOpen = ref(false);

const nonZeroTotals = computed(() => totals.filter(({ amount }) => amount !== 0));
const primaryTotal = computed(() => selectPrimaryTotal(nonZeroTotals.value, commonCurrency));
/** Interactive sheet trigger only when additional currencies exist beyond `primaryTotal`. */
const hasMultipleCurrencies = computed(() => nonZeroTotals.value.length > 1);

/** Breakdown sections inside the sheet, showing owed-to-you currencies ahead of owed-by-you currencies. */
const directionSections = computed(() =>
  [
    {
      key: "owed",
      label: "home-you-lent",
      tone: "text-base-text-success",
      totals: nonZeroTotals.value.filter(({ amount }) => amount > 0),
    },
    {
      key: "owes",
      label: "home-you-owe",
      tone: "text-base-text-error",
      totals: nonZeroTotals.value.filter(({ amount }) => amount < 0),
    },
  ].filter((section) => section.totals.length > 0)
);
</script>

<template>
  <component
    :is="hasMultipleCurrencies ? 'button' : 'div'"
    :type="hasMultipleCurrencies ? 'button' : undefined"
    class="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-base-bg-secondary px-4 text-left text-base whitespace-nowrap"
    :class="
      hasMultipleCurrencies &&
      'touch-manipulation transition-colors duration-hover-in ease-standard hover:bg-base-bg-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid active:bg-base-bg-secondary_hover'
    "
    data-testid="home-total-balance"
    @click="hasMultipleCurrencies && (isSheetOpen = true)"
  >
    <span class="text-sm font-medium text-base-text-quaternary">{{ $t("home-total-balance") }}</span>
    <span class="flex items-center gap-1.5">
      <!-- Keep a single mounted `HomeAmount` across sign flips so digits roll and color cross-fades smoothly. -->
      <span
        v-if="primaryTotal"
        class="font-semibold tabular-nums"
        :class="primaryTotal.amount < 0 ? 'text-base-text-error' : 'text-base-text-success'"
      >
        {{ primaryTotal.amount < 0 ? "−" : "+"
        }}<HomeAmount :amount="primaryTotal.amount" :currency="primaryTotal.currency" />
      </span>
      <span v-else class="text-sm font-medium text-base-text-quaternary">{{ $t("home-you-are-settled-up") }}</span>
      <PhCaretRight v-if="hasMultipleCurrencies" class="icon-4 text-base-text-quinary" aria-hidden="true" />
    </span>
  </component>

  <Sheet v-model="isSheetOpen" :title="$t('home-total-balance')" detent="medium" show-close-button>
    <div class="flex flex-col gap-5 text-base">
      <section v-for="section in directionSections" :key="section.key" class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold text-base-text-quaternary">{{ $t(section.label) }}</h3>
        <p
          v-for="total in section.totals"
          :key="total.currency"
          class="flex min-h-10 items-center justify-between gap-3 whitespace-nowrap"
        >
          <span class="text-base-text-secondary">{{ total.currency }}</span>
          <span class="font-medium tabular-nums" :class="section.tone">
            <HomeAmount :amount="total.amount" :currency="total.currency" />
          </span>
        </p>
      </section>
    </div>
  </Sheet>
</template>
