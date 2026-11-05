import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toaster, type ToasterProps } from "vue-sonner";

import Sonner from "../Sonner.vue";

vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (key: string) => key }) }));

/** Mounts the host and returns the props that it gives to the toaster of vue-sonner. */
function mountHost(props: ToasterProps = {}) {
  const wrapper = mount(Sonner, { props });
  return { toaster: () => wrapper.getComponent(Toaster).props(), wrapper };
}

describe("Sonner", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("uses the theme of the page", () => {
    expect(mountHost().toaster().theme).toBe("light");

    document.documentElement.classList.add("dark");

    expect(mountHost().toaster().theme).toBe("dark");
  });

  it("follows a change of the page theme", async () => {
    const { toaster } = mountHost();

    document.documentElement.classList.add("dark");
    // A MutationObserver callback runs as a microtask.
    await Promise.resolve();
    await Promise.resolve();

    expect(toaster().theme).toBe("dark");
  });

  it("lets the caller set the theme", () => {
    expect(mountHost({ theme: "dark" }).toaster().theme).toBe("dark");
  });

  it("lets a toast swipe up and to the side, and lets the caller change this", () => {
    expect(mountHost().toaster().swipeDirections).toEqual(["top", "left", "right"]);
    expect(mountHost({ swipeDirections: ["top"] }).toaster().swipeDirections).toEqual(["top"]);
  });

  it("uses translated names for the region and the close button", () => {
    const { toaster } = mountHost({ toastOptions: { duration: 100 } });

    expect(toaster().containerAriaLabel).toBe("toast-region-label");
    expect(toaster().toastOptions).toEqual({ closeButtonAriaLabel: "toast-close", duration: 100 });
  });
});
