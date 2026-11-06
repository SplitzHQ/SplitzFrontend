import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Router } from "vue-router";

import { usePageTransition } from "../page-transition";

/** A router that only keeps the `afterEach` hook, which the page change reads. */
function fakeRouter() {
  let hook: (() => void) | undefined;
  const router = {
    afterEach: (callback: () => void) => {
      hook = callback;
    },
  } as unknown as Router;
  return { navigate: () => hook?.(), router };
}

/** Sets the history state that vue-router writes for the current entry. */
function setEntry(position: number, scrollTop: number | null): void {
  history.replaceState({ position, scroll: scrollTop === null ? null : { left: 0, top: scrollTop } }, "");
}

/** Returns a page element, as `App.vue` renders it. */
function page(): HTMLElement {
  const el = document.createElement("div");
  el.className = "page";
  document.body.append(el);
  return el;
}

/** Calls a hook of the transition, which Vue types as a hook or a list of hooks. */
function call(hook: unknown, el: Element): void {
  (hook as (el: Element) => void)(el);
}

describe("usePageTransition", () => {
  beforeEach(() => {
    setEntry(1, null);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("goes forward on a push and back on a back step", () => {
    const { navigate, router } = fakeRouter();
    const { direction } = usePageTransition(router);

    setEntry(2, null);
    navigate();
    expect(direction.value).toBe("forward");

    setEntry(1, 300);
    navigate();
    expect(direction.value).toBe("back");
  });

  it("keeps the old page where the person left it, as a fixed layer", () => {
    const { router } = fakeRouter();
    const { hooks } = usePageTransition(router);
    const old = page();
    vi.spyOn(window, "scrollY", "get").mockReturnValue(240);

    call(hooks.onBeforeLeave, old);

    expect(old.style.position).toBe("fixed");
    expect(old.style.overflow).toBe("hidden");
    expect(old.scrollTop).toBe(240);
  });

  it("opens a new page at the top, and a page after a back step at its saved place", () => {
    const { navigate, router } = fakeRouter();
    const { hooks } = usePageTransition(router);

    setEntry(2, null);
    navigate();
    const next = page();
    call(hooks.onEnter, next);
    call(hooks.onAfterEnter, next);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ behavior: "instant", top: 0 });

    setEntry(1, 300);
    navigate();
    const earlier = page();
    call(hooks.onEnter, earlier);
    expect(earlier.style.position).toBe("fixed");
    call(hooks.onAfterEnter, earlier);
    expect(earlier.style.position).toBe("");
    expect(window.scrollTo).toHaveBeenLastCalledWith({ behavior: "instant", top: 300 });
  });

  it("puts a page back into the flow when its change stops early", () => {
    const { router } = fakeRouter();
    const { hooks } = usePageTransition(router);
    const next = page();

    call(hooks.onEnter, next);
    call(hooks.onEnterCancelled, next);

    expect(next.style.position).toBe("");
    expect(next.style.inset).toBe("");
  });
});
