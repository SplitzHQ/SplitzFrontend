<script setup lang="ts">
import { PhAirplaneTilt, PhCar, PhForkKnife, PhHandCoins, PhReceipt, PhUsersThree } from "@phosphor-icons/vue";

import BackgroundCircle from "./BackgroundCircle.svg";

/**
 * The art of the home page for a person with no groups: the rings and six category icons. The user picked this look in
 * the prototype `2026-11-05-home-empty-state` (option B of the art, "圆环淡出").
 *
 * The art shows through a window that has the full width of the screen. The top and the bottom of the window fade out,
 * and the window cuts the sides of the rings, so the page never scrolls sideways. The window gets lower on a short
 * screen, and the picture scales with it, so the icons and the rings stay one image.
 *
 * The caller must put the component in a column with a side margin of `mx-4`, because the window goes out of that
 * margin to reach the edges of the screen.
 */

const bgUrl = `url("${BackgroundCircle}")`;

/** The share of the picture width for each icon box and icon. The picture was drawn at 360 wide. */
const SIZES = {
  big: { box: "11.11cqw", icon: "6.67cqw" },
  small: { box: "7.78cqw", icon: "4.44cqw" },
};

/** The icons in the picture. `left` and `top` are the place of the top-left corner of each box. */
const ICONS = [
  { icon: PhHandCoins, left: "19.7%", size: SIZES.big, top: "26.6%" },
  { icon: PhForkKnife, left: "70.6%", size: SIZES.small, top: "33.3%" },
  { icon: PhAirplaneTilt, left: "7.1%", size: SIZES.small, top: "44.4%" },
  { icon: PhCar, left: "85.7%", size: SIZES.small, top: "51.4%" },
  { icon: PhUsersThree, left: "22.1%", size: SIZES.big, top: "60.6%" },
  { icon: PhReceipt, left: "67.4%", size: SIZES.big, top: "64.4%" },
];
</script>

<template>
  <div
    class="art-window -mx-4 flex shrink-0 items-center justify-center self-stretch overflow-hidden"
    aria-hidden="true"
  >
    <div
      class="art relative aspect-square shrink-0 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: bgUrl }"
    >
      <div
        v-for="item in ICONS"
        :key="item.left"
        class="absolute z-10 flex items-center justify-center rounded-[2.22cqw] bg-core-alpha-brand-10 backdrop-blur-[2px]"
        :style="{ height: item.size.box, left: item.left, top: item.top, width: item.size.box }"
      >
        <component
          :is="item.icon"
          weight="duotone"
          class="text-util-color-brand-500"
          :style="{ height: item.size.icon, width: item.size.icon }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * The window height has a cap in rem and a cap in `dvh`. The `dvh` cap keeps the text and the buttons on the first
 * screen of a short phone. The mask fades the top and the bottom of the window.
 *
 * The negative margins take the faded rings out of the layout box. With the picture at its size in `.art`, the top of
 * the highest icon (PhHandCoins) is 0.117 of the window height from the top, and the bottom of the lowest icon
 * (PhReceipt) is 0.082 from the bottom. So the layout box starts and ends at the icons, and a gap above or under the
 * art is the gap that the eye sees. The faint rings past the icons go into those gaps. Change these two numbers when
 * an icon moves or the picture gets another size.
 */
.art-window {
  --art-window-height: min(13.75rem, 30dvh);

  height: var(--art-window-height);
  margin-top: calc(var(--art-window-height) * -0.117);
  margin-bottom: calc(var(--art-window-height) * -0.082);
  mask-image: linear-gradient(to bottom, transparent, black 18%, black 82%, transparent);
}

/*
 * The picture is 1.636 times the window height (360 / 220, its old size over the old window), so at the largest window
 * it keeps its old size. The picture is the size container, so the `cqw` values of the icons read its width.
 */
.art {
  width: calc(var(--art-window-height) * 1.636);
  container-type: inline-size;
}
</style>
