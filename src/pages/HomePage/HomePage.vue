<script setup lang="ts">
import { PhList, PhMagnifyingGlass, PhPlus, PhUsers, PhBell, PhSlidersHorizontal } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import Avatar from "@/components/Avatar/Avatar.vue";
import DebugButton from "@/components/DebugButton/DebugButton.vue";
import FloatingActionButton from "@/components/FloatingActionButton/FloatingActionButton.vue";
import HomeHeader from "@/components/Header/HomeHeader.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import EmptyStateBackground from "./EmptyStateBackground.vue";

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

const { user } = useUserStore();

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
            <Avatar v-if="user?.photo" :images="[{ src: user.photo, alt: user.userName }]" size="xs" />
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
      </div>
    </template>
  </Layout>

  <!-- Debug Button -->
  <DebugButton
    :label="debugForceEmptyState ? 'Show Data' : 'Show Empty State'"
    @click="debugForceEmptyState = !debugForceEmptyState"
  />
</template>
