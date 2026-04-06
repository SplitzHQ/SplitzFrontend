<script setup lang="ts">
import { useFluent } from "fluent-vue";

import type { InvoiceReducedDto } from "@/backend";

import InvoiceItem from "./InvoiceItem.vue";

defineProps<{
  invoices: InvoiceReducedDto[];
}>();

const { $t } = useFluent();
</script>

<template>
  <div v-if="invoices.length > 0" class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-base-text-primary">
      {{ $t("group-detail-invoices-title") }}
    </p>
    <div class="flex flex-col">
      <InvoiceItem v-for="inv in invoices" :key="inv.invoiceId" :invoice="inv" />
    </div>
  </div>
</template>
