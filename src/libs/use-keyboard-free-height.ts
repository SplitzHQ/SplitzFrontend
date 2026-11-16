import { onBeforeUnmount, onMounted, shallowRef, type ShallowRef } from "vue";

import { supportsInteractiveWidget } from "./supports-interactive-widget";

/** A smaller difference is not a keyboard, for example the address bar of a browser. */
const KEYBOARD_MIN_HEIGHT = 120;

/**
 * Returns the height of the part of the screen that the on-screen keyboard does not cover, in pixels. The value is
 * undefined when no keyboard shows or the browser supports `interactive-widget=resizes-content`. Supporting browsers
 * use `dvh` for native resizing. Other browsers use this value as their minimum height to keep actions above the keyboard.
 */
export function useKeyboardFreeHeight(): ShallowRef<number | undefined> {
  const height = shallowRef<number>();
  let fallbackViewport: VisualViewport | undefined;

  /** Reads the visual viewport, which gets smaller when the keyboard opens. */
  function update(): void {
    const viewport = window.visualViewport;
    if (!viewport) return;
    height.value = window.innerHeight - viewport.height >= KEYBOARD_MIN_HEIGHT ? viewport.height : undefined;
  }

  onMounted(() => {
    if (supportsInteractiveWidget(navigator.userAgent)) return;
    fallbackViewport = window.visualViewport ?? undefined;
    update();
    fallbackViewport?.addEventListener("resize", update);
  });

  onBeforeUnmount(() => {
    fallbackViewport?.removeEventListener("resize", update);
  });

  return height;
}
