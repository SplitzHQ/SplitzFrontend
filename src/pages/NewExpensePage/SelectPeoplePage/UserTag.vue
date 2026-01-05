<script lang="ts" setup>
import Avatar from "@/components/Avatar/Avatar.vue";

const { photo, name } = defineProps<{ photo: string | null | undefined; name: string }>();
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex gap-1 rounded-md border border-base-border-brand bg-base-fg-brand-reverse pr-1.5">
      <Avatar :images="[{ src: photo, alt: name }]" size="xxs" />
      <div class="text-center text-sm leading-tight font-normal text-base-text-primary">
        {{ name }}
      </div>
    </div>
  </div>
</template>
