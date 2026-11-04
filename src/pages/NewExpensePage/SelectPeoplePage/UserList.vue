<script setup lang="ts">
import { PhCaretRight, PhCheckCircle, PhCircle } from "@phosphor-icons/vue";

import Avatar from "@/components/Avatar/Avatar.vue";

import type { UserListItem } from "./types";

const { title, items, selectedItemsId } = defineProps<{
  title: string;
  items: UserListItem[];
  selectedItemsId: string[];
}>();

defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <div class="text-sm font-medium text-base-text-quaternary">{{ title }}</div>
    </div>
    <div class="flex flex-col">
      <button
        v-for="item in items"
        :key="item.id"
        class="flex cursor-pointer items-center gap-3 py-1 text-left"
        @click="() => $emit('select', item.id)"
      >
        <div class="flex flex-1 items-center gap-3">
          <Avatar
            v-if="item.__typename === 'UserListItemGroup'"
            :images="item.members.map((member) => ({ src: member.photo, alt: member.userName }))"
            size="xs"
          />
          <Avatar
            v-else-if="item.__typename === 'UserListItemFriend'"
            :images="[{ src: item.friendUser.photo, alt: item.friendUser.userName }]"
            size="xs"
          />
          <div class="flex flex-1 flex-col justify-center gap-1">
            <template v-if="item.__typename === 'UserListItemGroup'">
              <div class="flex items-center gap-2">
                <div class="text-base font-medium text-base-text-primary">
                  {{ item.name }}
                </div>
              </div>
              <div class="text-xs font-normal text-base-text-quinary">
                {{ item.members.map((member) => member.userName).join(", ") }}
              </div>
            </template>
            <div
              v-else-if="item.__typename === 'UserListItemFriend'"
              :class="[
                'text-base font-medium text-base-text-primary',
                selectedItemsId.some((id) => item.id === id) ? 'text-util-color-brand-500' : '',
              ]"
            >
              {{ item.friendUser.userName }}
            </div>
          </div>
        </div>
        <!-- The row is the button. These icons only show its state, because a button cannot hold a button. -->
        <span
          v-if="item.__typename === 'UserListItemFriend'"
          class="relative size-8 shrink-0 text-lg text-base-fg-primary"
        >
          <Transition name="fade">
            <PhCheckCircle
              v-if="selectedItemsId.some((id) => item.id === id)"
              weight="fill"
              class="absolute inset-0 m-auto text-base-fg-brand"
            />
            <PhCircle v-else class="absolute inset-0 m-auto" />
          </Transition>
        </span>
        <span
          v-else-if="item.__typename === 'UserListItemGroup'"
          class="flex size-8 shrink-0 items-center justify-center text-lg text-base-fg-primary"
        >
          <PhCaretRight />
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.1s ease-in-out;
  }
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
  &-enter-to,
  &-leave-from {
    opacity: 1;
  }
}
</style>
