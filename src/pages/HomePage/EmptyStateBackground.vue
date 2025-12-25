<script setup lang="ts">
import { PhAirplane, PhCar, PhForkKnife, PhHandCoins, PhReceipt, PhUsersThree } from "@phosphor-icons/vue";

import BackgroundCircle from "./BackgroundCircle.svg";

const bgUrl = `url("${BackgroundCircle}")`;
</script>

<template>
  <div class="relative shrink-0 size-[120px]">
    <!-- Circle Background -->
    <div
      class="absolute left-1/2 size-[360px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 bg-center bg-no-repeat bg-cover"
      :style="{ backgroundImage: bgUrl }"
    />

    <!-- Category Icons with backdrop blur -->
    <div
      class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-1.5 rounded-lg left-[134.5px] top-0 z-10"
    >
      <PhForkKnife class="text-util-color-brand-700 size-4" />
    </div>
    <div
      class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-1.5 rounded-lg -left-[94.5px] top-10 z-10"
    >
      <PhAirplane class="text-util-color-brand-700 size-4" />
    </div>
    <div
      class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-2 rounded-lg -left-[40.5px] top-[98px] z-10"
    >
      <PhUsersThree class="text-util-color-brand-700 size-6" />
    </div>
    <div
      class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-2 rounded-lg -left-[49px] -top-6 z-10"
    >
      <PhHandCoins class="text-util-color-brand-700 size-6" />
    </div>
    <div
      class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-1.5 rounded-lg left-[188.5px] top-[65px] z-10"
    >
      <PhCar class="text-util-color-brand-700 size-4" />
    </div>
    <div
      class="absolute backdrop-blur-[2px] bg-core-alpha-brand-10 flex items-start p-2 rounded-lg left-[122.5px] top-[112px] z-10"
    >
      <PhReceipt class="text-util-color-brand-700 size-6" />
    </div>
  </div>
</template>
