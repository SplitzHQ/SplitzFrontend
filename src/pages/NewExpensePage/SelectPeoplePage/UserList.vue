<script setup lang="ts">
import { PhCaretRight, PhCheckCircle, PhCircle } from "@phosphor-icons/vue";

import Avatar from "@/components/Avatar/Avatar.vue";
import { LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import SButtonBase from "@/components/SButton/SButtonBase.vue";

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
            aria-hidden="true"
            :images="item.members.map((member) => ({ src: member.photo, alt: member.userName }))"
            size="xs"
          />
          <Avatar
            v-else-if="item.__typename === 'UserListItemFriend'"
            aria-hidden="true"
            :images="[{ src: item.friendUser.photo, alt: item.friendUser.userName }]"
            size="xs"
          />
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <template v-if="item.__typename === 'UserListItemGroup'">
              <div :class="['truncate', LIST_ROW_TEXT.title]">
                {{ item.name }}
              </div>
              <div :class="['truncate', LIST_ROW_TEXT.subtitle]">
                {{ item.members.map((member) => member.userName).join(", ") }}
              </div>
            </template>
            <div
              v-else-if="item.__typename === 'UserListItemFriend'"
              :class="[
                'truncate',
                LIST_ROW_TEXT.title,
                selectedItemsId.some((id) => item.id === id) ? 'text-util-color-brand-500' : '',
              ]"
            >
              {{ item.friendUser.userName }}
            </div>
          </div>
        </div>
        <SButtonBase v-if="item.__typename === 'UserListItemFriend'" size="sm" variant="ghost" icon-only>
          <template #icon-left>
            <Transition name="fade">
              <PhCheckCircle
                v-if="selectedItemsId.some((id) => item.id === id)"
                weight="fill"
                class="absolute inset-0 size-full text-base-fg-brand"
              />
              <PhCircle v-else class="absolute inset-0" />
            </Transition>
          </template>
        </SButtonBase>
        <SButtonBase v-else-if="item.__typename === 'UserListItemGroup'" size="sm" variant="ghost" icon-only>
          <template #icon-left>
            <PhCaretRight />
          </template>
        </SButtonBase>
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
