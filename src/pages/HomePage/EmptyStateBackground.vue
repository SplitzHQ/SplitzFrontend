<script setup lang="ts">
import { PhAirplane, PhCar, PhForkKnife, PhHandCoins, PhReceipt, PhUsersThree } from "@phosphor-icons/vue";

import BackgroundCircle from "./BackgroundCircle.svg";

const bgUrl = `url("${BackgroundCircle}")`;
</script>

<template>
  <div class="relative size-[120px] shrink-0">
    <!-- Circle Background -->
    <div
      class="absolute top-1/2 left-1/2 z-0 size-[360px] -translate-x-1/2 -translate-y-1/2 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: bgUrl }"
    />

    <!-- Category Icons with backdrop blur -->
    <div
      class="absolute top-0 left-[134.5px] z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-1.5 backdrop-blur-[2px]"
    >
      <PhForkKnife class="size-4 text-util-color-brand-700" />
    </div>
    <div
      class="absolute top-10 -left-[94.5px] z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-1.5 backdrop-blur-[2px]"
    >
      <PhAirplane class="size-4 text-util-color-brand-700" />
    </div>
    <div
      class="absolute top-[98px] -left-[40.5px] z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-2 backdrop-blur-[2px]"
    >
      <PhUsersThree class="size-6 text-util-color-brand-700" />
    </div>
    <div
      class="absolute -top-6 -left-[49px] z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-2 backdrop-blur-[2px]"
    >
      <PhHandCoins class="size-6 text-util-color-brand-700" />
    </div>
    <div
      class="absolute top-[65px] left-[188.5px] z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-1.5 backdrop-blur-[2px]"
    >
      <PhCar class="size-4 text-util-color-brand-700" />
    </div>
    <div
      class="absolute top-[112px] left-[122.5px] z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-2 backdrop-blur-[2px]"
    >
      <PhReceipt class="size-6 text-util-color-brand-700" />
    </div>
  </div>
</template>
