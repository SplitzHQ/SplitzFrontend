<script setup lang="ts">
import { PhUser } from "@phosphor-icons/vue";
import { computed, shallowReactive } from "vue";

import { resolveAssetUrl } from "@/libs/asset-url";

import { AVATAR_TONE_STYLES, avatarInitial, avatarTone } from "./avatar-initial";

/** One picture of an avatar. */
interface Image {
  /** The path or the URL of the picture. Without a value, or after a load error, the initial of `alt` shows. */
  src: string | null | undefined;
  /** The name of the person or the group. The initial and its color come from this name. */
  alt: string;
}

/**
 * A user picture, or a grid of pictures for a group. See `avatar.usage.ts`.
 * Set `aria-hidden="true"` when the name of the person or the group is next to the avatar.
 */
export interface AvatarProps {
  /** One picture shows at full size. Several pictures show as a grid. The grid shows the first four. */
  images: Image[];
  /** 20px, 40px, 48px or 64px. `header` is the 32px size of the home header. */
  size: "xxs" | "xs" | "sm" | "lg" | "header";
}

/** The grid has room for this number of pictures. Callers can pass all the members of a group. */
const MAX_GRID_IMAGES = 4;

const { images, size } = defineProps<AvatarProps>();

const failedSources = shallowReactive(new Set<string>());

const isGroup = computed(() => images.length > 1);

/** The pictures to show. A missing picture and a picture that failed to load have a null source and show a tile. */
const shownImages = computed(() =>
  images.slice(0, MAX_GRID_IMAGES).map(({ alt, src }) => {
    const resolved = resolveAssetUrl(src);
    return {
      alt,
      initial: avatarInitial(alt),
      src: resolved && !failedSources.has(resolved) ? resolved : null,
      tone: avatarTone(alt),
    };
  })
);

/** A grid is one picture for a screen reader, with one name. A single picture uses its own `alt`. */
const gridLabel = computed(() =>
  isGroup.value
    ? shownImages.value
        .map(({ alt }) => alt)
        .filter(Boolean)
        .join(", ") || undefined
    : undefined
);

/** Replaces a picture that failed to load with the tile. */
function onImageError(src: string) {
  failedSources.add(src);
}
</script>

<template>
  <div
    :class="[
      'img-container',
      size,
      isGroup && 'is-group',
      'flex shrink-0 items-center justify-center bg-core-alpha-brand-10',
    ]"
    :role="gridLabel ? 'img' : undefined"
    :aria-label="gridLabel"
  >
    <div class="flex flex-wrap justify-center gap-0.5">
      <!-- The position is the key, because two people with no picture have the same source. -->
      <template v-for="(image, index) in shownImages" :key="index">
        <img
          v-if="image.src"
          :class="[isGroup ? 'image-count-multiple' : 'image-count-single', 'block object-cover']"
          :src="image.src"
          :alt="isGroup ? '' : image.alt"
          @error="onImageError(image.src!)"
        />
        <div
          v-else
          :class="[
            isGroup ? 'image-count-multiple' : 'image-count-single',
            'flex items-center justify-center leading-none font-semibold select-none',
          ]"
          :style="AVATAR_TONE_STYLES[image.tone]"
          :role="!isGroup && image.alt ? 'img' : undefined"
          :aria-label="!isGroup && image.alt ? image.alt : undefined"
          :aria-hidden="isGroup ? 'true' : undefined"
        >
          <span v-if="image.initial" aria-hidden="true">{{ image.initial }}</span>
          <PhUser v-else class="size-3/5" weight="fill" aria-hidden="true" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@reference '../../assets/base.css';

/*
 * The initial is 45% of the side of its tile, and 10px at the smallest. In a group, the corner of the frame is the corner
 * of a tile plus the padding, so the two curves stay parallel.
 */
.img-container.xxs {
  @apply h-5 w-5 rounded-md;

  .image-count-single {
    @apply h-5 w-5 rounded-md text-[0.625rem];
  }

  /* No caller uses this grid, and a 4px tile has no room for an initial. */
  .image-count-multiple {
    @apply h-1 w-1 rounded-sm text-[0];
  }
}

.img-container.header {
  @apply h-8 w-8 rounded-lg;

  .image-count-single {
    @apply h-8 w-8 rounded-lg text-[0.875rem];
  }
}

.img-container.xs {
  @apply h-10 w-10 rounded-05xl;

  &.is-group {
    @apply rounded-lg;
  }

  .image-count-single {
    @apply h-10 w-10 rounded-05xl text-[1.125rem];
  }

  .image-count-multiple {
    @apply h-4 w-4 rounded-[0.3125rem] text-[0.625rem];
  }
}

.img-container.sm {
  @apply h-12 w-12 rounded-xl;

  &.is-group {
    @apply rounded-05xl;
  }

  .image-count-single {
    @apply h-12 w-12 rounded-xl text-[1.375rem];
  }

  .image-count-multiple {
    @apply h-5 w-5 rounded-[0.4375rem] text-[0.625rem];
  }
}

.img-container.lg {
  @apply h-16 w-16 rounded-2xl;

  &.is-group {
    @apply rounded-xl;
  }

  .image-count-single {
    @apply h-16 w-16 rounded-2xl text-[1.8125rem];
  }

  .image-count-multiple {
    @apply h-[1.6875rem] w-[1.6875rem] rounded-lg text-[0.75rem];
  }
}
</style>
