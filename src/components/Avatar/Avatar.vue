<script setup lang="ts">
import defaultUser from './default-user.svg'

interface Image {
  src: string | null | undefined
  alt: string
}
export interface AvatarProps {
  images: Image[]
  size: 'xxs' | 'xs' | 'sm' | 'lg'
}

const { images, size } = defineProps<AvatarProps>()

if (images.length > 4) {
  console.warn('Avatar component only supports up to 4 images')
}
</script>

<template>
  <div :class="['img-container', size, 'flex items-center justify-center bg-core-alpha-brand-10']">
    <img
      v-if="images.length === 1"
      class="image-count-single"
      :src="images[0].src ?? defaultUser"
      :alt="images[0].alt"
    />
    <div v-else class="flex flex-wrap justify-center gap-0.5">
      <img
        v-for="image in images.slice(0, 4)"
        :key="image.src ?? defaultUser"
        class="image-count-multiple"
        :src="image.src ?? defaultUser"
        :alt="image.alt"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.img-container.xxs {
  @apply h-5 w-5 rounded-md;

  .image-count-single {
    @apply h-5 w-5 rounded-md;
  }

  .image-count-multiple {
    @apply h-1 w-1 rounded-sm;
  }
}

.img-container.xs {
  @apply h-10 w-10 rounded-05xl;

  .image-count-single {
    @apply h-10 w-10 rounded-05xl;
  }

  .image-count-multiple {
    @apply h-4 w-4 rounded;
  }
}

.img-container.sm {
  @apply h-12 w-12 rounded-xl;

  .image-count-single {
    @apply h-12 w-12 rounded-xl;
  }

  .image-count-multiple {
    @apply h-5 w-5 rounded-md;
  }
}

.img-container.lg {
  @apply h-16 w-16 rounded-2xl;

  .image-count-single {
    @apply h-16 w-16 rounded-2xl;
  }

  .image-count-multiple {
    @apply h-7 w-7 rounded-lg;
  }
}
</style>
