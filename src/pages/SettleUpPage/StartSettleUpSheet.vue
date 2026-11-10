<script setup lang="ts">
import { PhCaretRight } from "@phosphor-icons/vue";
import { useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, shallowRef, watch } from "vue";

import { InvoiceApi, type TransactionDto } from "@/backend";
import config from "@/backend/config";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import reportError from "@/libs/report-error";
import { useUserStore } from "@/stores/user";

import CoveredExpensesSheet from "./CoveredExpensesSheet.vue";
import { dateRange, previewRound } from "./settle-up-round";
import TransferRow from "./TransferRow.vue";

/**
 * The start of a settle-up: who pays whom for all the expenses that no settle-up covers yet. The line under the
 * transfers opens the full list of those expenses (`CoveredExpensesSheet`). Start creates one round in the backend for
 * each currency, and the expenses that it covers are then locked.
 */
const { groupId, transactions } = defineProps<{
  groupId: string;
  /** All expenses of the group. The sheet keeps the ones that no settle-up covers. */
  transactions: TransactionDto[];
}>();

const open = defineModel<boolean>({ required: true });

const { $t } = useFluent();
const userStore = useUserStore();
const queryCache = useQueryCache();
const invoiceApi = new InvoiceApi(config);

/** Formats a day as in the expense list, for example "Nov 5". */
function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const previews = computed(() => previewRound(transactions));
const covered = computed(() => previews.value.flatMap((preview) => preview.transactions));
const hasTransfers = computed(() => previews.value.some((preview) => preview.transfers.length > 0));
/** The currency shows above its transfers only when the round has more than one currency. */
const showCurrency = computed(() => previews.value.length > 1);

/** The dates of the covered expenses, for example "Nov 1 – Nov 5", or one date when all have the same day. */
const range = computed(() => {
  const dates = dateRange(covered.value);
  if (!dates) return "";
  const first = formatDay(dates.first);
  const last = formatDay(dates.last);
  return first === last ? first : `${first} – ${last}`;
});

const showCovered = shallowRef(false);
const isStarting = shallowRef(false);
const startFailed = shallowRef(false);

watch(open, (value) => {
  if (value) startFailed.value = false;
});

/** Creates the round: one invoice for each currency that has a transfer, with all its uncovered expenses. */
async function start() {
  if (isStarting.value) return;
  isStarting.value = true;
  startFailed.value = false;
  try {
    await Promise.all(
      previews.value
        .filter((item) => item.transfers.length > 0)
        .map((preview) =>
          invoiceApi.createInvoice({
            invoiceInputDto: {
              currency: preview.currency,
              groupId,
              transactionIds: preview.transactions.map((transaction) => transaction.transactionId!),
            },
          })
        )
    );
    open.value = false;
  } catch (error) {
    reportError("settle-up", error);
    startFailed.value = true;
  } finally {
    isStarting.value = false;
    // A failure after the first currency still created a round, so the page loads the data again in both cases.
    await Promise.all([
      queryCache.invalidateQueries({ key: ["getGroupInvoices", groupId] }),
      queryCache.invalidateQueries({ key: ["getGroupTransactions", groupId] }),
      queryCache.invalidateQueries({ key: ["getGroup", groupId] }),
    ]);
  }
}
</script>

<template>
  <Sheet
    v-model="open"
    :title="$t('settle-up-start-title')"
    :description="hasTransfers ? $t('settle-up-start-description') : $t('settle-up-start-even')"
    detent="large"
  >
    <div class="flex flex-col gap-4" data-test="start-settle-up">
      <section v-for="preview in previews" v-show="preview.transfers.length > 0" :key="preview.currency">
        <h3 v-if="showCurrency" class="text-sm font-semibold text-base-text-primary">{{ preview.currency }}</h3>
        <ul class="flex flex-col">
          <TransferRow
            v-for="transfer in preview.transfers"
            :key="`${transfer.from.id}-${transfer.to.id}`"
            :from="transfer.from"
            :to="transfer.to"
            :amount="transfer.amount"
            :currency="transfer.currency"
            :user-id="userStore.user?.id"
          />
        </ul>
      </section>

      <!-- The rough preview of what the round covers. A tap opens every expense. -->
      <button
        v-if="covered.length > 0"
        type="button"
        class="flex min-h-11 items-center gap-2 rounded-2xl bg-base-bg-secondary px-4 py-3 text-left transition-colors duration-state ease-standard hover:bg-comp-card-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand"
        data-test="start-covers"
        @click="showCovered = true"
      >
        <span class="min-w-0 flex-1 text-sm text-base-text-secondary">
          {{ $t("settle-up-start-covers", { count: covered.length, range }) }}
        </span>
        <PhCaretRight class="shrink-0 icon-4 text-base-text-muted" aria-hidden="true" />
      </button>
    </div>

    <template #actions>
      <Notice v-if="startFailed" tone="error" announce data-test="start-settle-up-error">
        <p>{{ $t("settle-up-start-error") }}</p>
      </Notice>
      <SButton
        v-if="hasTransfers"
        variant="primary"
        size="xl"
        :loading="isStarting"
        data-test="start-settle-up-submit"
        @click="start"
      >
        {{ $t("settle-up-start-submit") }}
      </SButton>
      <SButton variant="secondary" size="xl" :disabled="isStarting" @click="open = false">
        {{ $t("settle-up-start-cancel") }}
      </SButton>
    </template>
  </Sheet>

  <CoveredExpensesSheet v-model="showCovered" :transactions="covered" :range="range" />
</template>
