import { shallowRef, type ShallowRef, type TransitionProps } from "vue";
import type { Router } from "vue-router";

/**
 * Directional iOS-style slide transitions between full-screen routes.
 * Advancing slides the incoming page in from the right over the outgoing page while shifting the outgoing page 30%
 * left; navigating back plays the reverse. Matching CSS classes live in `App.vue`.
 *
 * Because `window` can only hold one scroll offset at a time, both the outgoing and incoming `.page` wrappers are
 * temporarily pinned as viewport-sized `position: fixed` containers during the transition: the outgoing page preserves
 * the user's scroll position, and the incoming page starts at `0` on forward navigation or at its saved history offset
 * on back navigation. Fixed descendants (such as floating action buttons) stay anchored because the transformed `.page`
 * wrapper acts as their containing block. Once the enter transition finishes, the incoming page returns to normal
 * document flow and `window` receives its scroll offset.
 */

/** Navigation direction driving the active `<Transition>` class prefix (`page-forward` or `page-back`). */
export type PageDirection = "forward" | "back";

/** Scroll state of a page, accounting for pinned layers during an active route transition. */
export interface PageScrollState {
  /** `true` while the enclosing `.page` wrapper is pinned as `position: fixed` mid-transition. */
  isPinned: boolean;
  /** Effective vertical scroll offset in pixels. */
  scrollTop: number;
}

/** Reactive transition direction and `<Transition>` lifecycle hooks returned by `usePageTransition`. */
export interface UsePageTransitionReturn {
  direction: ShallowRef<PageDirection>;
  hooks: TransitionProps;
}

/** Subset of `window.history.state` managed by Vue Router for each history entry. */
interface RouterHistoryState {
  position?: number;
  /** Window scroll coordinates recorded by Vue Router before leaving the entry. */
  scroll?: { left: number; top: number } | null;
}

const readRouterHistoryState = (): RouterHistoryState => (history.state ?? {}) as RouterHistoryState;

/** Pins a `.page` wrapper to the viewport and locks its internal scroll offset to `scrollTop`. */
function pinPageLayer(element: Element, scrollTop: number): void {
  const pageElement = element as HTMLElement;
  Object.assign(pageElement.style, { inset: "0", overflow: "hidden", position: "fixed" });
  pageElement.scrollTop = scrollTop;
}

/** Restores a `.page` wrapper back to normal document flow. */
function unpinPageLayer(element: Element): void {
  const pageElement = element as HTMLElement;
  pageElement.style.removeProperty("inset");
  pageElement.style.removeProperty("overflow");
  pageElement.style.removeProperty("position");
}

/**
 * Reads the effective vertical scroll offset for `element`.
 * While `usePageTransition` pins the enclosing `.page` wrapper as `position: fixed`, `window.scrollY` is inactive
 * and the pinned `.page` element holds its own `scrollTop` instead.
 */
export function getPageScrollState(element: Element | null | undefined): PageScrollState {
  const pageElement = element?.closest<HTMLElement>(".page");
  if (pageElement?.style.position === "fixed") {
    return { isPinned: true, scrollTop: pageElement.scrollTop };
  }
  return { isPinned: false, scrollTop: window.scrollY };
}

/**
 * Tracks route navigation direction and provides `<Transition>` hooks that preserve scroll positions across slides.
 * Call once in `App.vue`.
 */
export function usePageTransition(router: Router): UsePageTransitionReturn {
  const direction = shallowRef<PageDirection>("forward");
  let previousHistoryPosition = readRouterHistoryState().position ?? 0;
  let enteringScrollTop = 0;

  // Vue Router increments `position` on `push` and decrements it on `back`; `replace` keeps `position` unchanged and slides forward.
  router.afterEach(() => {
    const currentPosition = readRouterHistoryState().position ?? 0;
    direction.value = currentPosition < previousHistoryPosition ? "back" : "forward";
    previousHistoryPosition = currentPosition;
  });

  const hooks: TransitionProps = {
    onAfterEnter: (element) => {
      unpinPageLayer(element);
      window.scrollTo({ behavior: "instant", top: enteringScrollTop });
    },
    onBeforeLeave: (element) => {
      // Runs before the incoming page mounts, while `window.scrollY` still reflects the outgoing page.
      pinPageLayer(element, window.scrollY);
    },
    onEnter: (element) => {
      enteringScrollTop = direction.value === "back" ? (readRouterHistoryState().scroll?.top ?? 0) : 0;
      pinPageLayer(element, enteringScrollTop);
    },
    onEnterCancelled: unpinPageLayer,
  };

  return { direction, hooks };
}
