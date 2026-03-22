<script setup lang="ts">
import { useFluent } from "fluent-vue";

import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";

defineProps<{
  modelValue: boolean;
  isDeleting: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();

const { $t } = useFluent();
</script>

<template>
  <Sheet :model-value="modelValue" detent="medium" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-2">
        <p class="text-lg font-semibold text-base-text-primary">
          {{ $t("transaction-detail-delete-confirm-title") }}
        </p>
        <p class="text-sm text-base-text-secondary">
          {{ $t("transaction-detail-delete-confirm-message") }}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <SButton
          variant="primary"
          color="error"
          size="xxl"
          :loading="isDeleting"
          :disabled="isDeleting"
          @click="emit('confirm')"
        >
          {{ $t("transaction-detail-delete-confirm-yes") }}
        </SButton>
        <SButton
          variant="secondary"
          color="neutral"
          size="xxl"
          :disabled="isDeleting"
          @click="emit('update:modelValue', false)"
        >
          {{ $t("transaction-detail-delete-confirm-cancel") }}
        </SButton>
      </div>
    </div>
  </Sheet>
</template>
