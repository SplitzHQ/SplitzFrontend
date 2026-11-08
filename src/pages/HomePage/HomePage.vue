<script setup lang="ts">
import { PhPlus, PhUsers } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
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
import { useStatusBarTopColor } from "@/libs/status-bar-color";
import { CONTENT_FADE_IN, useLoadFeedback, type LoadPhase } from "@/libs/use-load-feedback";
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

/**
 * A group row: the shared row with 12px above and below. The row is taller than a transaction row, because a group row
 * is the main item of the page. HomeGroupsSkeleton has the same sizes.
 */
const GROUP_ROW_CLASS = twMerge(TRANSACTION_ROW_CLASS, "py-3 focus-visible:outline-offset-2");

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

// The total balance comes from the user, not from the groups. A refetch of the groups means that the balances can have
// changed, so the total reloads too. The first answer does not count, because the store loads the user at its start.
watch(
  () => groupsQuery.value.data,
  (_data, previous) => {
    if (previous) void userStore.fetchUserInfo();
  }
);

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
    const settled = settledState(group.transactionCount, myBalances, group.balances);
    return { ...group, myBalanceNegative, myBalancePositive, myBalances, settled };
  });
});

const trimmedKeyword = computed(() => searchKeyword.value.trim());

/** The sort that the user picked. This device keeps it. A value that is not a sort, for example an old one, is ignored. */
const storedSort = useLocalStorage<string>("home-group-sort", "recent");
/** The sort of the group list. The default puts the most recent group first. */
const sort = computed<HomeSort>({
  get: () => HOME_SORTS.find((option) => option === storedSort.value) ?? "recent",
  set: (next) => (storedSort.value = next),
});
/** The currency that the most groups use. The total balance row and the amount sort use it. */
const commonCurrency = computed(() => mostUsedCurrency(sortGroups(groupWithExtraInfo.value, "recent")));

const visibleGroups = computed(() => {
  const keyword = trimmedKeyword.value.toLowerCase();
  const filtered = keyword
    ? groupWithExtraInfo.value.filter((g) => g.name.toLowerCase().includes(keyword))
    : groupWithExtraInfo.value;
  return sortGroups(filtered, sort.value);
});

// These two read the list before the search filter. A search with no result must not look like a new user.
const hasGroups = computed(() => groups.value.length > 0);
const showNoResults = computed(() => hasGroups.value && visibleGroups.value.length === 0);
const showEmptyState = computed(() => groupsQuery.value.status === "success" && !hasGroups.value);
const showLoadingState = computed(() => groupsQuery.value.status === "pending");
/** The empty state offers Record new expense only with a friend, because the next page lists only groups and friends. */
const hasFriends = computed(() => (userStore.user?.friends?.length ?? 0) > 0);
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

const groupList = useTemplateRef<ComponentPublicInstance>("groupList");
/** The top of each group row just before the list changes, by group id. */
const rowTops = new Map<string, number>();

// A leaving row has `position: absolute`. Without a `top`, the rows that leave together stack at one place, because
// each one takes the others out of the flow. So the positions come from before the change.
watch(
  visibleGroups,
  () => {
    rowTops.clear();
    const rows = (groupList.value?.$el as HTMLElement | undefined)?.children ?? [];
    for (const row of rows) {
      const { groupId } = (row as HTMLElement).dataset;
      if (groupId) rowTops.set(groupId, (row as HTMLElement).offsetTop);
    }
  },
  { flush: "pre" }
);

/** Keeps a leaving group row where it was. */
const pinLeavingRow = (row: Element) => {
  const element = row as HTMLElement;
  element.style.top = `${rowTops.get(element.dataset.groupId ?? "") ?? element.offsetTop}px`;
};

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
      <HomeHeader v-model="searchKeyword" />
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col">
        <!--
          The floating button records an expense. A person with no groups does not get it: the empty state has its own
          main button, and with no friends the next page has nobody to pick. The button shows during the first load, so
          it does not appear late for a person who has groups. It fades out when the load finds no group.
        -->
        <Transition
          enter-active-class="transition-opacity duration-state ease-enter"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-exit ease-exit"
          leave-to-class="opacity-0"
        >
          <SIconButton
            v-if="!showEmptyState"
            variant="primary"
            size="xl"
            class="fixed right-safe-5 bottom-safe-12 z-10"
            :aria-label="$t('home-button-record-expense')"
            @click="addExpense"
          >
            <PhPlus />
          </SIconButton>
        </Transition>

        <!-- This element stays in the page, so a screen reader reads the result when the text changes. -->
        <p role="status" class="sr-only">
          {{ showNoResults ? $t("home-no-results-title", { keyword: trimmedKeyword }) : "" }}
        </p>
        <p role="status" class="sr-only">{{ announcement }}</p>

        <!--
          A successful retry removes the button that had the focus, so the focus moves to this block. The block grows to
          the bottom of the page, so the empty state can place its content in the free space.
        -->
        <div ref="content" tabindex="-1" class="flex grow flex-col outline-none">
          <Transition v-bind="CONTENT_FADE_IN">
            <!--
              The bottom space keeps the last row above the plus button. 16px above the total and 12px under it: the
              title row is 32px high with its text in the middle, so the eye sees about the same space on each side.
            -->
            <div v-if="hasGroups" class="flex flex-col pb-28" :class="showNoResults ? 'gap-1 pt-3' : 'pt-4'">
              <Transition
                enter-active-class="transition-opacity duration-state ease-enter"
                enter-from-class="opacity-0"
              >
                <HomeNoResults v-if="showNoResults" :keyword="trimmedKeyword" @clear="searchKeyword = ''" />
              </Transition>

              <!-- The total balance and the list title. The sort button is the title. -->
              <template v-if="!showNoResults">
                <div class="pb-3">
                  <HomeTotalBalance :totals="userBalances" :common-currency="commonCurrency" />
                </div>
                <div class="flex min-h-8 items-center">
                  <HomeSortButton v-model="sort" />
                </div>
              </template>

              <!-- Group List -->
              <TransitionGroup ref="groupList" tag="ul" name="group-row" class="relative" @before-leave="pinLeavingRow">
                <li v-for="group in visibleGroups" :key="group.groupId" :data-group-id="group.groupId">
                  <RouterLink
                    :to="{ name: 'groupDetail', params: { groupId: group.groupId } }"
                    :class="GROUP_ROW_CLASS"
                  >
                    <Avatar
                      v-if="group.photo"
                      size="sm"
                      :images="[{ src: group.photo, alt: group.name }]"
                      aria-hidden="true"
                    />
                    <Avatar
                      v-else
                      size="sm"
                      :images="group.members.slice(0, 4).map((m) => ({ src: m.photo ?? null, alt: m.userName }))"
                      aria-hidden="true"
                    />

                    <div class="min-w-0 flex-1">
                      <p class="truncate text-base font-semibold text-base-text-primary">
                        {{ group.name }}
                      </p>

                      <!--
                        The labels and the settled text share one neutral color. A tinted fill behind each amount keeps the
                        dark green and red apart from the black name.
                        Each direction has its own line, also when both fit on one line. The amounts of one
                        direction wrap after the label, and a label or an amount never breaks.
                      -->
                      <div class="mt-0.5 flex flex-col gap-0.5 text-sm font-medium">
                        <p v-if="group.myBalancePositive.length > 0" class="flex flex-wrap items-center gap-1">
                          <span class="whitespace-nowrap text-base-text-quaternary">{{ $t("home-you-lent") }}</span>
                          <span
                            v-for="balance in group.myBalancePositive"
                            :key="balance.currency"
                            class="rounded-md bg-base-bg-success-subtle px-1 whitespace-nowrap text-base-text-success"
                          >
                            <HomeAmount :amount="balance.amount" :currency="balance.currency" />
                          </span>
                        </p>
                        <p v-if="group.myBalanceNegative.length > 0" class="flex flex-wrap items-center gap-1">
                          <span class="whitespace-nowrap text-base-text-quaternary">{{ $t("home-you-owe") }}</span>
                          <span
                            v-for="balance in group.myBalanceNegative"
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

                <!--
                  Create Group row. Keeps group creation reachable when the user already has groups. It has no hint
                  under the name: a person who already has groups does not need it.
                -->
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

            <HomeEmptyState
              v-else-if="showEmptyState"
              :has-friends="hasFriends"
              @add-expense="addExpense"
              @create-group="createGroup"
            />

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

<style scoped>
/* Each key press can change the list, so a row that leaves only fades. It does not slide away. */
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
