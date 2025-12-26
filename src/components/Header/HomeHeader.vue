<script setup lang="ts">
import { PhList, PhMagnifyingGlass, PhBell, PhSlidersHorizontal } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";

import { AccountApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";

const accountApi = new AccountApi(config);
const { state: userInfo } = useQuery({ key: ["getUserInfo"], query: () => accountApi.getUserInfo() });

const searchKeyword = defineModel<string>("searchKeyword", { default: "" });
</script>

<template>
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
        <TextInput v-model="searchKeyword" placeholder="Search" />
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
