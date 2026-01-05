<script setup lang="ts">
import { PhCheckCircle } from "@phosphor-icons/vue";
import { useElementSize } from "@vueuse/core";
import { useTemplateRef } from "vue";

const rootRef = useTemplateRef("rootRef");
const { width: rootWidth } = useElementSize(rootRef);
</script>

<template>
  <div
    ref="rootRef"
    :class="[
      'flex aspect-square items-center justify-center rounded-full border border-util-color-success-25',
      'bg-radial from-util-color-success-50 from-5% via-util-color-success-25 via-20% to-transparent to-40%'
    ]"
  >
    <div
      class="flex items-center justify-center rounded-full border border-util-color-success-50"
      :style="{ width: `${rootWidth * 0.8}px`, height: `${rootWidth * 0.8}px` }"
    >
      <div
        class="flex items-center justify-center rounded-full border border-util-color-success-100"
        :style="{ width: `${rootWidth * 0.6}px`, height: `${rootWidth * 0.6}px` }"
      >
        <div
          class="flex items-center justify-center rounded-full border border-util-color-success-200"
          :style="{ width: `${rootWidth * 0.4}px`, height: `${rootWidth * 0.4}px` }"
        >
          <PhCheckCircle
            class="text-util-color-success-400"
            weight="fill"
            :style="{ width: `${rootWidth * 0.2}px`, height: `${rootWidth * 0.2}px` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
