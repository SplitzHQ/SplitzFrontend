<script setup lang="ts">
import { PhFileText } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";

import type { InvoiceReducedDto } from "@/backend";
import { InvoiceStatus } from "@/backend";

const props = defineProps<{
  invoice: InvoiceReducedDto;
}>();

const { $t } = useFluent();

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const isSettled = props.invoice.status === InvoiceStatus.Settled;
</script>

<template>
  <a class="flex items-center gap-3 rounded-2xl py-2 transition-colors active:bg-base-bg-secondary">
    <div
      class="flex size-12 shrink-0 items-center justify-center rounded-05xl"
      :class="isSettled ? 'bg-util-color-success-50' : 'bg-util-color-yellow-50'"
    >
      <PhFileText class="icon-7" :class="isSettled ? 'text-util-color-success-600' : 'text-util-color-yellow-600'" />
    </div>
    <div class="flex min-w-0 flex-1 flex-col">
      <p class="truncate text-lg font-medium text-base-text-primary">
        {{ invoice.name || $t("group-detail-invoice-unnamed") }}
      </p>
      <p class="truncate text-sm text-base-text-quaternary">
        {{ $t("group-detail-invoice-created-by", { name: invoice.createdBy.userName }) }}
        · {{ formatDate(invoice.createTime) }}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-0.5">
      <span
        class="rounded-full px-2 py-0.5 text-xs font-medium"
        :class="
          isSettled
            ? 'bg-util-color-success-50 text-util-color-success-700'
            : 'bg-util-color-yellow-50 text-util-color-yellow-700'
        "
      >
        {{ isSettled ? $t("group-detail-invoice-settled") : $t("group-detail-invoice-open") }}
      </span>
    </div>
  </a>
</template>
