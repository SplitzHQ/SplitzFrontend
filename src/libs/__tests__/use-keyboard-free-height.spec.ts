import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

import { useKeyboardFreeHeight } from "../use-keyboard-free-height";

enableAutoUnmount(afterEach);

/** Installs a visual viewport with this height. jsdom has none. */
function stubViewport(height: number) {
  const viewport = Object.assign(new EventTarget(), { height });
  vi.stubGlobal("visualViewport", viewport);
  return viewport;
}

/** Mounts a component that exposes the height of the composable. */
function mountProbe() {
  let result: ReturnType<typeof useKeyboardFreeHeight> | undefined;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useKeyboardFreeHeight();
        return () => h("div");
      },
    })
  );
  return { height: result!, wrapper };
}

describe("useKeyboardFreeHeight", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    ["Chrome on Android", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/108.0.0.0 Mobile Safari/537.36"],
    ["Firefox on Android", "Mozilla/5.0 (Android 13; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0"],
    [
      "Samsung Internet",
      "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 SamsungBrowser/21.0 Chrome/110.0.0.0 Mobile Safari/537.36",
    ],
    [
      "Opera on Android",
      "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/108.0.0.0 Mobile Safari/537.36 OPR/73.0.0.0",
    ],
    [
      "Safari with native support",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 27_3 like Mac OS X) AppleWebKit/605.1.15 Version/27.3 Mobile/15E148 Safari/604.1",
    ],
  ])("leaves sizing to %s without subscribing to resize", (_name, userAgent) => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
    const viewport = stubViewport(window.innerHeight - 300);
    const subscribe = vi.spyOn(viewport, "addEventListener");
    const { height } = mountProbe();

    expect(height.value).toBeUndefined();
    expect(subscribe).not.toHaveBeenCalled();
    viewport.dispatchEvent(new Event("resize"));
    expect(height.value).toBeUndefined();
  });

  it.each([
    ["older Chrome", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/107.0.0.0 Mobile Safari/537.36"],
    ["older Firefox", "Mozilla/5.0 (Android 13; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0"],
    [
      "Safari before native support",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 27_2 like Mac OS X) AppleWebKit/605.1.15 Version/27.2 Mobile/15E148 Safari/604.1",
    ],
    [
      "Chrome on unsupported iOS",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/140.0.0.0 Mobile/15E148 Safari/604.1",
    ],
    ["unknown browser", "UnknownBrowser/200"],
  ])("keeps the keyboard fallback on %s", (_name, userAgent) => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
    const viewport = stubViewport(window.innerHeight);
    const { height } = mountProbe();

    viewport.height -= 300;
    viewport.dispatchEvent(new Event("resize"));
    expect(height.value).toBe(window.innerHeight - 300);
  });

  it("stops updating after the fallback is unmounted", () => {
    const viewport = stubViewport(window.innerHeight);
    const { height, wrapper } = mountProbe();
    wrapper.unmount();

    viewport.height -= 300;
    viewport.dispatchEvent(new Event("resize"));
    expect(height.value).toBeUndefined();
  });

  it("has no value without a keyboard", () => {
    stubViewport(window.innerHeight);
    expect(mountProbe().height.value).toBeUndefined();
  });

  it("gives the free height when the keyboard opens, and no value when it closes", () => {
    const viewport = stubViewport(window.innerHeight);
    const { height } = mountProbe();

    viewport.height = window.innerHeight - 300;
    viewport.dispatchEvent(new Event("resize"));
    expect(height.value).toBe(window.innerHeight - 300);

    viewport.height = window.innerHeight;
    viewport.dispatchEvent(new Event("resize"));
    expect(height.value).toBeUndefined();
  });

  it("ignores a small change, such as the address bar", () => {
    stubViewport(window.innerHeight - 60);
    expect(mountProbe().height.value).toBeUndefined();
  });

  it("works in a browser with no visual viewport", () => {
    vi.stubGlobal("visualViewport", undefined);
    expect(mountProbe().height.value).toBeUndefined();
  });
});
