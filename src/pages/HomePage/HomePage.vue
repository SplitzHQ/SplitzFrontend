<script setup lang="ts">
import { PhList, PhMagnifyingGlass, PhPlus, PhUsers, PhBell, PhSlidersHorizontal } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import Avatar from "@/components/Avatar/Avatar.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import EmptyStateBackground from "./EmptyStateBackground.vue";

const { $t } = useFluent();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();

const { user } = useUserStore();

const searchKeyword = ref("");

const addExpense = () => {
  routerHistoryStore.clearParentHistory();
  routerHistoryStore.addParentHistory("/");
  void router.push("/new-expense");
};

const createGroup = () => {
  // TODO: Implement create group navigation
};
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
</template>
