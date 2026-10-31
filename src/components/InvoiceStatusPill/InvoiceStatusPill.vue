<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import { InvoiceStatus } from "@/backend";

export interface InvoiceStatusPillProps {
  status: InvoiceStatus;
}

const props = defineProps<InvoiceStatusPillProps>();

const { $t } = useFluent();

const isSettled = computed(() => props.status === InvoiceStatus.Settled);
</script>

<template>
  <span
    class="rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-200"
    :class="
      isSettled
        ? 'bg-util-color-success-50 text-util-color-success-700'
        : 'bg-util-color-yellow-50 text-util-color-yellow-700'
    "
  >
    {{ isSettled ? $t("group-detail-invoice-settled") : $t("group-detail-invoice-open") }}
  </span>
</template>
