<script setup lang="ts">
import { PhArrowsDownUp, PhList, PhPlus, PhSlidersHorizontal, PhUsers } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { type GroupDto, GroupApi } from "@/backend";
import config from "@/backend/config";
import ArchivedSection from "@/components/ArchivedSection/ArchivedSection.vue";
import Layout from "@/components/Layout/Layout.vue";
import AvatarMenu from "@/components/Notification/AvatarMenu.vue";
import NotificationBell from "@/components/Notification/NotificationBell.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { partitionArchived } from "@/libs/archive";
import { formatCurrency } from "@/libs/format-currency";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import GroupListItem from "./GroupListItem.vue";
import HomeEmptyState from "./HomeEmptyState.vue";
import HomeSearchBar from "./HomeSearchBar.vue";

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

const userStore = useUserStore();

const searchKeyword = ref("");

const groupApi = new GroupApi(config);
// Archived groups load too, so the page can show how many are hidden. The key keeps the
// ["getGroups"] prefix, so existing invalidations also refresh this query.
const { state: groupsQuery } = useQuery({
  key: ["getGroups", { includeArchived: true }],
  query: () => groupApi.getGroups({ includeArchived: true }),
});

const groups = computed(() => partitionArchived(groupsQuery.value.data ?? []));

/** Keep groups that match the search keyword, most recently active first. */
function filterAndSort(list: GroupDto[]): GroupDto[] {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const filtered = keyword ? list.filter((g) => g.name.toLowerCase().includes(keyword)) : list;
  return [...filtered].sort((a, b) => b.lastActivityTime.getTime() - a.lastActivityTime.getTime());
}

const visibleGroups = computed(() => filterAndSort(groups.value.active));
const visibleArchivedGroups = computed(() => filterAndSort(groups.value.archived));

const hasGroups = computed(() => visibleGroups.value.length > 0 || visibleArchivedGroups.value.length > 0);
const showEmptyState = computed(() => groupsQuery.value.status === "success" && !hasGroups.value);
const showLoadingState = computed(() => groupsQuery.value.status === "pending");
const showErrorState = computed(() => groupsQuery.value.status === "error");

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
      <div class="flex flex-col gap-3 border-b border-base-border-quaternary bg-base-bg-secondary_alt px-4 pt-4 pb-4">
        <!-- Header -->
        <div class="flex w-full items-center justify-between">
          <div class="flex items-center gap-2.5">
            <SIconButton variant="ghost" size="md" :aria-label="$t('home-menu')">
              <PhList class="text-util-color-brand-700" />
            </SIconButton>
            <h1 class="text-lg font-bold text-util-color-brand-700">Splitz</h1>
          </div>
          <div class="flex items-center gap-2.5">
            <NotificationBell />
            <AvatarMenu />
          </div>
        </div>

        <!-- Search Bar -->
        <div class="flex w-full items-start gap-2.5">
          <HomeSearchBar v-model="searchKeyword" class="flex-1" />
          <SIconButton variant="secondary" size="md" :aria-label="$t('home-filter')">
            <PhSlidersHorizontal />
          </SIconButton>
        </div>
      </div>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs">
        <!-- Floating Action Button -->
        <SIconButton
          variant="primary"
          size="xl"
          class="fixed right-5 bottom-12 z-10"
          :aria-label="$t('home-button-record-expense')"
          @click="addExpense"
        >
          <PhPlus />
        </SIconButton>

        <div v-if="hasGroups" class="flex flex-col gap-1 pt-3 pb-4">
          <!-- Section Header -->
          <div class="flex items-center justify-between px-1">
            <p class="text-sm font-semibold text-base-text-quaternary">{{ $t("home-all-groups") }}</p>
            <div v-if="userBalances.length > 0" class="flex items-center gap-1 text-sm font-medium">
              <PhArrowsDownUp class="icon-4 text-base-text-quinary" />
              <span class="text-base-text-quinary">{{ $t("home-total-balance") }}</span>
              <template v-for="userBalance in userBalances" :key="userBalance.currency">
                <span v-if="userBalance.amount > 0" class="text-util-color-success-600">
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
            <GroupListItem v-for="group in visibleGroups" :key="group.groupId" :group="group" />

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

          <!-- Archived groups, hidden until the user opens them -->
          <ArchivedSection :count="visibleArchivedGroups.length">
            <div class="flex flex-col gap-1">
              <p class="px-1 text-sm font-semibold text-base-text-quaternary">{{ $t("home-archived-groups") }}</p>
              <div class="flex flex-col">
                <GroupListItem v-for="group in visibleArchivedGroups" :key="group.groupId" :group="group" />
              </div>
            </div>
          </ArchivedSection>
        </div>

        <template v-else-if="showEmptyState">
          <HomeEmptyState @add-expense="addExpense" @create-group="createGroup" />
        </template>

        <div v-else-if="showLoadingState" class="px-4 pt-6 text-base text-base-text-tertiary">
          {{ $t("home-loading") }}
        </div>

        <div v-else-if="showErrorState" class="px-4 pt-6 text-base text-base-text-error">
          {{ $t("home-error-loading-groups") }}
        </div>
      </div>
    </template>
  </Layout>
</template>
