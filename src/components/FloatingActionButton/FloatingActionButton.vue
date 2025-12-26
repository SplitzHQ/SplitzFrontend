<script setup lang="ts">
import { PhPlus } from "@phosphor-icons/vue";
import { onMounted, onUnmounted, ref, watch } from "vue";

import SIconButton from "@/components/SButton/SIconButton.vue";

interface Props {
  /**
   * Reference to the element that should hide the floating button when visible
   * If not provided, the button will always be visible
   */
  hideWhenVisible?: HTMLElement | null;
}

interface Emits {
  click: [];
}

const props = withDefaults(defineProps<Props>(), {
  hideWhenVisible: null
});

const emit = defineEmits<Emits>();

const isTargetVisible = ref(false);
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  // If no target element is specified, button should always be visible
  if (!props.hideWhenVisible) {
    isTargetVisible.value = false;
    return;
  }

  // Clean up existing observer
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isTargetVisible.value = entry.isIntersecting;
      });
    },
    {
      threshold: 0.1 // Trigger when at least 10% is visible
    }
  );

  observer.observe(props.hideWhenVisible);
};

const cleanup = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

// Watch for changes to hideWhenVisible prop
watch(() => props.hideWhenVisible, setupObserver, { immediate: false });

onMounted(() => {
  setupObserver();
});

onUnmounted(() => {
  cleanup();
});

const handleClick = () => {
  emit("click");
};
</script>

<template>
  <Transition name="fade">
    <SIconButton
      v-if="!isTargetVisible"
      variant="primary"
      color="brand"
      size="xxl"
      class="fixed right-5 bottom-10 shadow-lg z-10"
      @click="handleClick"
    >
      <PhPlus />
    </SIconButton>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
