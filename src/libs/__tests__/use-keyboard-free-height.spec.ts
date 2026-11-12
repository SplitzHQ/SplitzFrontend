import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

import { useKeyboardFreeHeight } from "../use-keyboard-free-height";

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
    vi.unstubAllGlobals();
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
