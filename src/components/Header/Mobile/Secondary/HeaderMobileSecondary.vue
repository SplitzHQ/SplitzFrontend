<script setup lang="ts">
import { PhArrowLeft, PhX } from "@phosphor-icons/vue";
import { useRouter } from "vue-router";

import SIconButton from "@/components/SButton/SIconButton.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";

export interface HeaderMobileSecondaryProps {
  enableBackButton?: boolean;
  enableCloseButton?: boolean;
}

const routerHistoryStore = useRouterHistoryStore();
const router = useRouter();

const { enableBackButton, enableCloseButton } = defineProps<HeaderMobileSecondaryProps>();

const goBack = () => {
  router.back();
};

const close = () => {
  const previousRoute = routerHistoryStore.removeParentHistory();
  if (previousRoute) {
    void router.push(previousRoute);
  } else {
    void router.push("/");
  }
};
</script>

<template>
  <header class="sticky top-0 z-sticky flex items-center gap-2.5 bg-base-bg-primary p-4">
    <SIconButton v-if="enableBackButton" variant="ghost" color="neutral" size="lg" @click="goBack">
      <PhArrowLeft />
    </SIconButton>
    <div class="grow">
      <slot />
    </div>
    <SIconButton v-if="enableCloseButton" variant="ghost" color="neutral" size="lg" @click="close">
      <PhX />
    </SIconButton>
  </header>
</template>
