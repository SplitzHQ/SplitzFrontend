<script setup lang="ts">
import { PhCheckCircle, PhCircle } from '@phosphor-icons/vue'

import Avatar from '@/components/Avatar/Avatar.vue'
import SButtonBase from '@/components/SButton/SButtonBase.vue'

import type { UserListItem } from './types'

const { title, items, selectedItemsId } = defineProps<{
  title: string
  items: UserListItem[]
  selectedItemsId: string[]
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <div class="text-base-text-quaternary text-sm font-medium">{{ title }}</div>
    </div>
    <div class="flex flex-col">
      <button
        v-for="item in items"
        :key="item.id"
        class="py-1 flex items-center gap-3 text-left"
        @click="() => $emit('select', item.id)"
      >
        <div class="flex-1 flex items-center gap-3">
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
          <div class="flex-1 flex flex-col justify-center gap-1">
            <template v-if="item.__typename === 'UserListItemGroup'">
              <div class="flex items-center gap-2">
                <div class="text-base-text-primary text-base font-medium">
                  {{ item.name }}
                </div>
              </div>
              <div class="text-base-text-quinary text-xs font-normal">
                {{ item.members.map((member) => member.userName).join(', ') }}
              </div>
            </template>
            <div
              v-else-if="item.__typename === 'UserListItemFriend'"
              :class="[
                'text-base-text-primary text-base font-medium',
                selectedItemsId.some((id) => item.id === id) ? 'text-util-color-brand-500' : ''
              ]"
            >
              {{ item.friendUser.userName }}
            </div>
          </div>
        </div>
        <SButtonBase v-if="item.__typename === 'UserListItemFriend'" color="brand" size="sm" variant="ghost" icon-only>
          <template #icon-left>
            <Transition name="fade">
              <PhCheckCircle
                v-if="selectedItemsId.some((id) => item.id === id)"
                weight="fill"
                class="absolute inset-0"
              />
              <PhCircle v-else class="absolute inset-0" />
            </Transition>
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
