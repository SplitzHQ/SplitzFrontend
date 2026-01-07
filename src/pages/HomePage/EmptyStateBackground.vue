<script setup lang="ts">
import { PhAirplaneTilt, PhCar, PhForkKnife, PhHandCoins, PhReceipt, PhUsersThree } from "@phosphor-icons/vue";

import BackgroundCircle from "./BackgroundCircle.svg";

const bgUrl = `url("${BackgroundCircle}")`;
</script>

<template>
  <div class="relative size-90 shrink-0 bg-cover bg-center bg-no-repeat" :style="{ backgroundImage: bgUrl }">
    <!-- Category Icons with backdrop blur -->
    <div
      class="absolute z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-2 backdrop-blur-[2px]"
      :style="{ left: '19.7%', top: '26.6%' }"
    >
      <PhHandCoins weight="duotone" class="size-6 text-util-color-brand-500" />
    </div>
    <div
      class="absolute z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-1.5 backdrop-blur-[2px]"
      :style="{ left: '70.6%', top: '33.3%' }"
    >
      <PhForkKnife weight="duotone" class="size-4 text-util-color-brand-500" />
    </div>
    <div
      class="absolute z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-1.5 backdrop-blur-[2px]"
      :style="{ left: '7.1%', top: '44.4%' }"
    >
      <PhAirplaneTilt weight="duotone" class="size-4 text-util-color-brand-500" />
    </div>
    <div
      class="absolute z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-1.5 backdrop-blur-[2px]"
      :style="{ left: '85.7%', top: '51.4%' }"
    >
      <PhCar weight="duotone" class="size-4 text-util-color-brand-500" />
    </div>
    <div
      class="absolute z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-2 backdrop-blur-[2px]"
      :style="{ left: '22.1%', top: '60.6%' }"
    >
      <PhUsersThree weight="duotone" class="size-6 text-util-color-brand-500" />
    </div>
    <div
      class="absolute z-10 flex items-start rounded-lg bg-core-alpha-brand-10 p-2 backdrop-blur-[2px]"
      :style="{ left: '67.4%', top: '64.4%' }"
    >
      <PhReceipt weight="duotone" class="size-6 text-util-color-brand-500" />
    </div>
  </div>
</template>
