<script setup lang="ts">
import { PhCaretUp } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { shallowRef, useTemplateRef } from "vue";

import TextInput from "@/components/TextInput/TextInput.vue";

import { useTagOverflow } from "./use-tag-overflow";
import { useTagRowAnimation } from "./use-tag-row-animation";
import UserTag from "./UserTag.vue";

/**
 * Selected-people row with an inline search input.
 * When all user tags do not fit on one line, overflowing tags collapse into a `+N` button.
 * Clicking `+N` expands the row across multiple lines; clicking the caret collapses it back to one line.
 */

/** A selected person shown as a removable tag in the row. */
export interface SelectedUser {
  id: string;
  photo: string | null | undefined;
  userName: string;
}

const searchQuery = defineModel<string>();
const { selectedUsers } = defineProps<{
  selectedUsers: SelectedUser[];
}>();
const emit = defineEmits<{ remove: [id: string] }>();

const { $t } = useFluent();

const rowContainer = useTemplateRef<HTMLElement>("rowContainer");
const labelElement = useTemplateRef<HTMLElement>("labelElement");
const measurementRow = useTemplateRef<HTMLElement>("measurementRow");
const tagElements = useTemplateRef<HTMLElement[]>("tagElements");
const overflowButtonWrapper = useTemplateRef<HTMLElement>("overflowButtonWrapper");
const searchInputWrapper = useTemplateRef<HTMLElement>("searchInputWrapper");

const enableMoveTransition = shallowRef(true);

const { hiddenTagCount, isExpanded, toggleExpanded, visibleTags } = useTagOverflow({
  labelElement,
  measurementRow,
  rowContainer,
  selectedItems: () => selectedUsers,
});

const { pinLeavingTagPosition } = useTagRowAnimation({
  enableMoveTransition,
  isExpanded,
  rowContainer,
  selectedItems: () => selectedUsers,
  tagElements,
  trailingElements: () => [overflowButtonWrapper.value, searchInputWrapper.value],
});

/** Expands or collapses the tag row while disabling FLIP sliding so trailing elements fade in at their new line. */
function handleToggleExpanded(): void {
  enableMoveTransition.value = false;
  toggleExpanded();
}
</script>

<template>
  <div ref="rowContainer" class="relative my-1.5">
    <TransitionGroup
      :class="['relative flex items-center gap-2', isExpanded ? 'flex-wrap gap-y-1.5' : 'h-6.5']"
      :move-class="enableMoveTransition ? 'row-move' : 'row-move-disabled'"
      name="row"
      tag="div"
      @before-leave="pinLeavingTagPosition"
    >
      <div key="label" ref="labelElement" class="shrink-0 text-sm font-semibold text-base-text-quinary">
        {{ $t("new-expense-select-people-with") }}
      </div>
      <div
        v-for="user in visibleTags"
        :key="user.id"
        ref="tagElements"
        data-user-tag
        class="relative z-10 flex min-w-0 shrink-0"
      >
        <UserTag :photo="user.photo" :name="user.userName" @remove="emit('remove', user.id)" />
      </div>
      <div
        v-if="hiddenTagCount > 0 || isExpanded"
        key="overflow-button"
        ref="overflowButtonWrapper"
        data-fade-on-toggle
        class="relative z-10 flex shrink-0"
      >
        <button
          type="button"
          :aria-expanded="isExpanded"
          :aria-label="
            isExpanded
              ? $t('new-expense-select-people-show-fewer')
              : $t('new-expense-select-people-show-more', { count: hiddenTagCount })
          "
          class="relative flex h-6.5 cursor-pointer items-center rounded-lg border border-comp-user-tag-border bg-base-bg-brand-subtle px-2 text-sm font-medium text-base-text-secondary after:absolute after:top-1/2 after:left-1/2 after:h-11 after:w-[max(100%,--spacing(11))] after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-focus-ring"
          @click="handleToggleExpanded"
        >
          <PhCaretUp v-if="isExpanded" aria-hidden="true" class="size-3.5" weight="bold" />
          <template v-else>+{{ hiddenTagCount }}</template>
        </button>
      </div>
      <div
        key="search-input"
        ref="searchInputWrapper"
        data-fade-on-toggle
        class="flex h-6.5 min-w-20 grow basis-20 items-center"
      >
        <div class="w-full shrink-0">
          <TextInput
            v-model="searchQuery"
            variant="plain"
            :label="$t('new-expense-select-people-search-placeholder')"
            :placeholder="$t('new-expense-select-people-search-placeholder')"
          />
        </div>
      </div>
    </TransitionGroup>

    <!--
      Offscreen copy of all tags and a worst-case `+N` button used to measure widths when the row is collapsed.
      Rendering `+selectedUsers.length` avoids a circular dependency on `hiddenTagCount` while reserving enough width
      for the largest possible count. Zero height with `overflow-hidden` keeps wide content from causing horizontal scroll.
    -->
    <div inert class="invisible absolute inset-x-0 top-0 h-0 overflow-hidden" aria-hidden="true">
      <div ref="measurementRow" class="flex w-max">
        <UserTag v-for="user in selectedUsers" :key="user.id" :photo="user.photo" :name="user.userName" />
        <div class="flex h-6.5 shrink-0 items-center rounded-lg border px-2 text-sm font-medium">
          +{{ selectedUsers.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row-enter-active {
  transition: opacity var(--motion-duration-container) var(--motion-easing-standard);
}

.row-leave-active {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  transition: opacity var(--motion-duration-exit) var(--motion-easing-standard);
}

.row-enter-from,
.row-leave-to {
  opacity: 0;
}

.row-move {
  transition: transform var(--motion-duration-container) var(--motion-easing-standard);
}
</style>
