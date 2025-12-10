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
  <div class="my-1.5 flex items-center gap-2 h-5.5">
    <div class="text-base-text-quinary text-sm font-semibold">{{ $t("new-expense-select-people-with") }}</div>
    <LayoutGroup>
      <AnimatePresence>
        <motion.div
          v-for="user in selectedUsers"
          :key="user.userName"
          layout
          class="shrink-0 relative z-10"
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
