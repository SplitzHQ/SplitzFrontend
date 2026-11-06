<script setup lang="ts">
import { PhCaretRight } from "@phosphor-icons/vue";

import Avatar from "@/components/Avatar/Avatar.vue";
import SButtonBase from "@/components/SButton/SButtonBase.vue";
import SelectableRow from "@/components/SelectableRow/SelectableRow.vue";
import { TRANSACTION_ROW_CLASS } from "@/components/TransactionItem/transaction-row";

import type { UserListItem } from "./types";

/**
 * A titled list of friends and groups on SelectPeoplePage. A friend row toggles the friend in the selection. A group
 * row opens the next step, so it has no selected state.
 */
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
    <div class="text-sm font-medium text-base-text-quaternary">{{ title }}</div>
    <div class="flex flex-col gap-1">
      <template v-for="item in items" :key="item.id">
        <SelectableRow
          v-if="item.__typename === 'UserListItemFriend'"
          :selected="selectedItemsId.includes(item.id)"
          @toggle="$emit('select', item.id)"
        >
          <Avatar
            aria-hidden="true"
            :images="[{ src: item.friendUser.photo, alt: item.friendUser.userName }]"
            size="xs"
          />
          <span class="min-w-0 flex-1 truncate text-base font-medium text-base-text-primary">
            {{ item.friendUser.userName }}
          </span>
        </SelectableRow>
        <!-- The ring stays inside the row, like the ring of a friend row. -->
        <button
          v-else
          type="button"
          :class="[TRANSACTION_ROW_CLASS, 'text-left focus-visible:-outline-offset-2']"
          @click="$emit('select', item.id)"
        >
          <Avatar
            aria-hidden="true"
            :images="item.members.map((member) => ({ src: member.photo, alt: member.userName }))"
            size="xs"
          />
          <span class="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <span class="truncate text-base font-medium text-base-text-primary">{{ item.name }}</span>
            <span class="truncate text-xs font-normal text-base-text-quinary">
              {{ item.members.map((member) => member.userName).join(", ") }}
            </span>
          </span>
          <!-- SButtonBase grows to fill its parent, so it does not grow here and stays at the end of the row. -->
          <SButtonBase size="sm" variant="ghost" icon-only class="grow-0">
            <template #icon-left>
              <PhCaretRight />
            </template>
          </SButtonBase>
        </button>
      </template>
    </div>
  </div>
</template>
