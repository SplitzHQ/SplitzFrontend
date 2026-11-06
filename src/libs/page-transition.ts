import { shallowRef, type TransitionProps } from "vue";
import type { Router } from "vue-router";

/**
 * The change between two pages of the app. The new page slides in from the right over the old page, and the
 * old page moves 30% to the left, as on iOS. A back navigation plays the same motion in reverse. The user picked this
 * look in the prototype `2026-11-05-home-motion`. The classes are in `App.vue`.
 *
 * The window scrolls the page, so two pages cannot both scroll it while they move. During the motion each page is a
 * fixed layer of the size of the screen and scrolls itself: the old page keeps the place where the person left it, and
 * the new page starts at the top, or at its saved place after a back navigation. A fixed child, for example the plus
 * button, stays in its place, because the layer is its containing block. After the motion the new page goes back into
 * the flow and the window gets its scroll position.
 */

/** The direction of a page change. */
export type PageDirection = "forward" | "back";

/** The fields that vue-router writes to the history state of each entry. */
interface RouterHistoryState {
  position?: number;
  /** The scroll position of the entry when the person left it with a push. */
  scroll?: { left: number; top: number } | null;
}

const routerState = () => (history.state ?? {}) as RouterHistoryState;

/** Makes a page a fixed layer of the size of the screen that shows its content from `top`. */
function freeze(el: Element, top: number): void {
  const page = el as HTMLElement;
  Object.assign(page.style, { inset: "0", overflow: "hidden", position: "fixed" });
  page.scrollTop = top;
}

/** Puts a page back into the flow. */
function release(el: Element): void {
  const page = el as HTMLElement;
  page.style.removeProperty("inset");
  page.style.removeProperty("overflow");
  page.style.removeProperty("position");
}

/**
 * Returns the name of the transition for the current page change and the hooks that keep the scroll positions. Call it
 * once, in `App.vue`.
 */
export function usePageTransition(router: Router) {
  const direction = shallowRef<PageDirection>("forward");
  let lastPosition = routerState().position ?? 0;
  /** The place of the new page, read when the change starts. */
  let enterTop = 0;

  // The position grows with each push and goes down with each back step. A replace keeps it and counts as forward.
  router.afterEach(() => {
    const position = routerState().position ?? 0;
    direction.value = position < lastPosition ? "back" : "forward";
    lastPosition = position;
  });

  const hooks: TransitionProps = {
    onAfterEnter: (el) => {
      release(el);
      window.scrollTo({ behavior: "instant", top: enterTop });
    },
    onBeforeLeave: (el) => {
      // This hook runs before the new page is in the document, so the window still has the place of the old page.
      freeze(el, window.scrollY);
    },
    onEnter: (el) => {
      enterTop = direction.value === "back" ? (routerState().scroll?.top ?? 0) : 0;
      freeze(el, enterTop);
    },
    onEnterCancelled: release,
  };

  return { direction, hooks };
}
