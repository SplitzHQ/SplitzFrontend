<script setup lang="ts">
import { PhPlus, PhUsers } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { useLocalStorage } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { twMerge } from "tailwind-merge";
import { computed, type ComponentPublicInstance, ref, useTemplateRef, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { TRANSACTION_ROW_CLASS } from "@/components/TransactionItem/transaction-row";
import { getGroupAvatarImages } from "@/libs/group-avatar";
import { useStatusBarTopColor } from "@/libs/status-bar-color";
import { useLoadFeedback } from "@/libs/use-load-feedback";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import { HOME_SORTS, mostUsedCurrency, settledState, sortGroups, type HomeSort } from "./home-balances";
import HomeAmount from "./HomeAmount.vue";
import HomeEmptyState from "./HomeEmptyState.vue";
import HomeGroupsSkeleton from "./HomeGroupsSkeleton.vue";
import HomeHeader from "./HomeHeader.vue";
import HomeNoResults from "./HomeNoResults.vue";
import HomeSortButton from "./HomeSortButton.vue";
import HomeTotalBalance from "./HomeTotalBalance.vue";

useStatusBarTopColor("--base-bg-secondary_alt");

/** Group list row classes: `TRANSACTION_ROW_CLASS` with taller `py-3` vertical padding matching `HomeGroupsSkeleton`. */
const GROUP_ROW_CLASS = twMerge(TRANSACTION_ROW_CLASS, "py-3 focus-visible:outline-offset-2");

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

const userStore = useUserStore();

const searchKeyword = ref("");

const groupApi = new GroupApi(config);
const queryCache = useQueryCache();
const { asyncStatus: groupsAsyncStatus, state: groupsQuery } = useQuery({
  key: ["getGroups"],
  query: () => groupApi.getGroups(),
});

const groups = computed(() => groupsQuery.value.data ?? []);

// Refresh `userStore` balances whenever `getGroups` refetches after its initial response (`userStore` already fetches
// user info on startup, so skipping the initial `undefined -> data` transition avoids a duplicate request).
watch(
  () => groupsQuery.value.data,
  (_data, previous) => {
    if (previous) void userStore.fetchUserInfo();
  }
);

const groupsWithBalanceSummary = computed(() =>
  groups.value.map((group) => {
    const myBalances = group.balances
      .filter((entry) => entry.user.id === userStore.user?.id)
      .map((entry) => ({
        ...entry,
        amount: Number.parseFloat(entry.balance),
      }));
    const owedByMeBalances = myBalances.filter((entry) => entry.amount < 0);
    const owedToMeBalances = myBalances.filter((entry) => entry.amount > 0);
    const settled = settledState(group.transactionCount, myBalances, group.balances);
    return { ...group, myBalances, owedByMeBalances, owedToMeBalances, settled };
  })
);

const trimmedKeyword = computed(() => searchKeyword.value.trim());

/** Persisted sort key in `localStorage`; unknown or retired sort names safely fall back to `"recent"`. */
const storedSort = useLocalStorage<string>("home-group-sort", "recent");
const selectedSort = computed<HomeSort>({
  get: () => HOME_SORTS.find((option) => option === storedSort.value) ?? "recent",
  set: (nextSort) => (storedSort.value = nextSort),
});
/** Most frequent open-balance currency across groups, shared by `HomeTotalBalance` and `"amount"` sorting. */
const primaryCurrency = computed(() => mostUsedCurrency(sortGroups(groupsWithBalanceSummary.value, "recent")));

const visibleGroups = computed(() => {
  const keyword = trimmedKeyword.value.toLowerCase();
  const matchingGroups = keyword
    ? groupsWithBalanceSummary.value.filter((group) => group.name.toLowerCase().includes(keyword))
    : groupsWithBalanceSummary.value;
  return sortGroups(matchingGroups, selectedSort.value);
});

// Check `groups` before search filtering so an empty search match renders `HomeNoResults` instead of `HomeEmptyState`.
const hasGroups = computed(() => groups.value.length > 0);
const showNoResults = computed(() => hasGroups.value && visibleGroups.value.length === 0);
const showEmptyState = computed(() => groupsQuery.value.status === "success" && !hasGroups.value);
const showLoadingState = computed(() => groupsQuery.value.status === "pending");
// Preserve cached group rows on background refresh failures rather than replacing the list with an error notice.
const showErrorState = computed(() => groupsQuery.value.status === "error" && !hasGroups.value);
const isRetrying = computed(() => showErrorState.value && groupsAsyncStatus.value === "loading");

const content = useTemplateRef<HTMLElement>("content");
const { announcement, retry } = useLoadFeedback({
  content,
  messages: {
    failed: () => $t("home-error-loading-groups"),
    loaded: () => $t("home-status-loaded"),
    loading: () => $t("home-status-loading"),
  },
  phase: () => (showLoadingState.value || isRetrying.value ? "loading" : showErrorState.value ? "failed" : "ready"),
});

const groupList = useTemplateRef<ComponentPublicInstance>("groupList");
/** Pre-update `offsetTop` per `groupId` so simultaneously leaving rows stay pinned instead of collapsing to `top: 0`. */
const rowOffsetTopByGroupId = new Map<string, number>();

watch(
  visibleGroups,
  () => {
    rowOffsetTopByGroupId.clear();
    const rowElements = (groupList.value?.$el as HTMLElement | undefined)?.children ?? [];
    for (const row of rowElements) {
      const { groupId } = (row as HTMLElement).dataset;
      if (groupId) rowOffsetTopByGroupId.set(groupId, (row as HTMLElement).offsetTop);
    }
  },
  { flush: "pre" }
);

/** Pins a leaving `<li>` (`position: absolute`) to its pre-removal vertical offset during fade-out. */
const pinLeavingRow = (row: Element) => {
  const element = row as HTMLElement;
  element.style.top = `${rowOffsetTopByGroupId.get(element.dataset.groupId ?? "") ?? element.offsetTop}px`;
};

const addExpense = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "newExpense" });
};

const createGroup = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "createGroup" });
};

const currencyTotals = computed(() => {
  const totalsByCurrency = new Map<string, { amount: number; currency: string }>();
  for (const userBalance of userStore.user?.balances ?? []) {
    const existing = totalsByCurrency.get(userBalance.currency);
    if (existing) {
      existing.amount += Number.parseFloat(userBalance.balance);
    } else {
      totalsByCurrency.set(userBalance.currency, {
        amount: Number.parseFloat(userBalance.balance),
        currency: userBalance.currency,
      });
    }
  }
  return [...totalsByCurrency.values()];
});
</script>

<template>
  <Layout>
    <template #header>
      <HomeHeader v-model="searchKeyword" />
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

        <p role="status" class="sr-only">
          {{ showNoResults ? $t("home-no-results-title", { keyword: trimmedKeyword }) : "" }}
        </p>
        <p role="status" class="sr-only">{{ announcement }}</p>

        <!-- Focus fallback target when a successful retry unmounts the focused retry button. -->
        <div ref="content" tabindex="-1" class="outline-none">
          <Transition
            enter-active-class="transition-opacity duration-state ease-enter"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
          >
            <!--
              `pb-28` clears the floating `+` button; `pt-4` above and `pb-3` below `HomeTotalBalance` optically center
              spacing against the 32px-tall `HomeSortButton` row.
            -->
            <div v-if="hasGroups" class="flex flex-col pb-28" :class="showNoResults ? 'gap-1 pt-3' : 'pt-4'">
              <Transition
                enter-active-class="transition-opacity duration-state ease-enter"
                enter-from-class="opacity-0"
              >
                <HomeNoResults v-if="showNoResults" :keyword="trimmedKeyword" @clear="searchKeyword = ''" />
              </Transition>

              <template v-if="!showNoResults">
                <div class="pb-3">
                  <HomeTotalBalance :totals="currencyTotals" :common-currency="primaryCurrency" />
                </div>
                <div class="flex min-h-8 items-center">
                  <HomeSortButton v-model="selectedSort" />
                </div>
              </template>

              <TransitionGroup ref="groupList" tag="ul" name="group-row" class="relative" @before-leave="pinLeavingRow">
                <li v-for="group in visibleGroups" :key="group.groupId" :data-group-id="group.groupId">
                  <RouterLink
                    :to="{ name: 'groupDetail', params: { groupId: group.groupId } }"
                    :class="GROUP_ROW_CLASS"
                  >
                    <Avatar size="sm" :images="getGroupAvatarImages(group)" aria-hidden="true" />

                    <div class="min-w-0 flex-1">
                      <p class="truncate text-base font-semibold text-base-text-primary">
                        {{ group.name }}
                      </p>

                      <!--
                        Place owed-to-you and owed-by-you balances on separate lines with subtle status pills so green
                        and red amounts stay visually distinct from the primary group name without breaking mid-token.
                      -->
                      <div class="mt-0.5 flex flex-col gap-0.5 text-sm font-medium">
                        <p v-if="group.owedToMeBalances.length > 0" class="flex flex-wrap items-center gap-1">
                          <span class="whitespace-nowrap text-base-text-quaternary">{{ $t("home-you-lent") }}</span>
                          <span
                            v-for="balance in group.owedToMeBalances"
                            :key="balance.currency"
                            class="rounded-md bg-base-bg-success-subtle px-1 whitespace-nowrap text-base-text-success"
                          >
                            <HomeAmount :amount="balance.amount" :currency="balance.currency" />
                          </span>
                        </p>
                        <p v-if="group.owedByMeBalances.length > 0" class="flex flex-wrap items-center gap-1">
                          <span class="whitespace-nowrap text-base-text-quaternary">{{ $t("home-you-owe") }}</span>
                          <span
                            v-for="balance in group.owedByMeBalances"
                            :key="balance.currency"
                            class="rounded-md bg-base-bg-error px-1 whitespace-nowrap text-base-text-error"
                          >
                            <HomeAmount :amount="balance.amount" :currency="balance.currency" />
                          </span>
                        </p>
                        <span v-if="group.settled === 'none'" class="text-base-text-quaternary">
                          {{ $t("home-no-expenses") }}
                        </span>
                        <span v-else-if="group.settled === 'all'" class="text-base-text-quaternary">
                          {{ $t("home-all-settled-up") }}
                        </span>
                        <span v-else-if="group.settled === 'you'" class="text-base-text-quaternary">
                          {{ $t("home-you-are-settled-up") }}
                        </span>
                      </div>
                    </div>
                  </RouterLink>
                </li>

                <!-- Trailing Create group row keeps group creation accessible once `HomeEmptyState` is no longer shown. -->
                <li key="create-group">
                  <RouterLink
                    :to="{ name: 'createGroup' }"
                    :class="GROUP_ROW_CLASS"
                    data-testid="home-create-group"
                    @click="routerHistoryStore.takeSnapshot()"
                  >
                    <div
                      class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-base-border-secondary text-util-color-brand-700"
                    >
                      <PhUsers class="size-5" />
                    </div>
                    <p class="min-w-0 flex-1 truncate text-base font-semibold text-base-text-primary">
                      {{ $t("home-button-create-group") }}
                    </p>
                  </RouterLink>
                </li>
              </TransitionGroup>
            </div>

            <div v-else-if="showEmptyState">
              <HomeEmptyState @add-expense="addExpense" @create-group="createGroup" />
            </div>

            <HomeGroupsSkeleton v-else-if="showLoadingState" />

            <div v-else-if="showErrorState" class="pt-3">
              <Notice tone="error" announce data-testid="home-load-error">
                <p>{{ $t("home-error-loading-groups") }}</p>
                <template #action>
                  <SButton
                    variant="outline"
                    size="sm"
                    :loading="isRetrying"
                    @click="retry(() => queryCache.invalidateQueries({ exact: true, key: ['getGroups'] }))"
                  >
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

<style scoped>
/* Leaving rows fade out in place without horizontal slide so rapid search typing stays calm. */
.group-row-move {
  transition: transform var(--motion-duration-container) var(--motion-easing-standard);
}

.group-row-enter-active {
  transition:
    opacity var(--motion-duration-state) var(--motion-easing-enter),
    transform var(--motion-duration-state) var(--motion-easing-enter);
}

.group-row-leave-active {
  position: absolute;
  width: 100%;
  pointer-events: none;
  transition: opacity var(--motion-duration-exit) var(--motion-easing-exit);
}

.group-row-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.group-row-leave-to {
  opacity: 0;
}
</style>
