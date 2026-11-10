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
  /**
   * See `SIZE_GUIDE` in `avatar.usage.ts` for when to use each size. `header` is only for the home header, and `title` is
   * for the title of a secondary page.
   */
  size: "xxs" | "title" | "xs" | "sm" | "lg" | "header";
}

/** The grid has room for this number of pictures. Callers can pass all the members of a group. */
const MAX_GRID_IMAGES = 4;

const { images, size } = defineProps<AvatarProps>();

const failedSources = shallowReactive(new Set<string>());

const isGroup = computed(() => images.length > 1);

/**
 * Two people go on a diagonal of the grid: the first at the top left and the second at the bottom right. In one row they
 * would leave an empty band above and below. The tiles keep the size of a grid tile and move a little to the center. See
 * `avatar.usage.ts`.
 */
const isPair = computed(() => images.length === 2);

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
      'flex shrink-0 items-center justify-center bg-base-bg-brand-subtle',
    ]"
    :role="gridLabel ? 'img' : undefined"
    :aria-label="gridLabel"
  >
    <div
      :class="[isPair ? 'grid grid-cols-2' : 'flex flex-wrap justify-center', 'gap-0.5']"
      :data-pair="isPair || undefined"
    >
      <!-- The position is the key, because two people with no picture have the same source. -->
      <template v-for="(image, index) in shownImages" :key="index">
        <img
          v-if="image.src"
          :class="[
            isGroup ? 'image-count-multiple' : 'image-count-single',
            isPair && index === 1 && 'col-start-2 row-start-2',
            'picture-line block object-cover',
          ]"
          :src="image.src"
          :alt="isGroup ? '' : image.alt"
          @error="onImageError(image.src!)"
        />
        <div
          v-else
          :class="[
            isGroup ? 'image-count-multiple' : 'image-count-single',
            isPair && index === 1 && 'col-start-2 row-start-2',
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
 * The edge of a photo can have the same color as the background, so a photo has a faint line inside its edge. An outline
 * follows the corners and does not change the size. A tile with an initial has no line, because its fill is already
 * different from the background. See `avatar.usage.ts`.
 */
.picture-line {
  outline: 1px solid var(--comp-avatar-picture-line);
  outline-offset: -1px;
}

/*
 * The two tiles of a pair move to the center by `--pair-shift` on each axis. At the grid position, the rounded corners
 * leave a gap of about 7px to 9px on the diagonal. Each size sets the shift so that this gap is about 5px to 6px. See
 * `avatar.usage.ts`.
 */
[data-pair] > :first-child {
  translate: var(--pair-shift) var(--pair-shift);
}

[data-pair] > :last-child {
  translate: calc(var(--pair-shift) * -1) calc(var(--pair-shift) * -1);
}

/*
 * The `icon-*` size of the initial follows the side of its tile. In a group, the corner of the frame is the corner of a
 * tile plus the padding, so the two curves stay parallel.
 */
.img-container.xxs {
  @apply h-5 w-5 rounded-md;

  .image-count-single {
    @apply h-5 w-5 rounded-md icon-2.5;
  }

  /* No caller uses this grid, and its tiles have no room for an initial. */
  .image-count-multiple {
    @apply h-1 w-1 rounded-sm icon-0;
  }
}

.img-container.header {
  @apply h-8 w-8 rounded-lg;

  .image-count-single {
    @apply h-8 w-8 rounded-lg icon-3.5;
  }
}

/*
 * The avatar in the title of a secondary page. It has the size of `header`, and it can also show a grid. The padding
 * around the tiles of a grid is the same as in `xs` and `sm`.
 */
.img-container.title {
  @apply h-8 w-8 rounded-lg;
  --pair-shift: 0.5px;

  &.is-group {
    @apply rounded-[0.4375rem];
  }

  .image-count-single {
    @apply h-8 w-8 rounded-lg icon-3.5;
  }

  .image-count-multiple {
    @apply h-3 w-3 rounded-sm icon-2;
  }
}

.img-container.xs {
  @apply h-10 w-10 rounded-05xl;
  --pair-shift: 0.5px;

  &.is-group {
    @apply rounded-lg;
  }

  .image-count-single {
    @apply h-10 w-10 rounded-05xl icon-4.5;
  }

  .image-count-multiple {
    @apply h-4 w-4 rounded-[0.3125rem] icon-2.5;
  }
}

.img-container.sm {
  @apply h-12 w-12 rounded-xl;
  --pair-shift: 1px;

  &.is-group {
    @apply rounded-05xl;
  }

  .image-count-single {
    @apply h-12 w-12 rounded-xl icon-5.5;
  }

  .image-count-multiple {
    @apply h-5 w-5 rounded-[0.4375rem] icon-2.5;
  }
}

.img-container.lg {
  @apply h-16 w-16 rounded-2xl;
  --pair-shift: 1.5px;

  &.is-group {
    @apply rounded-xl;
  }

  .image-count-single {
    @apply h-16 w-16 rounded-2xl icon-7.25;
  }

  .image-count-multiple {
    @apply h-6.75 w-6.75 rounded-lg icon-3;
  }
}
</style>
