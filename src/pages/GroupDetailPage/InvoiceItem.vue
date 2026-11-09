<script setup lang="ts">
import { PhFileText } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { RouterLink } from "vue-router";

import type { InvoiceReducedDto } from "@/backend";
import { InvoiceStatus } from "@/backend";
import InvoiceStatusPill from "@/components/InvoiceStatusPill/InvoiceStatusPill.vue";
import { LIST_ROW_CLASS, LIST_ROW_TEXT } from "@/components/ListRow/list-row";

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
  <RouterLink
    :to="{ name: 'invoiceDetail', params: { groupId: invoice.groupId, invoiceId: invoice.invoiceId } }"
    :class="[LIST_ROW_CLASS, 'focus-visible:outline-offset-2']"
  >
    <div
      class="flex size-12 shrink-0 items-center justify-center rounded-xl"
      :class="isSettled ? 'bg-util-color-success-50' : 'bg-util-color-yellow-50'"
    >
      <PhFileText class="icon-7" :class="isSettled ? 'text-util-color-success-600' : 'text-util-color-yellow-600'" />
    </div>
    <!-- SPZ-105 removes this row, so it keeps its own markup and takes only the text levels of a list row. -->
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <p :class="['truncate', LIST_ROW_TEXT.title]">
        {{ invoice.name || $t("group-detail-invoice-unnamed") }}
      </p>
      <p :class="['truncate', LIST_ROW_TEXT.subtitle]">
        {{ $t("group-detail-invoice-created-by", { name: invoice.createdBy.userName }) }}
        · {{ formatDate(invoice.createTime) }}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-0.5">
      <InvoiceStatusPill :status="invoice.status" />
    </div>
  </RouterLink>
</template>
