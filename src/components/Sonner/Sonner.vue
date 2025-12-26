<script lang="ts" setup>
import { PhCheckCircle, PhCircleNotch, PhInfo, PhWarning, PhX, PhXCircle } from "@phosphor-icons/vue";
import { type ToasterProps, Toaster as Sonner } from "vue-sonner";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner v-bind="props">
    <template #success-icon>
      <PhCheckCircle class="icon-4" />
    </template>
    <template #info-icon>
      <PhInfo class="icon-4" />
    </template>
    <template #warning-icon>
      <PhWarning class="icon-4" />
    </template>
    <template #error-icon>
      <PhXCircle class="icon-4" />
    </template>
    <template #loading-icon>
      <PhCircleNotch class="icon-4 animate-spin" />
    </template>
    <template #close-icon>
      <PhX class="icon-3" />
    </template>
  </Sonner>
</template>
