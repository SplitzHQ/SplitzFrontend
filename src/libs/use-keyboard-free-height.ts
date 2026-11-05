import { onBeforeUnmount, onMounted, shallowRef, type ShallowRef } from "vue";

/** A smaller difference is not a keyboard, for example the address bar of a browser. */
const KEYBOARD_MIN_HEIGHT = 120;

/**
 * Returns the height of the part of the screen that the on-screen keyboard does not cover, in pixels. The value is
 * undefined when no keyboard shows. `dvh` does not change when the keyboard opens, so a page that keeps its action at the
 * bottom uses this value as its minimum height. The action then stays above the keyboard.
 */
export function useKeyboardFreeHeight(): ShallowRef<number | undefined> {
  const height = shallowRef<number>();

  /** Reads the visual viewport, which gets smaller when the keyboard opens. */
  function update(): void {
    const viewport = window.visualViewport;
    if (!viewport) return;
    height.value = window.innerHeight - viewport.height >= KEYBOARD_MIN_HEIGHT ? viewport.height : undefined;
  }

  onMounted(() => {
    update();
    window.visualViewport?.addEventListener("resize", update);
  });

  onBeforeUnmount(() => {
    window.visualViewport?.removeEventListener("resize", update);
  });

  return height;
}
