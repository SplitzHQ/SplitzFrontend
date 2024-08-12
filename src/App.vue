<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav class="flex items-center gap-2">
      <RouterLink to="/" class="rounded bg-core-color-leaf-900 px-2 py-1">Home</RouterLink>
      <RouterLink to="/about" class="rounded bg-core-color-leaf-900 px-2 py-1">About</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped></style>
