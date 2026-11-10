<script setup lang="ts">
import { PhPlus, PhUsers } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";

import SButton from "@/components/SButton/SButton.vue";

import EmptyStateBackground from "./EmptyStateBackground.vue";

/**
 * The home page of a person with no groups. The user picked this layout in the prototype `2026-11-05-home-empty-state`.
 *
 * Create group is the main action. Record new expense shows only when the person has friends, because the next page
 * lists only groups and friends: without both, that page has nobody to pick.
 *
 * The root grows to fill the content area of the page. Two spacers put 2 parts of the free space above the group and 3
 * parts under it, so the group sits a little above the middle. On a short screen the spacers shrink to nothing.
 */
const { hasFriends } = defineProps<{
  /** True when the person has at least one friend. */
  hasFriends: boolean;
}>();

const { $t } = useFluent();

const emit = defineEmits<{
  addExpense: [];
  createGroup: [];
}>();
</script>

<template>
  <div class="flex grow flex-col items-center">
    <div class="grow-2" />

    <div class="flex w-full flex-col items-center gap-8">
      <div class="flex w-full flex-col items-center gap-10">
        <EmptyStateBackground />
        <div class="flex flex-col items-center gap-2 text-center">
          <h2 class="text-display-xs font-medium text-base-text-primary">
            {{ $t("home-empty-state-title") }}
          </h2>
          <p class="text-base font-normal text-base-text-secondary">
            {{ $t("home-empty-state-description") }}
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col gap-3">
        <SButton variant="primary" size="xl" class="w-full" @click="emit('createGroup')">
          <template #icon-left>
            <PhUsers />
          </template>
          {{ $t("home-button-create-group") }}
        </SButton>

        <SButton v-if="hasFriends" variant="secondary" size="xl" class="w-full" @click="emit('addExpense')">
          <template #icon-left>
            <PhPlus />
          </template>
          {{ $t("home-button-record-expense") }}
        </SButton>
      </div>
    </div>

    <div class="grow-3" />
  </div>
</template>
