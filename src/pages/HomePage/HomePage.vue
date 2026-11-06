<script setup lang="ts">
import { PhArrowsDownUp, PhPlus, PhSlidersHorizontal, PhUsers } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import BrandOpening from "@/components/BrandWordmark/BrandOpening.vue";
import BrandTapLogo from "@/components/BrandWordmark/BrandTapLogo.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import AvatarMenu from "@/components/Notification/AvatarMenu.vue";
import NotificationBell from "@/components/Notification/NotificationBell.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { formatCurrency } from "@/libs/format-currency";
import { useStatusBarTopColor } from "@/libs/status-bar-color";
import { CONTENT_FADE_IN, useLoadFeedback, type LoadPhase } from "@/libs/use-load-feedback";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import HomeEmptyState from "./HomeEmptyState.vue";
import HomeGroupsSkeleton from "./HomeGroupsSkeleton.vue";
import HomeNoResults from "./HomeNoResults.vue";
import HomeSearchBar from "./HomeSearchBar.vue";

useStatusBarTopColor("--base-bg-secondary_alt");

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

const userStore = useUserStore();

const searchKeyword = ref("");

const groupApi = new GroupApi(config);
const {
  asyncStatus: groupsAsyncStatus,
  refetch: refetchGroups,
  state: groupsQuery,
} = useQuery({ key: ["getGroups"], query: () => groupApi.getGroups() });

const groups = computed(() => {
  return groupsQuery.value.data ?? [];
});

const groupWithExtraInfo = computed(() => {
  return groups.value.map((group) => {
    const myBalances = group.balances
      .filter((b) => b.user.id === userStore.user?.id)
      .map((b) => ({
        ...b,
        amount: Number.parseFloat(b.balance),
      }));
    const myBalanceNegative = myBalances.filter((b) => b.amount < 0);
    const myBalancePositive = myBalances.filter((b) => b.amount > 0);
    const myBalanceSettled = myBalances.every((b) => b.amount === 0);
    const groupSettled = group.balances.every((b) => b.balance === "0");
    return { ...group, groupSettled, myBalanceNegative, myBalancePositive, myBalanceSettled, myBalances };
  });
});

const trimmedKeyword = computed(() => searchKeyword.value.trim());

const visibleGroups = computed(() => {
  const keyword = trimmedKeyword.value.toLowerCase();
  const filtered = keyword
    ? groupWithExtraInfo.value.filter((g) => g.name.toLowerCase().includes(keyword))
    : groupWithExtraInfo.value;
  return [...filtered].sort((a, b) => b.lastActivityTime.getTime() - a.lastActivityTime.getTime());
});

// These two read the list before the search filter. A search with no result must not look like a new user.
const hasGroups = computed(() => groups.value.length > 0);
const showNoResults = computed(() => hasGroups.value && visibleGroups.value.length === 0);
const showEmptyState = computed(() => groupsQuery.value.status === "success" && !hasGroups.value);
const showLoadingState = computed(() => groupsQuery.value.status === "pending");
// A failed refresh keeps the old data, so the list stays and the page shows no error.
const showErrorState = computed(() => groupsQuery.value.status === "error" && !hasGroups.value);
const isRetrying = computed(() => showErrorState.value && groupsAsyncStatus.value === "loading");

const loadPhase = computed<LoadPhase>(() => {
  if (showLoadingState.value || isRetrying.value) return "loading";
  return showErrorState.value ? "failed" : "ready";
});

const content = useTemplateRef<HTMLElement>("content");
const { announcement, retry } = useLoadFeedback({
  content,
  messages: {
    failed: () => $t("home-error-loading-groups"),
    loaded: () => $t("home-status-loaded"),
    loading: () => $t("home-status-loading"),
  },
  phase: loadPhase,
});

const addExpense = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "newExpense" });
};

const createGroup = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "createGroup" });
};

const userBalances = computed(() => {
  const balances = new Map<string, { amount: number; currency: string }>();
  for (const userBalance of userStore.user?.balances ?? []) {
    const existing = balances.get(userBalance.currency);
    if (existing) {
      existing.amount += Number.parseFloat(userBalance.balance);
    } else {
      balances.set(userBalance.currency, {
        amount: Number.parseFloat(userBalance.balance),
        currency: userBalance.currency,
      });
    }
  }
  return [...balances.values()];
});
</script>

<template>
  <Layout>
    <template #header>
      <div
        class="flex flex-col gap-3 border-b border-base-border-quaternary bg-base-bg-secondary_alt px-4 pt-safe-4 pb-4"
      >
        <!-- Header -->
        <div class="flex w-full items-center justify-between">
          <BrandOpening />
          <h1><BrandTapLogo /></h1>
          <div class="flex items-center gap-1">
            <NotificationBell />
            <!-- The slot has the width of the bell, so the 32px avatar has the same space on each side. -->
            <div class="flex size-10 items-center justify-center">
              <AvatarMenu />
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <HomeSearchBar v-model="searchKeyword">
          <template #action>
            <SIconButton variant="ghost" size="sm" :aria-label="$t('home-filter')">
              <PhSlidersHorizontal />
            </SIconButton>
          </template>
        </HomeSearchBar>
      </div>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs">
        <!-- Floating Action Button -->
        <SIconButton
          variant="primary"
          size="xl"
          class="fixed right-safe-5 bottom-safe-12 z-10"
          :aria-label="$t('home-button-record-expense')"
          @click="addExpense"
        >
          <PhPlus />
        </SIconButton>

        <!-- This element stays in the page, so a screen reader reads the result when the text changes. -->
        <p role="status" class="sr-only">
          {{ showNoResults ? $t("home-no-results-title", { keyword: trimmedKeyword }) : "" }}
        </p>

        <p role="status" class="sr-only">{{ announcement }}</p>

        <!-- A successful retry removes the button that had the focus, so the focus moves to this block. -->
        <div ref="content" tabindex="-1" class="outline-none">
          <Transition v-bind="CONTENT_FADE_IN">
            <div v-if="hasGroups" class="flex flex-col gap-1 pt-3 pb-4">
              <Transition
                enter-active-class="transition-opacity duration-state ease-enter"
                enter-from-class="opacity-0"
              >
                <HomeNoResults v-if="showNoResults" :keyword="trimmedKeyword" @clear="searchKeyword = ''" />
              </Transition>

              <!-- Section Header -->
              <div v-if="!showNoResults" class="flex items-center justify-between px-1">
                <p class="text-sm font-semibold text-base-text-quaternary">{{ $t("home-all-groups") }}</p>
                <div v-if="userBalances.length > 0" class="flex items-center gap-1 text-sm font-medium">
                  <PhArrowsDownUp class="icon-4 text-base-text-quinary" />
                  <span class="text-base-text-quinary">{{ $t("home-total-balance") }}</span>
                  <template v-for="userBalance in userBalances" :key="userBalance.currency">
                    <span v-if="userBalance.amount > 0" class="text-base-text-success">
                      {{ formatCurrency(userBalance.amount, userBalance.currency) }}
                    </span>
                    <span v-else-if="userBalance.amount < 0" class="text-base-text-error">
                      {{ formatCurrency(-userBalance.amount, userBalance.currency) }}
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
                  @click="router.push({ name: 'groupDetail', params: { groupId: group.groupId } })"
                >
                  <Avatar
                    v-if="group.photo"
                    size="lg"
                    :images="[{ src: group.photo, alt: group.name }]"
                    aria-hidden="true"
                  />
                  <Avatar
                    v-else
                    size="lg"
                    :images="group.members.slice(0, 4).map((m) => ({ src: m.photo ?? null, alt: m.userName }))"
                    aria-hidden="true"
                  />

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-base font-semibold text-base-text-primary">
                      {{ group.name }}
                    </p>

                    <div class="mt-1 flex items-center gap-1 text-sm font-medium">
                      <template v-if="group.myBalancePositive.length > 0">
                        <span class="text-base-text-quinary">{{ $t("home-you-lent") }}</span>
                        <span
                          v-for="balance in group.myBalancePositive"
                          :key="balance.currency"
                          class="text-base-text-success"
                        >
                          {{ formatCurrency(balance.amount, balance.currency) }}
                        </span>
                      </template>
                      <template v-if="group.myBalanceNegative.length > 0">
                        <span class="text-base-text-quinary">{{ $t("home-you-owe") }}</span>
                        <span
                          v-for="balance in group.myBalanceNegative"
                          :key="balance.currency"
                          class="text-base-text-error"
                        >
                          {{ formatCurrency(balance.amount, balance.currency) }}
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

                <!-- Create Group row. Keeps group creation reachable when the user already has groups. -->
                <button
                  type="button"
                  class="flex w-full items-center gap-3 py-2 text-left"
                  data-testid="home-create-group"
                  @click="createGroup"
                >
                  <div
                    class="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-base-border-secondary text-util-color-brand-700"
                  >
                    <PhUsers class="size-7" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-base font-semibold text-base-text-primary">
                      {{ $t("home-button-create-group") }}
                    </p>
                    <p class="mt-1 text-sm font-medium text-base-text-quinary">
                      {{ $t("home-create-group-hint") }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Transition needs one root element, and HomeEmptyState has two. -->
            <div v-else-if="showEmptyState">
              <HomeEmptyState @add-expense="addExpense" @create-group="createGroup" />
            </div>

            <HomeGroupsSkeleton v-else-if="showLoadingState" />

            <div v-else-if="showErrorState" class="pt-3">
              <Notice tone="error" announce data-testid="home-load-error">
                <p>{{ $t("home-error-loading-groups") }}</p>
                <template #action>
                  <SButton variant="outline" size="sm" :loading="isRetrying" @click="retry(refetchGroups)">
                    {{ $t("home-error-retry") }}
                  </SButton>
                </template>
              </Notice>
            </div>
          </Transition>
        </div>
      </div>
    </template>
  </Layout>
</template>
