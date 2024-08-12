<script setup lang="ts">
import { ref } from 'vue'

const msg = 'splitz'
const counter = ref(0)
const increment = () => counter.value++
</script>

<template>
  <main>
    <div class="bg-util-color-leaf-300 text-sm text-util-color-forest-700">{{ msg }}</div>
    <div class="bg-util-color-forest-700 text-util-color-leaf-300">{{ counter }}</div>
    <button @click="increment">Increment</button>
  </main>
</template>
