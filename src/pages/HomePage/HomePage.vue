<script setup lang="ts">
import { PhArrowsDownUp, PhCaretUp, PhCheckCircle, PhPlus, PhUsers } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { AccountApi, GroupApi } from "@/backend";
import config from "@/backend/config";
import type { GroupDto } from "@/backend/openapi/models";
import Avatar from "@/components/Avatar/Avatar.vue";
import DebugButton from "@/components/DebugButton/DebugButton.vue";
import FloatingActionButton from "@/components/FloatingActionButton/FloatingActionButton.vue";
import HomeHeader from "@/components/Header/HomeHeader.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";

import EmptyStateBackground from "./EmptyStateBackground.vue";

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

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
      if (balance.user.id === userId) {
        // User is the debtor
        if (balance.balance > 0) {
          owe += balance.balance;
        } else {
          lent += Math.abs(balance.balance);
        }
      } else if (balance.friendUser.id === userId) {
        // User is the creditor
        if (balance.balance > 0) {
          lent += balance.balance;
        } else {
          owe += Math.abs(balance.balance);
        }
      }
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

// Pending items count (using placeholder data for now)
const pendingItemsCount = ref(3);

// Check if should show empty state
const debugForceEmptyState = ref(false);
const isEmptyState = computed(() => {
  if (debugForceEmptyState.value) return true;
  if (groups.value.status !== "success") return false;
  // When status is "success", data is guaranteed to exist, but may be empty array
  return groups.value.data.length === 0;
});

const addExpense = () => {
  routerHistoryStore.clearParentHistory();
  routerHistoryStore.addParentHistory("/");
  void router.push("/new-expense");
};

const createGroup = () => {
  // TODO: Implement create group navigation
  // eslint-disable-next-line no-console
  console.log("Create group");
};

const navigateToGroup = (groupId: string) => {
  // TODO: Navigate to group detail page
  // eslint-disable-next-line no-console
  console.log("Navigate to group", groupId);
};

// Track action buttons element for floating button visibility
const actionButtonsRef = ref<HTMLElement | null>(null);

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
        class="flex flex-1 flex-col gap-4 items-start overflow-x-clip overflow-y-auto px-4 py-4"
      >
        <!-- Pending Items Section -->
        <div class="flex items-start justify-between px-2 py-0 relative shrink-0 w-full">
          <div class="flex gap-1 items-start relative shrink-0">
            <p class="text-base-text-quaternary text-sm font-semibold leading-5 relative shrink-0">Pending Items</p>
            <div
              class="bg-base-fg-brand flex flex-col items-center justify-center p-2 relative rounded-lg shrink-0 size-5"
            >
              <p class="text-base-text-primary-reverse text-xs font-semibold leading-4 relative shrink-0">
                {{ pendingItemsCount }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="content-stretch cursor-pointer flex gap-1 items-center justify-center overflow-clip p-0 relative shadow-xs shrink-0"
          >
            <PhCaretUp class="text-base-text-quaternary size-5" />
          </button>
        </div>

        <!-- All Groups Section -->
        <div class="flex flex-col gap-1 items-start relative shrink-0 w-full">
          <!-- Section Header -->
          <div class="flex items-center justify-between px-1 py-0 relative shrink-0 w-full">
            <p class="text-base-text-quaternary text-sm font-semibold leading-5 relative shrink-0">All Groups</p>
            <div class="flex gap-1 items-center relative shrink-0">
              <PhArrowsDownUp class="text-base-text-quinary size-4" />
              <p class="text-base-text-quinary text-sm font-medium leading-5 relative shrink-0">Lent</p>
              <p class="text-util-color-success-600 text-sm font-medium leading-5 relative shrink-0">
                {{ formatAmount(totalBalance.lent) }}
              </p>
              <p class="text-base-text-quinary text-sm font-medium leading-5 relative shrink-0">Owe</p>
              <p class="text-base-text-error text-sm font-medium leading-5 relative shrink-0">
                {{ formatAmount(totalBalance.owe) }}
              </p>
            </div>
          </div>

          <!-- Group List -->
          <div v-if="groups.status === 'pending'" class="flex flex-col gap-3 items-start w-full py-4">
            <div v-for="i in 3" :key="i" class="flex gap-3 items-center w-full">
              <div class="w-16 h-16 skeleton rounded-2xl" />
              <div class="flex-1 flex flex-col gap-1">
                <div class="w-32 h-4 skeleton rounded" />
                <div class="w-24 h-3 skeleton rounded" />
              </div>
            </div>
          </div>

          <div v-else-if="groups.status === 'success'" class="flex flex-col items-start relative shrink-0 w-full">
            <button
              v-for="group in filteredGroups"
              :key="group.groupId"
              type="button"
              class="flex gap-3 items-center px-0 py-2 relative shrink-0 w-full hover:bg-base-bg-active rounded-lg transition-colors"
              @click="() => navigateToGroup(group.groupId)"
            >
              <!-- Avatar -->
              <Avatar :images="getGroupAvatarImages(group)" size="lg" />

              <!-- Group Info -->
              <div class="flex flex-1 flex-col gap-1 items-start justify-center min-h-0 min-w-0 relative shrink-0">
                <p
                  class="text-base-text-primary text-base font-semibold leading-6 min-w-full overflow-ellipsis overflow-hidden relative shrink-0 whitespace-nowrap text-left"
                >
                  {{ getGroupDisplayName(group) }}
                </p>
                <div class="flex gap-1 items-end text-sm font-medium leading-5 relative shrink-0">
                  <!-- All Settled -->
                  <template v-if="group.isSettled">
                    <p class="text-core-alpha-brand-80 relative shrink-0">All settled up</p>
                    <PhCheckCircle class="text-core-alpha-brand-80 size-4 shrink-0" />
                  </template>
                  <!-- You Settled / Lent Only -->
                  <template v-else-if="group.owe === 0 && group.lent > 0">
                    <p class="text-base-text-quinary relative shrink-0">You lent</p>
                    <p class="text-util-color-success-600 relative shrink-0">{{ formatAmount(group.lent) }}</p>
                  </template>
                  <!-- Owe Only -->
                  <template v-else-if="group.owe > 0 && group.lent === 0">
                    <p class="text-base-text-quinary relative shrink-0">You owe</p>
                    <p class="text-base-text-error relative shrink-0">{{ formatAmount(group.owe) }}</p>
                  </template>
                  <!-- Both Owe and Lent -->
                  <template v-else>
                    <p class="text-base-text-quinary relative shrink-0">You owe</p>
                    <p class="text-base-text-error relative shrink-0">{{ formatAmount(group.owe) }}</p>
                    <p class="text-base-text-quinary relative shrink-0">, lent</p>
                    <p class="text-util-color-success-600 relative shrink-0">{{ formatAmount(group.lent) }}</p>
                  </template>
                </div>
              </div>
            </button>

            <!-- Empty State -->
            <div
              v-if="filteredGroups.length === 0"
              class="flex flex-col gap-3 items-center justify-center w-full py-12"
            >
              <p class="text-base-text-tertiary text-base text-center">No groups found</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div ref="actionButtonsRef" class="flex gap-3 items-start px-3 py-0 relative shrink-0 w-full">
          <SButton variant="outline" color="brand" size="xxl" class="flex-1" @click="createGroup">
            <template #icon-left>
              <PhUsers />
            </template>
            Create Group
          </SButton>
        </div>

        <!-- Floating Action Button -->
        <FloatingActionButton @click="addExpense" />
      </div>

      <!-- Empty state interface -->
      <div
        v-else
        v-bind="layoutAttrs"
        class="flex flex-1 flex-col gap-12 items-center overflow-x-clip overflow-y-auto px-4 py-16"
      >
        <!-- Floating Action Button (always visible in empty state) -->
        <FloatingActionButton @click="addExpense" />

        <!-- Empty State Icon -->
        <EmptyStateBackground />

        <!-- Empty State Text -->
        <div class="flex flex-col gap-2 items-center leading-none px-8 py-0 text-center w-full">
          <h2 class="flex flex-col font-medium justify-center text-xl text-base-text-primary w-full">
            <p class="leading-7">{{ $t("home-empty-state-title") }}</p>
          </h2>
          <p class="flex flex-col font-normal justify-center text-base text-base-text-tertiary w-full">
            <span class="leading-6">{{ $t("home-empty-state-description") }}</span>
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3 items-start px-3 py-0 w-full">
          <SButton variant="primary" color="brand" size="xxl" class="w-full" @click="addExpense">
            <template #icon-left>
              <PhPlus />
            </template>
            {{ $t("home-button-record-expense") }}
          </SButton>
          <SButton variant="outline" color="brand" size="xxl" class="w-full" @click="createGroup">
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
