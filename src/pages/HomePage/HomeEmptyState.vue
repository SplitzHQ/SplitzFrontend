<script setup lang="ts">
import { PhPlus, PhUsers } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";

import SButton from "@/components/SButton/SButton.vue";

import EmptyStateBackground from "./EmptyStateBackground.vue";

const { $t } = useFluent();

const emit = defineEmits<{
  addExpense: [];
  createGroup: [];
}>();
</script>

<template>
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

    <div class="flex w-full flex-col items-start gap-3 px-3 py-0">
      <SButton variant="primary" color="brand" size="xxl" class="w-full" @click="emit('addExpense')">
        <template #icon-left>
          <PhPlus />
        </template>
        {{ $t("home-button-record-expense") }}
      </SButton>

      <SButton variant="outline" color="neutral" size="xxl" class="w-full" @click="emit('createGroup')">
        <template #icon-left>
          <PhUsers />
        </template>
        {{ $t("home-button-create-group") }}
      </SButton>
    </div>
  </div>
</template>
