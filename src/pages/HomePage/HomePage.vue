<script setup lang="ts">
import { PhCheckCircle, PhMagnifyingGlass, PhPlus, PhSlidersHorizontal, PhUsers } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useLocalStorage } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { twMerge } from "tailwind-merge";
import { computed, type ComponentPublicInstance, ref, shallowRef, useTemplateRef, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import EmptyState from "@/components/EmptyState/EmptyState.vue";
import FilterPill from "@/components/FilterPill/FilterPill.vue";
import Layout from "@/components/Layout/Layout.vue";
import AmountChip from "@/components/ListRow/AmountChip.vue";
import { LIST_ROW_CLASS, LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import ListRowContent from "@/components/ListRow/ListRowContent.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { useStatusBarTopColor } from "@/libs/status-bar-color";
import { CONTENT_FADE_IN, useLoadFeedback, type LoadPhase } from "@/libs/use-load-feedback";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import { HOME_SORTS, mostUsedCurrency, settledState, sortGroups, type HomeSort } from "./home-balances";
import {
  HOME_FILTER_EMPTY_LABELS,
  HOME_FILTER_LABELS,
  HOME_FILTERS,
  HOME_SORT_LABELS,
  homeFilter,
  matchesHomeFilter,
  type HomeFilter,
} from "./home-filter";
import HomeAmount from "./HomeAmount.vue";
import HomeEmptyState from "./HomeEmptyState.vue";
import HomeFilterSheet, { type HomeFilterSheetMode } from "./HomeFilterSheet.vue";
import HomeGroupsSkeleton from "./HomeGroupsSkeleton.vue";
import HomeHeader from "./HomeHeader.vue";
import HomeTotalBalance from "./HomeTotalBalance.vue";

useStatusBarTopColor("--comp-home-page-bg");

/**
 * A group row: the shared row with 12px above and below. The row is taller than a transaction row, because a group row
 * is the main item of the page. HomeGroupsSkeleton has the same sizes.
 */
const GROUP_ROW_CLASS = twMerge(LIST_ROW_CLASS, "py-3 focus-visible:outline-offset-2");

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

/** The filter of the list. It stays while the app runs, also when the user opens a group and comes back. */
const filter = homeFilter;
const filterOn = computed(() => filter.value !== "all");

/** The number of groups that each condition shows. The counts ignore the search, like the total balance. */
const filterCounts = computed(() => {
  const counts = {} as Record<HomeFilter, number>;
  for (const option of HOME_FILTERS) {
    counts[option] = groupWithExtraInfo.value.filter((g) => matchesHomeFilter(g.myBalances, option)).length;
  }
  return counts;
});

const visibleGroups = computed(() => {
  const keyword = trimmedKeyword.value.toLowerCase();
  const filtered = groupWithExtraInfo.value.filter(
    (g) => matchesHomeFilter(g.myBalances, filter.value) && (!keyword || g.name.toLowerCase().includes(keyword))
  );
  return sortGroups(filtered, sort.value);
});

// These read the list before the search and the filter. A list with no result must not look like a new user.
const hasGroups = computed(() => groups.value.length > 0);
/** The search finds no group. This state hides the total, because the user looks for one group. */
const showNoResults = computed(
  () => hasGroups.value && trimmedKeyword.value !== "" && visibleGroups.value.length === 0
);
/** The filter alone hides every group. The total and the pills stay, so the user can change the filter. */
const showFilterEmpty = computed(() => hasGroups.value && !showNoResults.value && visibleGroups.value.length === 0);
/** The line that a screen reader reads when the list has no result. */
const noResultStatus = computed(() => {
  if (showNoResults.value) return $t("home-no-results-title", { keyword: trimmedKeyword.value });
  if (showFilterEmpty.value && filter.value !== "all") return $t(HOME_FILTER_EMPTY_LABELS[filter.value]);
  return "";
});

const sheetOpen = shallowRef(false);
const sheetMode = shallowRef<HomeFilterSheetMode>("all");

/** Opens the filter sheet. The search filter button opens the full sheet, and a pill opens the sheet of its kind. */
function openFilterSheet(mode: HomeFilterSheetMode) {
  sheetMode.value = mode;
  sheetOpen.value = true;
}
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

/**
 * Removes a no-result state at once when the list comes back. The Transition has only enter classes, and with no leave
 * hook Vue waits for the CSS of the leaving element before it removes it. Every element has a color transition, so the
 * old state stayed on the screen above the returned rows. A leave hook that takes `done` makes Vue skip that wait.
 */
const leaveAtOnce = (_el: Element, done: () => void) => done();

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
      <HomeHeader v-model="searchKeyword" :filter-count="filterOn ? 1 : 0" @open-filter="openFilterSheet('all')" />
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

        <!-- The sheet renders in a portal, so its place here does not change the layout. -->
        <HomeFilterSheet
          v-model:open="sheetOpen"
          v-model:filter="filter"
          v-model:sort="sort"
          :mode="sheetMode"
          :counts="filterCounts"
        />

        <!-- This element stays in the page, so a screen reader reads the result when the text changes. -->
        <p role="status" class="sr-only">{{ noResultStatus }}</p>
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
                @leave="leaveAtOnce"
              >
                <EmptyState
                  v-if="showNoResults"
                  :icon="PhMagnifyingGlass"
                  :title="$t('home-no-results-title', { keyword: trimmedKeyword })"
                  :description="$t('home-no-results-description')"
                >
                  <template #action>
                    <SButton
                      variant="secondary"
                      size="md"
                      data-testid="home-no-results-clear"
                      @click="searchKeyword = ''"
                    >
                      {{ $t("home-button-clear-search") }}
                    </SButton>
                  </template>
                </EmptyState>
              </Transition>

              <!--
                The total balance does not follow the filter. The list has no title row. While a filter is on, a row of
                pills shows under the total: the sort first, then the filter. Each pill opens the sheet of its kind. The
                row opens to the height of its content, so the list moves down and does not jump.
              -->
              <template v-if="!showNoResults">
                <div class="pb-3">
                  <HomeTotalBalance :totals="userBalances" :common-currency="commonCurrency" />
                </div>
                <div
                  :class="[
                    'grid transition-[grid-template-rows,opacity] duration-container ease-enter',
                    filterOn ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  ]"
                  data-testid="home-filter-pills"
                >
                  <!--
                    The row clips its content while it opens. The padding keeps the tap area and the focus ring of the
                    pills inside the clip.
                  -->
                  <div class="-mx-1 min-h-0 overflow-hidden px-1" :inert="!filterOn">
                    <div class="flex items-center gap-2 py-1.5">
                      <FilterPill
                        caret
                        aria-haspopup="dialog"
                        :aria-label="$t('home-sort-button', { sort: $t(HOME_SORT_LABELS[sort]) })"
                        data-testid="home-sort-pill"
                        @click="openFilterSheet('sort')"
                      >
                        {{ $t(HOME_SORT_LABELS[sort]) }}
                      </FilterPill>
                      <FilterPill
                        caret
                        :selected="filterOn"
                        aria-haspopup="dialog"
                        :aria-label="$t('home-filter-pill', { filter: $t(HOME_FILTER_LABELS[filter]) })"
                        data-testid="home-filter-pill"
                        @click="openFilterSheet('filter')"
                      >
                        {{ $t(HOME_FILTER_LABELS[filter]) }}
                      </FilterPill>
                    </div>
                  </div>
                </div>

                <Transition
                  enter-active-class="transition-opacity duration-state ease-enter"
                  enter-from-class="opacity-0"
                  @leave="leaveAtOnce"
                >
                  <!-- With the unsettled filter, no group means that everything is settled, so the icon is a check. -->
                  <EmptyState
                    v-if="showFilterEmpty && filter !== 'all'"
                    :icon="filter === 'unsettled' ? PhCheckCircle : PhSlidersHorizontal"
                    :title="$t(HOME_FILTER_EMPTY_LABELS[filter])"
                  >
                    <template #action>
                      <SButton
                        variant="secondary"
                        size="md"
                        data-testid="home-no-results-clear"
                        @click="filter = 'all'"
                      >
                        {{ $t("home-button-clear-filter") }}
                      </SButton>
                    </template>
                  </EmptyState>
                </Transition>
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

                    <ListRowContent :title="group.name">
                      <!--
                        Each direction has its own line, also when both fit on one line. The amounts of one
                        direction wrap after the label, and a label or an amount never breaks.
                      -->
                      <template #subtitle>
                        <p
                          v-if="group.myBalancePositive.length > 0"
                          :class="['flex flex-wrap items-center gap-1', LIST_ROW_TEXT.direction]"
                        >
                          <span class="whitespace-nowrap">{{ $t("home-you-lent") }}</span>
                          <AmountChip v-for="balance in group.myBalancePositive" :key="balance.currency" tone="owed">
                            <HomeAmount :amount="balance.amount" :currency="balance.currency" />
                          </AmountChip>
                        </p>
                        <p
                          v-if="group.myBalanceNegative.length > 0"
                          :class="['flex flex-wrap items-center gap-1', LIST_ROW_TEXT.direction]"
                        >
                          <span class="whitespace-nowrap">{{ $t("home-you-owe") }}</span>
                          <AmountChip v-for="balance in group.myBalanceNegative" :key="balance.currency" tone="owes">
                            <HomeAmount :amount="balance.amount" :currency="balance.currency" />
                          </AmountChip>
                        </p>
                        <p v-if="group.settled === 'none'" :class="LIST_ROW_TEXT.subtitle">
                          {{ $t("home-no-expenses") }}
                        </p>
                        <p v-else-if="group.settled === 'all'" :class="LIST_ROW_TEXT.subtitle">
                          {{ $t("home-all-settled-up") }}
                        </p>
                        <p v-else-if="group.settled === 'you'" :class="LIST_ROW_TEXT.subtitle">
                          {{ $t("home-you-are-settled-up") }}
                        </p>
                      </template>
                    </ListRowContent>
                  </RouterLink>
                </li>

                <!--
                  Create Group row. Keeps group creation reachable when the user already has groups. It has no hint
                  under the name: a person who already has groups does not need it. A filtered list does not show it,
                  because it is not a group that matches.
                -->
                <li v-if="!filterOn" key="create-group">
                  <RouterLink
                    :to="{ name: 'createGroup' }"
                    :class="GROUP_ROW_CLASS"
                    data-testid="home-create-group"
                    @click="routerHistoryStore.takeSnapshot()"
                  >
                    <ListRowContent :title="$t('home-button-create-group')">
                      <template #leading>
                        <div
                          class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-base-border-subtle text-base-text-brand"
                        >
                          <PhUsers class="size-5" />
                        </div>
                      </template>
                    </ListRowContent>
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
