<script setup lang="ts">
import {
  PhAirplane,
  PhCar,
  PhCurrencyCircleDollar,
  PhForkKnife,
  PhHandCoins,
  PhList,
  PhMagnifyingGlass,
  PhPlus,
  PhReceipt,
  PhUsers,
  PhUsersThree,
  PhBell,
  PhSlidersHorizontal
} from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { AccountApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

const accountApi = new AccountApi(config);
const { state: userInfo } = useQuery({ key: ["getUserInfo"], query: () => accountApi.getUserInfo() });

const searchKeyword = ref("");

const addExpense = () => {
  routerHistoryStore.clearParentHistory();
  routerHistoryStore.addParentHistory("/");
  void router.push("/new-expense");
};

const createGroup = () => {
  // TODO: Implement create group navigation
  console.log("Create group");
};
</script>

<template>
  <Layout>
    <template #header>
      <div
        class="bg-base-bg-secondary_alt border-b border-base-border-quaternary flex flex-col gap-3 pb-4 pt-[63px] px-4"
      >
        <!-- Header -->
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2.5">
            <SIconButton variant="ghost" color="neutral" size="lg">
              <PhList class="text-util-color-brand-700" />
            </SIconButton>
            <h1 class="text-util-color-brand-700 text-lg font-bold leading-7">Splitz</h1>
          </div>
          <div class="flex items-start gap-2.5">
            <SIconButton variant="ghost" color="neutral" size="lg">
              <PhBell class="text-util-color-brand-700" />
            </SIconButton>
            <Avatar
              v-if="userInfo.data?.photo"
              :images="[{ src: userInfo.data.photo, alt: userInfo.data.userName ?? 'User' }]"
              size="xs"
            />
          </div>
        </div>

        <!-- Search Bar -->
        <div class="flex gap-2.5 items-start w-full">
          <div
            class="bg-util-alpha-black-5 flex flex-1 gap-2 items-center min-h-0 min-w-0 overflow-clip p-2.5 rounded-full"
          >
            <PhMagnifyingGlass class="text-util-color-brand-700 shrink-0 size-5" />
            <TextInput v-model="searchKeyword" :placeholder="$t('home-search-placeholder')" />
          </div>
          <button
            type="button"
            class="bg-base-bg-neutral flex gap-0 items-center justify-center overflow-clip p-2.5 rounded-full shrink-0"
          >
            <PhSlidersHorizontal class="text-base-text-primary size-5" />
          </button>
        </div>
      </div>
    </template>

    <template #default="layoutAttrs">
      <div
        v-bind="layoutAttrs"
        class="flex flex-1 flex-col gap-12 items-center overflow-x-clip overflow-y-auto px-4 py-16"
      >
        <!-- Floating Action Button -->
        <SIconButton
          variant="primary"
          color="brand"
          size="xxl"
          class="fixed right-5 top-[575px] shadow-lg z-10"
          @click="addExpense"
        >
          <PhPlus />
        </SIconButton>

        <!-- Empty State Icon -->
        <div class="relative shrink-0 size-[120px]">
          <!-- 4 Concentric Circles with increasing size, larger spacing, and decreasing opacity -->
          <!-- Circle 1: 120px - darkest, radius ~32px to contain 64px icon -->
          <div class="absolute left-1/2 size-[120px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <svg class="size-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="32" stroke="#799689" stroke-width="1" opacity="1" />
            </svg>
          </div>
          <!-- Circle 2: 200px - lighter, larger spacing -->
          <div class="absolute left-1/2 size-[200px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <svg class="size-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="60" stroke="#799689" stroke-width="1" opacity="0.6" />
            </svg>
          </div>
          <!-- Circle 3: 280px - even lighter, larger spacing -->
          <div class="absolute left-1/2 size-[280px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <svg class="size-full" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="140" cy="140" r="90" stroke="#799689" stroke-width="1" opacity="0.3" />
            </svg>
          </div>
          <!-- Circle 4: 360px - outermost with fade-out effect, largest spacing -->
          <div class="absolute left-1/2 size-[360px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <svg class="size-full" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="outerFade" cx="50%" cy="50%">
                  <stop offset="0%" stop-color="#799689" stop-opacity="0.2" />
                  <stop offset="50%" stop-color="#799689" stop-opacity="0.1" />
                  <stop offset="100%" stop-color="#799689" stop-opacity="0" />
                </radialGradient>
              </defs>
              <circle cx="180" cy="180" r="120" stroke="url(#outerFade)" stroke-width="1" />
            </svg>
          </div>

          <!-- Center Dollar Icon -->
          <div
            class="absolute left-1/2 size-16 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <PhCurrencyCircleDollar class="text-util-color-brand-700 size-full" />
          </div>

          <!-- Category Icons around the circle -->
          <div
            class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-1.5 rounded-lg left-[134.5px] top-0"
          >
            <PhForkKnife class="text-util-color-brand-700 size-4" />
          </div>
          <div
            class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-1.5 rounded-lg -left-[94.5px] top-10"
          >
            <PhAirplane class="text-util-color-brand-700 size-4" />
          </div>
          <div
            class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-2 rounded-lg -left-[40.5px] top-[98px]"
          >
            <PhUsersThree class="text-util-color-brand-700 size-6" />
          </div>
          <div
            class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-2 rounded-lg -left-[49px] -top-6"
          >
            <PhHandCoins class="text-util-color-brand-700 size-6" />
          </div>
          <div
            class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-1.5 rounded-lg left-[188.5px] top-[65px]"
          >
            <PhCar class="text-util-color-brand-700 size-4" />
          </div>
          <div
            class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-2 rounded-lg left-[122.5px] top-[112px]"
          >
            <PhReceipt class="text-util-color-brand-700 size-6" />
          </div>
        </div>

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
</template>
