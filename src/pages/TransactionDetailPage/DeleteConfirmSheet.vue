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
  <Sheet
    :model-value="modelValue"
    :title="$t('transaction-detail-delete-confirm-title')"
    detent="medium"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="text-sm text-base-text-secondary">
      {{ $t("transaction-detail-delete-confirm-message") }}
    </p>

    <template #actions>
      <SButton variant="destructive" size="xl" :loading="isDeleting" @click="emit('confirm')">
        {{ $t("transaction-detail-delete-confirm-yes") }}
      </SButton>
      <SButton variant="secondary" size="xl" :disabled="isDeleting" @click="emit('update:modelValue', false)">
        {{ $t("transaction-detail-delete-confirm-cancel") }}
      </SButton>
    </template>
  </Sheet>
</template>
