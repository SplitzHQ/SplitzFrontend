<script setup lang="ts">
import { useRouter } from "vue-router";

import SButton from "@/components/SButton/SButton.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";

const routerHistoryStore = useRouterHistoryStore();
const router = useRouter();

const addExpense = () => {
  routerHistoryStore.clearParentHistory();
  routerHistoryStore.addParentHistory("/");
  void router.push("/new-expense");
};
</script>

<template>
  <div class="flex gap-4 flex-col">
    Home page
    <div class="flex">
      <SButton variant="primary" color="neutral" size="md" @click="addExpense">New Expense</SButton>
    </div>
  </div>
</template>
