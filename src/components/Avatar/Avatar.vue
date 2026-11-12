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
  /** See `SIZE_GUIDE` in `avatar.usage.ts` for when to use each size. `header` is only for the home header. */
  size: "xxs" | "xs" | "sm" | "lg" | "header";
}

/** The grid has room for this number of pictures. Callers can pass all the members of a group. */
const MAX_GRID_IMAGES = 4;

/** The classes of one avatar size. */
interface SizeClasses {
  /** The frame of one picture. */
  frame: string;
  /** The frame of a grid. */
  groupFrame: string;
  /** The picture or the tile when the avatar has one picture. */
  single: string;
  /** Each picture or tile in a grid. */
  multiple: string;
}

/*
 * The `icon-*` size of the initial follows the side of its tile. In a grid, the corner of the frame is the corner of a
 * tile plus the padding, so the two curves stay parallel. The `xxs` grid has no caller, and its tiles have no room for an
 * initial. The `header` size shows only one picture, so it has no grid classes.
 */
const SIZE_CLASSES: Record<AvatarProps["size"], SizeClasses> = {
  header: {
    frame: "size-8 rounded-lg",
    groupFrame: "size-8 rounded-lg",
    multiple: "",
    single: "size-8 rounded-lg icon-3.5",
  },
  lg: {
    frame: "size-16 rounded-2xl",
    groupFrame: "size-16 rounded-xl",
    multiple: "size-6.75 rounded-lg icon-3",
    single: "size-16 rounded-2xl icon-7.25",
  },
  sm: {
    frame: "size-12 rounded-xl",
    groupFrame: "size-12 rounded-05xl",
    multiple: "size-5 rounded-[0.4375rem] icon-2.5",
    single: "size-12 rounded-xl icon-5.5",
  },
  xs: {
    frame: "size-10 rounded-05xl",
    groupFrame: "size-10 rounded-lg",
    multiple: "size-4 rounded-[0.3125rem] icon-2.5",
    single: "size-10 rounded-05xl icon-4.5",
  },
  xxs: {
    frame: "size-5 rounded-md",
    groupFrame: "size-5 rounded-md",
    multiple: "size-1 rounded-sm icon-0",
    single: "size-5 rounded-md icon-2.5",
  },
};

/*
 * The edge of a photo can have the same color as the background, so a photo has a faint line inside its edge. An outline
 * follows the corners and does not change the size. A tile with an initial has no line, because its fill is already
 * different from the background. See `avatar.usage.ts`.
 */
const PICTURE_LINE_CLASS =
  "outline -outline-offset-1 outline-core-alpha-black-5 in-[.dark]:outline-core-alpha-white-10";

const { images, size } = defineProps<AvatarProps>();

const failedSources = shallowReactive(new Set<string>());

const isGroup = computed(() => images.length > 1);

const sizeClasses = computed(() => SIZE_CLASSES[size]);
/** The classes of each picture or tile. */
const tileClass = computed(() => (isGroup.value ? sizeClasses.value.multiple : sizeClasses.value.single));

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
      isGroup ? sizeClasses.groupFrame : sizeClasses.frame,
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
          :class="[tileClass, PICTURE_LINE_CLASS, 'block object-cover']"
          :src="image.src"
          :alt="isGroup ? '' : image.alt"
          @error="onImageError(image.src!)"
        />
        <div
          v-else
          :class="[tileClass, 'flex items-center justify-center leading-none font-semibold select-none']"
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
