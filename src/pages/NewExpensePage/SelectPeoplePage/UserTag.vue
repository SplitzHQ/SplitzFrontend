<script lang="ts" setup>
import { useFluent } from "fluent-vue";

import Avatar from "@/components/Avatar/Avatar.vue";

/**
 * The tag of one selected person. A tap on the whole tag removes the person. An invisible box makes the tap area at least
 * 44px in both directions, so the tag does not need to look larger.
 */
const { photo, name } = defineProps<{ photo: string | null | undefined; name: string }>();

defineEmits<{ remove: [event: MouseEvent] }>();

const { $t } = useFluent();
</script>

<template>
  <button
    type="button"
    :aria-label="$t('new-expense-select-people-remove', { name })"
    class="relative flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-comp-user-tag-border bg-base-bg-brand-subtle py-0.5 pr-2 pl-0.5 transition-opacity duration-feedback ease-standard after:absolute after:top-1/2 after:left-1/2 after:h-11 after:w-[max(100%,--spacing(11))] after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-focus-ring active:opacity-70 motion-reduce:transition-none"
    @click="$emit('remove', $event)"
  >
    <Avatar aria-hidden="true" :images="[{ src: photo, alt: name }]" size="xxs" />
    <span class="max-w-28 truncate text-sm leading-5 font-normal text-base-text-primary">{{ name }}</span>
  </button>
</template>
