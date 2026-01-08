<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { AnimatePresence, LayoutGroup, motion } from "motion-v";

import TextInput from "@/components/TextInput/TextInput.vue";

import UserTag from "./UserTag.vue";

const model = defineModel<string>();
const { $t } = useFluent();

const { selectedUsers } = defineProps<{ selectedUsers: { photo: string | null | undefined; userName: string }[] }>();
</script>

<template>
  <div class="my-1.5 flex h-5.5 items-center gap-2">
    <div class="text-sm font-semibold text-base-text-quinary">{{ $t("new-expense-select-people-with") }}</div>
    <LayoutGroup>
      <AnimatePresence>
        <motion.div
          v-for="user in selectedUsers"
          :key="user.userName"
          layout
          class="relative z-10 shrink-0"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.2 }"
        >
          <UserTag :photo="user.photo" :name="user.userName" />
        </motion.div>
        <motion.div layout>
          <TextInput v-model="model" :placeholder="$t('new-expense-select-people-search-placeholder')" />
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  </div>
</template>
