<script setup lang="ts">
import { PhMapPin, PhPencil, PhTrash, PhX } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { GroupApi, TransactionApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import { categoryColorMap } from "@/components/Category/category-color";
import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { getCategory, getMainCategory } from "@/libs/categories";
import { useUserStore } from "@/stores/user";

import DeleteConfirmSheet from "./DeleteConfirmSheet.vue";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const queryCache = useQueryCache();

const groupId = computed(() => route.params.groupId as string);
const transactionId = computed(() => route.params.transactionId as string);

const transactionApi = new TransactionApi(config);
const groupApi = new GroupApi(config);

const { state: transactionQuery } = useQuery({
  key: () => ["getTransaction", transactionId.value],
  query: () => transactionApi.getTransaction({ id: transactionId.value }),
});

const { state: groupQuery } = useQuery({
  key: () => ["getGroup", groupId.value],
  query: () => groupApi.getGroup({ groupId: groupId.value }),
});

const transaction = computed(() => transactionQuery.value.data);
const group = computed(() => groupQuery.value.data);

const showDeleteSheet = ref(false);
const isDeleting = ref(false);

// group avatar images
const avatarImages = computed(() => {
  if (!group.value) return [];
  if (group.value.photo) {
    return [{ alt: group.value.name, src: group.value.photo }];
  }
  return group.value.members.slice(0, 4).map((m) => ({ alt: m.userName, src: m.photo ?? null }));
});

// Category
const subcategory = computed(() => getCategory(transaction.value?.icon));
const mainCategory = computed(() => getMainCategory(transaction.value?.icon));
const colorClass = computed(() => categoryColorMap[mainCategory.value]);

// Payer: the person with the most negative balance
const payer = computed(() => {
  const balances = transaction.value?.balances ?? [];
  const sorted = [...balances].sort((a, b) => Number(a.balance) - Number(b.balance));
  return sorted[0]?.user ?? null;
});

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { currency, style: "currency" }).format(Math.abs(amount));
  } catch {
    return `${Math.abs(amount).toFixed(2)} ${currency}`;
  }
};

const payerDescription = computed(() => {
  if (!payer.value || !transaction.value) return "";
  const amount = formatCurrency(Number(transaction.value.amount), transaction.value.currency);
  if (payer.value.id === userStore.user?.id) {
    return $t("transaction-detail-you-paid", { amount });
  }
  return $t("transaction-detail-paid-by", { amount, name: payer.value.userName });
});

const formattedDate = computed(() => {
  if (!transaction.value) return "";
  return new Date(transaction.value.transactionTime).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    weekday: "short",
    year: "numeric",
  });
});

const displayName = computed(() => {
  if (!transaction.value) return "";
  return transaction.value.name || formatCurrency(Number(transaction.value.amount), transaction.value.currency);
});

const formattedAmount = computed(() => {
  if (!transaction.value) return "";
  return formatCurrency(Number(transaction.value.amount), transaction.value.currency);
});

async function handleDelete() {
  if (isDeleting.value) return;
  try {
    isDeleting.value = true;
    await transactionApi.deleteTransaction({ id: transactionId.value });
    queryCache.invalidateQueries({ key: ["getGroupTransactions", groupId.value] });
    void router.replace({ name: "groupDetail", params: { groupId: groupId.value } });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    showDeleteSheet.value = false;
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <div v-if="group" class="flex items-center justify-center gap-2">
          <Avatar :images="avatarImages" size="xs" />
          <p class="text-base font-medium text-base-text-primary">{{ group.name }}</p>
        </div>
        <!-- Add an invisible close button to make sure the header layout remains consistent -->
        <template #right>
          <SIconButton variant="ghost" color="neutral" size="lg" class="pointer-events-none">
            <PhX class="text-transparent" />
          </SIconButton>
        </template>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-5 px-4 pb-8">
        <!-- Loading -->
        <div v-if="transactionQuery.status === 'pending'" class="pt-6 text-base text-base-text-tertiary">
          {{ $t("transaction-detail-loading") }}
        </div>

        <!-- Error -->
        <div v-else-if="transactionQuery.status === 'error'" class="pt-6 text-base text-base-text-error">
          {{ $t("transaction-detail-error") }}
        </div>

        <!-- Content -->
        <template v-else-if="transaction">
          <!-- Summary -->
          <div class="flex flex-col items-center gap-3 pt-4">
            <div class="flex size-16 items-center justify-center rounded-2xl" :class="colorClass">
              <CategoryIcon :category="subcategory" class="icon-8" />
            </div>
            <p class="text-2xl font-semibold text-base-text-primary">{{ displayName }}</p>
            <p class="text-3xl font-bold text-base-text-primary">{{ formattedAmount }}</p>
            <p class="text-sm text-base-text-quaternary">{{ payerDescription }}</p>
            <p class="text-sm text-base-text-quaternary">{{ formattedDate }}</p>
          </div>

          <!-- Tags -->
          <div v-if="transaction.tags && transaction.tags.length > 0" class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-base-text-primary">{{ $t("transaction-detail-tags") }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in transaction.tags"
                :key="tag.tagId"
                class="rounded-lg bg-base-bg-secondary px-3 py-1 text-sm text-base-text-secondary"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>

          <!-- Split Breakdown -->
          <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-base-text-primary">
              {{ $t("transaction-detail-split-breakdown") }}
            </p>
            <div class="flex flex-col gap-1 rounded-2xl bg-base-bg-secondary p-3">
              <div
                v-for="entry in transaction.balances"
                :key="entry.userId"
                class="flex items-center gap-3 rounded-xl py-2"
              >
                <Avatar :images="[{ alt: entry.user.userName, src: entry.user.photo ?? null }]" size="xs" />
                <div class="flex min-w-0 flex-1 flex-col">
                  <p class="truncate text-base font-medium text-base-text-primary">
                    {{ entry.user.id === userStore.user?.id ? $t("new-expense-pronoun-you") : entry.user.userName }}
                  </p>
                </div>
                <div class="flex shrink-0 flex-col items-end">
                  <p class="text-xs text-base-text-quaternary">
                    {{ Number(entry.balance) < 0 ? $t("transaction-detail-lent") : $t("transaction-detail-borrowed") }}
                  </p>
                  <p
                    class="text-sm font-medium"
                    :class="Number(entry.balance) < 0 ? 'text-util-color-success-600' : 'text-base-text-error'"
                  >
                    {{ formatCurrency(Number(entry.balance), transaction.currency) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Receipt -->
          <div v-if="transaction.photo" class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-base-text-primary">{{ $t("transaction-detail-receipt") }}</p>
            <img
              :src="transaction.photo"
              :alt="$t('transaction-detail-receipt')"
              class="max-h-80 rounded-2xl object-contain"
            />
          </div>

          <!-- Location -->
          <div v-if="transaction.geoCoordinate" class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-base-text-primary">{{ $t("transaction-detail-location") }}</p>
            <div class="flex items-center gap-2 rounded-2xl bg-base-bg-secondary p-3">
              <PhMapPin class="shrink-0 text-lg text-base-text-quaternary" />
              <p class="text-sm text-base-text-secondary">{{ transaction.geoCoordinate }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-auto flex flex-col gap-2 pt-4">
            <SButton variant="secondary" color="neutral" size="xxl" disabled>
              <PhPencil class="mr-2" />
              {{ $t("transaction-detail-edit") }}
            </SButton>
            <SButton variant="secondary" color="error" size="xxl" @click="showDeleteSheet = true">
              <PhTrash class="mr-2" />
              {{ $t("transaction-detail-delete") }}
            </SButton>
          </div>
        </template>
      </div>

      <!-- Delete Confirmation Sheet -->
      <DeleteConfirmSheet v-model="showDeleteSheet" :is-deleting="isDeleting" @confirm="handleDelete" />
    </template>
  </Layout>
</template>
