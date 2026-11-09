import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createMemoryHistory, createRouter, type RouteLocationRaw } from "vue-router";

import { useRouterHistoryStore } from "@/stores/routing-history";

import HeaderMobileSecondary from "../Mobile/Secondary/HeaderMobileSecondary.vue";

const BACK = '[aria-label="header-back"]';
const CLOSE = '[aria-label="header-close"]';

/** Writes the fields that vue-router keeps in the history state of an entry. */
function setHistoryState(position: number, back: string | null) {
  history.replaceState({ back, position }, "");
}

/** Mounts the header with a router that records each navigation. */
function mountHeader(fallback?: RouteLocationRaw) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { component: { template: "<div />" }, name: "home", path: "/" },
      { component: { template: "<div />" }, name: "profile", path: "/profile" },
    ],
  });
  const back = vi.spyOn(router, "back").mockImplementation(() => undefined);
  const go = vi.spyOn(router, "go").mockImplementation(() => undefined);
  const replace = vi.spyOn(router, "replace");
  const wrapper = mount(HeaderMobileSecondary, {
    global: { mocks: { $t: (key: string) => key }, plugins: [router] },
    props: { enableBackButton: true, enableCloseButton: true, fallback },
    slots: { default: "Profile" },
  });
  return { back, go, replace, wrapper };
}

describe("HeaderMobileSecondary", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setHistoryState(0, null);
  });

  it("renders the title as the only h1", () => {
    const { wrapper } = mountHeader();

    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(wrapper.get("h1").text()).toBe("Profile");
  });

  it("sets the weight of the title, so a page passes only text", () => {
    const { wrapper } = mountHeader();

    expect(wrapper.get("h1").classes()).toContain("font-medium");
  });

  it("gives the ghost icon buttons the brand color", () => {
    const { wrapper } = mountHeader();

    expect(wrapper.get("header").classes()).toContain("[--s-button-ghost-icon:var(--base-fg-brand)]");
  });

  it("names the two icon buttons", () => {
    const { wrapper } = mountHeader();

    expect(wrapper.find(BACK).exists()).toBe(true);
    expect(wrapper.find(CLOSE).exists()).toBe(true);
  });

  it("opens the earlier page when the history has one", async () => {
    setHistoryState(1, "/");
    const { back, replace, wrapper } = mountHeader();

    await wrapper.get(BACK).trigger("click");

    expect(back).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
  });

  it("opens the home page when a link from outside the app opened this page", async () => {
    const { back, replace, wrapper } = mountHeader();

    await wrapper.get(BACK).trigger("click");
    await flushPromises();

    expect(back).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith({ name: "home" });
  });

  it("opens the fallback of the page when the history has no earlier page", async () => {
    const { replace, wrapper } = mountHeader({ name: "profile" });

    await wrapper.get(BACK).trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenCalledWith({ name: "profile" });
  });

  it("returns to the snapshot when the user taps close", async () => {
    const { go, replace, wrapper } = mountHeader();
    setHistoryState(2, "/");
    useRouterHistoryStore().takeSnapshot();
    setHistoryState(5, "/profile");

    await wrapper.get(CLOSE).trigger("click");

    expect(go).toHaveBeenCalledWith(-3);
    expect(replace).not.toHaveBeenCalled();
  });

  it("opens the fallback when close has no snapshot, for example after a reload", async () => {
    setHistoryState(3, "/");
    const { go, replace, wrapper } = mountHeader({ name: "profile" });

    await wrapper.get(CLOSE).trigger("click");
    await flushPromises();

    expect(go).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith({ name: "profile" });
  });

  it("shows the bottom line of the frosted bar only while the page is scrolled", async () => {
    const { wrapper } = mountHeader();
    const bar = () => wrapper.get('[data-test="header-frosted-bar"]').element as HTMLElement;
    expect(bar().style.borderBottomColor).toBe("transparent");

    Object.defineProperty(window, "scrollY", { configurable: true, value: 120 });
    window.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(bar().style.borderBottomColor).not.toBe("transparent");

    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    window.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(bar().style.borderBottomColor).toBe("transparent");
  });
});
