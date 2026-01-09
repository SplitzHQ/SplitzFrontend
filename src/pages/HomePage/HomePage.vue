<script setup lang="ts">
import { PhArrowsDownUp, PhCheckCircle, PhPlus, PhUsers } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { AccountApi, GroupApi } from "@/backend";
import config from "@/backend/config";
import type { GroupDto } from "@/backend/openapi/models";
import Avatar from "@/components/Avatar/Avatar.vue";
import DebugButton from "@/components/DebugButton/DebugButton.vue";
import HomeHeader from "@/components/Header/HomeHeader.vue";
import Layout from "@/components/Layout/Layout.vue";
import PendingItems, { type PendingItem } from "@/components/PendingItems/PendingItems.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";

import EmptyStateBackground from "./EmptyStateBackground.vue";

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

// Fetch data
const accountApi = new AccountApi(config);
const groupApi = new GroupApi(config);
const { state: userInfo } = useQuery({ key: ["getUserInfo"], query: () => accountApi.getUserInfo() });
const { state: groups } = useQuery({ key: ["getGroups"], query: () => groupApi.getGroups() });

const searchKeyword = ref("");

// Calculate balance for each group
const groupsWithBalance = computed(() => {
  if (!groups.value.data || !userInfo.value.data) return [];
  const userId = userInfo.value.data.id;

  return groups.value.data.map((group) => {
    let owe = 0; // Amount user owes (positive number)
    let lent = 0; // Amount user lent (positive number)

    group.balances.forEach((balance) => {
      // balance.balance is a string, convert to number
      const balanceAmount = Number.parseFloat(balance.balance) || 0;

      if (balance.user.id === userId) {
        // This balance entry is for the current user
        if (balanceAmount > 0) {
          owe += balanceAmount;
        } else if (balanceAmount < 0) {
          lent += Math.abs(balanceAmount);
        }
      }
      // Note: GroupBalanceDto only has 'user' property, not 'friendUser'
      // The balance represents the user's balance in this group
    });

    return {
      ...group,
      owe,
      lent,
      isSettled: owe === 0 && lent === 0
    };
  });
});

// Filter and sort groups
const filteredGroups = computed(() => {
  let result = [...groupsWithBalance.value];

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter((group) => group.name.toLowerCase().includes(keyword));
  }

  // Sort by last activity time
  result.sort((a, b) => b.lastActivityTime.getTime() - a.lastActivityTime.getTime());

  return result;
});

// Calculate total balance
const totalBalance = computed(() => {
  let totalOwe = 0;
  let totalLent = 0;

  groupsWithBalance.value.forEach((group) => {
    totalOwe += group.owe;
    totalLent += group.lent;
  });

  return {
    owe: totalOwe,
    lent: totalLent
  };
});

// Format amount as currency
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Get group display name
const getGroupDisplayName = (group: GroupDto) => {
  if (group.name) return group.name;
  if (group.members.length <= 4) {
    return group.members.map((m) => m.userName).join(", ");
  }
  return `${group.members
    .slice(0, 3)
    .map((m) => m.userName)
    .join(", ")} +${String(group.members.length - 3)}`;
};

// Get group avatar images
const getGroupAvatarImages = (group: GroupDto) => {
  if (group.photo) {
    return [{ src: group.photo, alt: group.name || "Group" }];
  }
  return group.members.map((member) => ({
    src: member.photo,
    alt: member.userName
  }));
};

// Pending items (using placeholder data for now)
const pendingItems = ref<PendingItem[]>([
  {
    id: "1",
    type: "settle-up",
    userName: "Sarah",
    userPhoto: null,
    amount: 827.29,
    message: "Settled the balance with you for ",
    actionButtonText: "View and Confirm",
    currentIndex: 1,
    totalCount: 3
  },
  {
    id: "2",
    type: "draft",
    draftCount: 4,
    draftMessage: "You have 4 draft expenses pending completion. Complete them now before you forget.",
    actionButtonText: "Complete",
    currentIndex: 2,
    totalCount: 3
  },
  {
    id: "3",
    type: "placeholder",
    placeholderText:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.",
    actionButtonText: "Action",
    currentIndex: 3,
    totalCount: 3
  }
]);

// Check if should show empty state
const debugForceEmptyState = ref(false);
const isEmptyState = computed(() => {
  if (debugForceEmptyState.value) return true;
  if (groups.value.status !== "success") return false;
  // When status is "success", data is guaranteed to exist, but may be empty array
  return groups.value.data.length === 0;
});

const addExpense = () => {
  routerHistoryStore.addParentHistory(router.currentRoute.value.path);
  void router.push({ name: "newExpense" });
};

const createGroup = () => {
  routerHistoryStore.addParentHistory(router.currentRoute.value.path);
  void router.push({ name: "createGroup" });
};

const navigateToGroup = (groupId: string) => {
  // TODO: Navigate to group detail page
  // eslint-disable-next-line no-console
  console.log("Navigate to group", groupId);
};

// Track scroll container and preserve scroll position
const scrollContainerRef = ref<HTMLElement | null>(null);
let scrollPosition = 0;

// Save scroll position handler
const handleScroll = () => {
  if (scrollContainerRef.value) {
    scrollPosition = scrollContainerRef.value.scrollTop;
  }
};

// Restore scroll position after updates
const restoreScrollPosition = async () => {
  await nextTick();
  if (scrollContainerRef.value && scrollPosition > 0) {
    // Use requestAnimationFrame to ensure DOM is fully updated
    requestAnimationFrame(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.scrollTop = scrollPosition;
      }
    });
  }
};

// Watch for data changes and preserve scroll position
watch(
  () => [groups.value.status, filteredGroups.value.length],
  async () => {
    // Save current scroll position before data changes
    if (scrollContainerRef.value) {
      scrollPosition = scrollContainerRef.value.scrollTop;
    }
    // Restore scroll position after data updates
    if (scrollPosition > 0) {
      await restoreScrollPosition();
    }
  },
  { flush: "post" }
);

// Set up scroll listener
onMounted(() => {
  // Use nextTick to ensure ref is available
  void nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.addEventListener("scroll", handleScroll, { passive: true });
    }
  });
});

onBeforeUnmount(() => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.removeEventListener("scroll", handleScroll);
  }
});
</script>

<template>
  <Layout>
    <template #header>
      <HomeHeader v-model:search-keyword="searchKeyword" />
    </template>

    <template #default="layoutAttrs">
      <!-- Interface when there is data -->
      <div
        v-if="!isEmptyState"
        ref="scrollContainerRef"
        v-bind="layoutAttrs"
        class="flex flex-1 flex-col items-start gap-4 overflow-x-clip overflow-y-auto px-4 py-4"
      >
        <!-- Pending Items Section -->
        <PendingItems :items="pendingItems" @view="(id) => console.log('View pending item:', id)" />

        <!-- All Groups Section -->
        <div class="relative flex w-full shrink-0 flex-col items-start gap-1">
          <!-- Section Header -->
          <div class="relative flex w-full shrink-0 items-center justify-between px-1 py-0">
            <p class="relative shrink-0 text-sm leading-5 font-semibold text-base-text-quaternary">All Groups</p>
            <div class="relative flex shrink-0 items-center gap-1">
              <PhArrowsDownUp class="size-4 text-base-text-quinary" />
              <p class="relative shrink-0 text-sm leading-5 font-medium text-base-text-quinary">Lent</p>
              <p class="relative shrink-0 text-sm leading-5 font-medium text-util-color-success-600">
                {{ formatAmount(totalBalance.lent) }}
              </p>
              <p class="relative shrink-0 text-sm leading-5 font-medium text-base-text-quinary">Owe</p>
              <p class="relative shrink-0 text-sm leading-5 font-medium text-base-text-error">
                {{ formatAmount(totalBalance.owe) }}
              </p>
            </div>
          </div>

          <!-- Group List -->
          <div v-if="groups.status === 'pending'" class="flex w-full flex-col items-start gap-3 py-4">
            <div v-for="i in 3" :key="i" class="flex w-full items-center gap-3">
              <div class="h-16 w-16 skeleton rounded-2xl" />
              <div class="flex flex-1 flex-col gap-1">
                <div class="h-4 w-32 skeleton rounded" />
                <div class="h-3 w-24 skeleton rounded" />
              </div>
            </div>
          </div>

          <div v-else-if="groups.status === 'success'" class="relative flex w-full shrink-0 flex-col items-start">
            <button
              v-for="group in filteredGroups"
              :key="group.groupId"
              type="button"
              class="relative flex w-full shrink-0 items-center gap-3 rounded-lg px-0 py-2 transition-colors hover:bg-base-bg-active"
              @click="() => navigateToGroup(group.groupId)"
            >
              <!-- Avatar -->
              <Avatar :images="getGroupAvatarImages(group)" size="lg" />

              <!-- Group Info -->
              <div class="relative flex min-h-0 min-w-0 flex-1 shrink-0 flex-col items-start justify-center gap-1">
                <p
                  class="relative min-w-full shrink-0 overflow-hidden text-left text-base leading-6 font-semibold overflow-ellipsis whitespace-nowrap text-base-text-primary"
                >
                  {{ getGroupDisplayName(group) }}
                </p>
                <div class="relative flex shrink-0 items-end gap-1 text-sm leading-5 font-medium">
                  <!-- All Settled -->
                  <template v-if="group.isSettled">
                    <p class="relative shrink-0 text-core-alpha-brand-80">All settled up</p>
                    <PhCheckCircle class="size-4 shrink-0 text-core-alpha-brand-80" />
                  </template>
                  <!-- You Settled / Lent Only -->
                  <template v-else-if="group.owe === 0 && group.lent > 0">
                    <p class="relative shrink-0 text-base-text-quinary">You lent</p>
                    <p class="relative shrink-0 text-util-color-success-600">{{ formatAmount(group.lent) }}</p>
                  </template>
                  <!-- Owe Only -->
                  <template v-else-if="group.owe > 0 && group.lent === 0">
                    <p class="relative shrink-0 text-base-text-quinary">You owe</p>
                    <p class="relative shrink-0 text-base-text-error">{{ formatAmount(group.owe) }}</p>
                  </template>
                  <!-- Both Owe and Lent -->
                  <template v-else>
                    <p class="relative shrink-0 text-base-text-quinary">You owe</p>
                    <p class="relative shrink-0 text-base-text-error">{{ formatAmount(group.owe) }}</p>
                    <p class="relative shrink-0 text-base-text-quinary">, lent</p>
                    <p class="relative shrink-0 text-util-color-success-600">{{ formatAmount(group.lent) }}</p>
                  </template>
                </div>
              </div>
            </button>

            <!-- Empty State -->
            <div
              v-if="filteredGroups.length === 0"
              class="flex w-full flex-col items-center justify-center gap-3 py-12"
            >
              <p class="text-center text-base text-base-text-tertiary">No groups found</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="relative flex w-full shrink-0 items-start gap-3 px-3 py-0">
          <SButton variant="outline" color="brand" size="xxl" class="flex-1" @click="createGroup">
            <template #icon-left>
              <PhUsers />
            </template>
            Create Group
          </SButton>
        </div>

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
      </div>

      <!-- Empty state interface -->
      <div
        v-else
        v-bind="layoutAttrs"
        class="flex flex-1 flex-col items-center gap-12 overflow-x-clip overflow-y-auto px-4 py-16"
      >
        <!-- Floating Action Button (always visible in empty state) -->
        <SIconButton
          variant="primary"
          color="brand"
          size="xxl"
          class="fixed right-5 bottom-12 z-10"
          @click="addExpense"
        >
          <PhPlus />
        </SIconButton>

        <!-- Empty State Icon -->
        <EmptyStateBackground class="-mb-20" />

        <!-- Empty State Text -->
        <div class="flex w-full flex-col items-center gap-2 px-8 py-0 text-center leading-none">
          <h2 class="flex w-full flex-col justify-center text-display-xs font-medium text-base-text-primary">
            {{ $t("home-empty-state-title") }}
          </h2>
          <p class="flex w-full flex-col justify-center text-base font-normal text-base-text-tertiary">
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
  </Layout>

  <!-- Debug Button -->
  <DebugButton
    :label="debugForceEmptyState ? 'Show Data' : 'Show Empty State'"
    @click="debugForceEmptyState = !debugForceEmptyState"
  />
</template>
