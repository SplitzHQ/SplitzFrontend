import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Router } from "vue-router";

import { getPageScrollState, usePageTransition } from "../page-transition";

/** Minimal router stub capturing the registered `afterEach` callback. */
function createMockRouter() {
  let afterEachHook: (() => void) | undefined;
  const router = {
    afterEach: (callback: () => void) => {
      afterEachHook = callback;
    },
  } as unknown as Router;
  return { navigate: () => afterEachHook?.(), router };
}

/** Writes Vue Router's `position` and `scroll` fields into `window.history.state`. */
function setHistoryEntry(position: number, scrollTop: number | null): void {
  history.replaceState({ position, scroll: scrollTop === null ? null : { left: 0, top: scrollTop } }, "");
}

/** Appends a `.page` wrapper element matching `App.vue`'s transition container. */
function appendPageElement(): HTMLElement {
  const element = document.createElement("div");
  element.className = "page";
  document.body.append(element);
  return element;
}

/** Invokes a single `<Transition>` lifecycle hook (typed by Vue as a function or function array). */
function invokeTransitionHook(hook: unknown, element: Element): void {
  (hook as (el: Element) => void)(element);
}

describe("usePageTransition", () => {
  beforeEach(() => {
    setHistoryEntry(1, null);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("slides forward on history push and back on history pop", () => {
    const { navigate, router } = createMockRouter();
    const { direction } = usePageTransition(router);

    setHistoryEntry(2, null);
    navigate();
    expect(direction.value).toBe("forward");

    setHistoryEntry(1, 300);
    navigate();
    expect(direction.value).toBe("back");
  });

  it("pins the outgoing page as a fixed layer at its current window scroll offset", () => {
    const { router } = createMockRouter();
    const { hooks } = usePageTransition(router);
    const outgoingPage = appendPageElement();
    const childInsidePage = document.createElement("div");
    outgoingPage.append(childInsidePage);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(240);

    expect(getPageScrollState(childInsidePage)).toEqual({ isPinned: false, scrollTop: 240 });

    invokeTransitionHook(hooks.onBeforeLeave, outgoingPage);

    expect(outgoingPage.style.position).toBe("fixed");
    expect(outgoingPage.style.overflow).toBe("hidden");
    expect(outgoingPage.scrollTop).toBe(240);
    expect(getPageScrollState(childInsidePage)).toEqual({ isPinned: true, scrollTop: 240 });
  });

  it("starts forward navigations at the top and restores saved scroll offsets on back navigations", () => {
    const { navigate, router } = createMockRouter();
    const { hooks } = usePageTransition(router);

    setHistoryEntry(2, null);
    navigate();
    const incomingPage = appendPageElement();
    invokeTransitionHook(hooks.onEnter, incomingPage);
    invokeTransitionHook(hooks.onAfterEnter, incomingPage);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ behavior: "instant", top: 0 });

    setHistoryEntry(1, 300);
    navigate();
    const restoredPage = appendPageElement();
    invokeTransitionHook(hooks.onEnter, restoredPage);
    expect(restoredPage.style.position).toBe("fixed");
    invokeTransitionHook(hooks.onAfterEnter, restoredPage);
    expect(restoredPage.style.position).toBe("");
    expect(window.scrollTo).toHaveBeenLastCalledWith({ behavior: "instant", top: 300 });
  });

  it("unpins the incoming page when an enter transition is cancelled early", () => {
    const { router } = createMockRouter();
    const { hooks } = usePageTransition(router);
    const incomingPage = appendPageElement();

    invokeTransitionHook(hooks.onEnter, incomingPage);
    invokeTransitionHook(hooks.onEnterCancelled, incomingPage);

    expect(incomingPage.style.position).toBe("");
    expect(incomingPage.style.inset).toBe("");
  });
});
