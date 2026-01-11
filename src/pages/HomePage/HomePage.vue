<script setup lang="ts">
import {
  PhArrowsDownUp,
  PhBell,
  PhList,
  PhMagnifyingGlass,
  PhPlus,
  PhSlidersHorizontal,
  PhUsers
} from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import EmptyStateBackground from "./EmptyStateBackground.vue";

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

const userStore = useUserStore();

const searchKeyword = ref("");

const groupApi = new GroupApi(config);
const { state: groupsQuery } = useQuery({ key: ["getGroups"], query: () => groupApi.getGroups() });

const groups = computed(() => {
  return groupsQuery.value.data ?? [];
});

const groupWithExtraInfo = computed(() => {
  return groups.value.map((group) => {
    const myBalances = group.balances
      .filter((b) => b.user.id === userStore.user?.id)
      .map((b) => ({
        ...b,
        amount: Number.parseFloat(b.balance)
      }));
    const myBalanceNegative = myBalances.filter((b) => b.amount < 0);
    const myBalancePositive = myBalances.filter((b) => b.amount > 0);
    const myBalanceSettled = myBalances.every((b) => b.amount === 0);
    const groupSettled = group.balances.every((b) => b.balance === "0");
    return { ...group, myBalances, myBalanceNegative, myBalancePositive, myBalanceSettled, groupSettled };
  });
});

const visibleGroups = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const filtered = keyword
    ? groupWithExtraInfo.value.filter((g) => g.name.toLowerCase().includes(keyword))
    : groupWithExtraInfo.value;
  return [...filtered].sort((a, b) => b.lastActivityTime.getTime() - a.lastActivityTime.getTime());
});

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

const hasGroups = computed(() => visibleGroups.value.length > 0);
const showEmptyState = computed(() => groupsQuery.value.status === "success" && !hasGroups.value);
const showLoadingState = computed(() => groupsQuery.value.status === "pending");

const addExpense = () => {
  routerHistoryStore.addParentHistory(router.currentRoute.value.path);
  void router.push({ name: "newExpense" });
};

const createGroup = () => {
  routerHistoryStore.addParentHistory(router.currentRoute.value.path);
  void router.push({ name: "createGroup" });
};

const userBalances = computed(() => {
  const balances: { amount: number; currency: string }[] = [];
  for (const userBalance of userStore.user?.balances ?? []) {
    const existing = balances.find((b) => b.currency === userBalance.currency);
    if (existing) {
      existing.amount += Number.parseFloat(userBalance.balance);
    } else {
      balances.push({ amount: Number.parseFloat(userBalance.balance), currency: userBalance.currency });
    }
  }
  return balances;
});
</script>

<template>
  <Layout>
    <template #header>
      <div class="flex flex-col gap-3 border-b border-base-border-quaternary bg-base-bg-secondary_alt px-4 pt-4 pb-4">
        <!-- Header -->
        <div class="flex w-full items-center justify-between">
          <div class="flex items-center gap-2.5">
            <SIconButton variant="ghost" color="neutral" size="lg">
              <PhList class="text-util-color-brand-700" />
            </SIconButton>
            <h1 class="text-lg leading-7 font-bold text-util-color-brand-700">Splitz</h1>
          </div>
          <div class="flex items-start gap-2.5">
            <SIconButton variant="ghost" color="neutral" size="lg">
              <PhBell class="text-util-color-brand-700" />
            </SIconButton>
            <Avatar :images="[{ src: userStore.user?.photo ?? null, alt: userStore.user?.userName ?? '' }]" size="xs" />
          </div>
        </div>

        <!-- Search Bar -->
        <div class="flex w-full items-start gap-2.5">
          <div class="flex flex-1 items-center gap-2 rounded-full bg-util-alpha-black-5 p-2.5">
            <PhMagnifyingGlass class="size-5 shrink-0 text-util-color-brand-700" />
            <TextInput v-model="searchKeyword" :placeholder="$t('home-search-placeholder')" />
          </div>
          <SIconButton variant="secondary" color="neutral" size="lg">
            <PhSlidersHorizontal class="size-5 text-base-text-primary" />
          </SIconButton>
        </div>
      </div>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs">
        <!-- Floating Action Button -->
        <SIconButton
          variant="primary"
          color="brand"
          size="xxl"
          class="fixed right-5 bottom-12 z-10"
          @click="addExpense"
        >
          <PhPlus />
        </SIconButton>

        <div v-if="hasGroups" class="flex flex-col gap-1 pt-3 pb-4">
          <!-- Section Header -->
          <div class="flex items-center justify-between px-1">
            <p class="text-sm leading-5 font-semibold text-base-text-quaternary">{{ $t("home-all-groups") }}</p>
            <div v-if="userBalances.length > 0" class="flex items-center gap-1 text-sm leading-5 font-medium">
              <PhArrowsDownUp class="icon-4 text-base-text-quinary" />
              <span class="text-base-text-quinary">{{ $t("home-total-balance") }}</span>
              <template v-for="userBalance in userBalances" :key="userBalance.currency">
                <span v-if="userBalance.amount > 0" class="text-util-color-success-600">
                  {{ formatCurrency(userBalance.amount, userBalance.currency) }}
                </span>
                <span v-else-if="userBalance.amount < 0" class="text-base-text-error">
                  {{ formatCurrency(userBalance.amount, userBalance.currency) }}
                </span>
                <span v-else class="text-base-text-quinary">
                  {{ formatCurrency(0, userBalance.currency) }}
                </span>
              </template>
            </div>
          </div>

          <!-- Group List -->
          <div class="flex flex-col">
            <button
              v-for="group in visibleGroups"
              :key="group.groupId"
              type="button"
              class="flex w-full items-center gap-3 py-2 text-left"
            >
              <div v-if="group.photo" class="h-16 w-16 overflow-hidden rounded-2xl bg-util-alpha-black-5">
                <img :src="group.photo" :alt="group.name" class="h-full w-full object-cover" />
              </div>
              <Avatar
                v-else
                size="lg"
                :images="group.members.slice(0, 4).map((m) => ({ src: m.photo ?? null, alt: m.userName }))"
              />

              <div class="min-w-0 flex-1">
                <p class="truncate text-base leading-6 font-semibold text-base-text-primary">
                  {{ group.name }}
                </p>

                <div class="mt-1 flex items-center gap-1 text-sm leading-5 font-medium">
                  <template v-if="group.myBalancePositive.length > 0">
                    <span class="text-base-text-quinary">{{ $t("home-you-lent") }}</span>
                    <span
                      v-for="balance in group.myBalancePositive"
                      :key="balance.currency"
                      class="text-util-color-success-600"
                    >
                      {{ formatCurrency(Math.abs(balance.amount), balance.currency) }}
                    </span>
                  </template>
                  <template v-if="group.myBalanceNegative.length > 0">
                    <span class="text-base-text-quinary">{{ $t("home-you-owe") }}</span>
                    <span
                      v-for="balance in group.myBalanceNegative"
                      :key="balance.currency"
                      class="text-base-text-error"
                    >
                      {{ formatCurrency(Math.abs(balance.amount), balance.currency) }}
                    </span>
                  </template>
                  <span v-if="group.groupSettled" class="text-core-alpha-brand-80">
                    {{ $t("home-all-settled-up") }}
                  </span>
                  <span v-else-if="group.myBalanceSettled" class="text-core-alpha-brand-80">
                    {{ $t("home-you-are-settled-up") }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <template v-else-if="showEmptyState">
          <EmptyStateBackground class="-mb-20" />

          <div class="flex flex-1 flex-col items-center gap-12">
            <div class="flex flex-col items-center gap-2 px-8 py-0 text-center leading-none">
              <h2 class="flex flex-col justify-center text-display-xs font-medium text-base-text-primary">
                {{ $t("home-empty-state-title") }}
              </h2>
              <p class="flex flex-col justify-center text-base font-normal text-base-text-tertiary">
                {{ $t("home-empty-state-description") }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex w-full flex-col items-start gap-3 px-3 py-0">
              <SButton variant="primary" color="brand" size="xxl" class="w-full" @click="addExpense">
                <template #icon-left>
                  <PhPlus />
                </template>
                {{ $t("home-button-record-expense") }}
              </SButton>
              <SButton variant="outline" color="neutral" size="xxl" class="w-full" @click="createGroup">
                <template #icon-left>
                  <PhUsers />
                </template>
                {{ $t("home-button-create-group") }}
              </SButton>
            </div>
          </div>
        </template>

        <div v-else-if="showLoadingState" class="px-4 pt-6 text-base text-base-text-tertiary">
          {{ $t("home-loading") }}
        </div>
      </div>
    </template>
  </Layout>
</template>
