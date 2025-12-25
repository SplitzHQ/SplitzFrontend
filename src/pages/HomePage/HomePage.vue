<script setup lang="ts">
import { PhList, PhMagnifyingGlass, PhPlus, PhUsers, PhBell, PhSlidersHorizontal } from "@phosphor-icons/vue";
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

import EmptyStateBackground from "./EmptyStateBackground.vue";

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
      <div class="bg-base-bg-secondary_alt border-b border-base-border-quaternary flex flex-col gap-3 pb-4 pt-4 px-4">
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
