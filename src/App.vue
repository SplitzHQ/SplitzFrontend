<script setup lang="ts">
import { RouterView } from "vue-router";
import "vue-sonner/style.css";
import ReloadPrompt from "@/components/ReloadPrompt/ReloadPrompt.vue";
import Sonner from "@/components/Sonner/Sonner.vue";
</script>

<template>
  <RouterView />
  <Sonner position="top-center" close-button />
  <ReloadPrompt />
</template>
