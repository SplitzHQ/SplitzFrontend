import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, shallowRef } from "vue";

import { defaultStatusBarLeadMs, useStatusBarColor, useStatusBarDim, useStatusBarTopColor } from "../status-bar-color";

const PAGE = "rgb(249, 251, 250)";
/** Black at 40% over the page color. */
const DIMMED = "rgb(149, 151, 150)";
/** Black at 40% twice over the page color. */
const DIMMED_TWICE = "rgb(90, 90, 90)";
const TOP = "rgb(242, 245, 244)";

function themeColor(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content;
}

/** The invisible layer that iOS 27 reads. It is the fixed element with a filter. */
function tint(): HTMLElement | undefined {
  return [...document.body.querySelectorAll<HTMLElement>("[aria-hidden='true']")].find((element) =>
    element.style.filter.includes("opacity")
  );
}

describe("status bar color", () => {
  let scope: ReturnType<typeof effectScope>;

  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    document.head.innerHTML = "";
    document.documentElement.style.setProperty("--base-bg-primary", "#f9fbfa");
    document.documentElement.style.setProperty("--base-bg-secondary_alt", "#f2f5f4");
    document.documentElement.style.setProperty("--base-bg-scrim", "#00000066");
    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
    vi.unstubAllGlobals();
  });

  it("uses the page background when no backdrop shows", () => {
    scope.run(() => useStatusBarColor());
    expect(themeColor()).toBe(PAGE);
    expect(tint()?.style.display).toBe("none");
  });

  it("sets the first color before it turns on the fade, so the bar does not start from transparent", () => {
    scope.run(() => useStatusBarColor());
    const fadeSource = document.body.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(themeColor()).toBe(PAGE);
    expect(fadeSource?.style.transition).toContain("background-color");
  });

  it("dims the bar while a backdrop shows, and restores it", async () => {
    const open = shallowRef(false);
    scope.run(() => {
      useStatusBarColor();
      useStatusBarDim(open);
    });

    open.value = true;
    await nextTick();
    await nextTick();
    expect(themeColor()).toBe(DIMMED);
    expect(tint()?.style.display).toBe("block");
    expect(tint()?.style.backgroundColor).toBe(DIMMED);

    open.value = false;
    await nextTick();
    await nextTick();
    expect(themeColor()).toBe(PAGE);
    expect(tint()?.style.display).toBe("none");
  });

  it("dims again for a second backdrop, and shows the layer again so that iOS reads the new color", async () => {
    const first = shallowRef(true);
    const second = shallowRef(false);
    scope.run(() => {
      useStatusBarColor();
      useStatusBarDim(first);
      useStatusBarDim(second);
    });
    await nextTick();
    await nextTick();
    expect(themeColor()).toBe(DIMMED);

    second.value = true;
    await nextTick();
    await nextTick();
    expect(themeColor()).toBe(DIMMED_TWICE);
    expect(tint()?.style.display).toBe("block");
    expect(tint()?.style.backgroundColor).toBe(DIMMED_TWICE);
  });

  it("starts the fade of the tag on the frame where a Vue transition starts", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    const open = shallowRef(false);
    scope.run(() => {
      useStatusBarColor();
      useStatusBarDim(open);
    });

    open.value = true;
    await nextTick();
    await nextTick();
    expect(themeColor()).toBe(PAGE);
    expect(tint()?.style.display).toBe("block");

    frames.shift()?.(0);
    expect(themeColor()).toBe(PAGE);

    frames.shift()?.(0);
    expect(themeColor()).toBe(DIMMED);
  });

  it("starts the fade sooner only in a Home Screen app on iOS", () => {
    expect(defaultStatusBarLeadMs()).toBe(0);
    vi.stubGlobal("navigator", { standalone: false });
    expect(defaultStatusBarLeadMs()).toBe(0);
    vi.stubGlobal("navigator", { standalone: true });
    expect(defaultStatusBarLeadMs()).toBe(20);
  });

  it("follows a change of the theme", async () => {
    scope.run(() => useStatusBarColor());
    document.documentElement.style.setProperty("--base-bg-primary", "#111312");
    document.documentElement.classList.add("dark");
    await vi.waitFor(() => expect(themeColor()).toBe("rgb(17, 19, 18)"));
    document.documentElement.classList.remove("dark");
  });

  it("uses the top color of a page only while the page exists", async () => {
    scope.run(() => useStatusBarColor());
    const pageScope = effectScope();
    pageScope.run(() => useStatusBarTopColor("--base-bg-secondary_alt"));
    await nextTick();
    await nextTick();
    expect(themeColor()).toBe(TOP);
    expect(document.body.style.backgroundColor).toBe("var(--base-bg-secondary_alt)");

    pageScope.stop();
    await nextTick();
    await nextTick();
    expect(themeColor()).toBe(PAGE);
    expect(document.body.style.backgroundColor).toBe("");
  });

  it("removes what it added when it stops", () => {
    scope.run(() => useStatusBarColor());
    scope.stop();
    expect(themeColor()).toBeUndefined();
    expect(tint()).toBeUndefined();
  });

  it("keeps a theme-color tag that the page already had", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#f9fbfa" />';
    scope.run(() => useStatusBarColor());
    scope.stop();
    expect(themeColor()).toBeDefined();
  });
});
