<script setup lang="ts">
import { useFluent } from "fluent-vue";

import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";

/**
 * Asks the user to confirm before the custom provider is removed.
 * The page runs the request, because the form on the page must stay disabled while the request runs.
 */
const model = defineModel<boolean>({ required: true });

defineProps<{
  removing: boolean;
  /** True when the last request failed. The sheet stays open and shows the error above the buttons. */
  failed: boolean;
}>();

const emit = defineEmits<{ confirm: [] }>();

const { $t } = useFluent();
</script>

<template>
  <Sheet
    v-model="model"
    :title="$t('receipt-recognition-remove-confirm-title')"
    :description="$t('receipt-recognition-remove-confirm-body')"
    detent="medium"
  >
    <template #actions>
      <Notice v-if="failed" tone="error" announce data-test="remove-settings-error">
        <p>{{ $t("receipt-recognition-remove-error") }}</p>
      </Notice>
      <SButton
        variant="destructive"
        size="xl"
        :loading="removing"
        data-test="remove-settings-confirm"
        @click="emit('confirm')"
      >
        {{ $t("receipt-recognition-remove-confirm-yes") }}
      </SButton>
      <SButton
        variant="secondary"
        size="xl"
        :disabled="removing"
        data-test="remove-settings-cancel"
        @click="model = false"
      >
        {{ $t("receipt-recognition-remove-confirm-cancel") }}
      </SButton>
    </template>
  </Sheet>
</template>
