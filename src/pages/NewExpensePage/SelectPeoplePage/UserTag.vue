<script lang="ts" setup>
import Avatar from '@/components/Avatar/Avatar.vue'

const { photo, name } = defineProps<{ photo: string | null | undefined; name: string }>()
</script>

<template>
  <div class="items-center gap-2 flex">
    <div class="pr-1.5 bg-base-fg-brand-reverse rounded-md border border-base-border-brand flex gap-1">
      <Avatar :images="[{ src: photo, alt: name }]" size="xxs" />
      <div class="text-center text-base-text-primary text-sm font-normal leading-tight">
        {{ name }}
      </div>
    </div>
  </div>
</template>
