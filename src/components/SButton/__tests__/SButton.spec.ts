import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import SButton from "../SButton.vue";
import SIconButton from "../SIconButton.vue";
import SLinkButton from "../SLinkButton.vue";

describe("SButton", () => {
  it("renders a real button with the look inside it", () => {
    const wrapper = mount(SButton, { attrs: { class: "w-full" }, slots: { default: "Save" } });

    expect((wrapper.element as Element).tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
    expect(wrapper.classes()).toContain("w-full");
    expect(wrapper.find("button > .s-button").exists()).toBe(true);
  });

  it("uses the type prop", () => {
    expect(mount(SButton, { props: { type: "submit" } }).attributes("type")).toBe("submit");
  });

  it("emits click", async () => {
    const wrapper = mount(SButton);

    await wrapper.trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("disables the native button when disabled", () => {
    const wrapper = mount(SButton, { props: { disabled: true } });

    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.find(".s-button").classes()).toContain("is-disabled");
  });

  it("blocks clicks while loading, but stays focusable", async () => {
    const wrapper = mount(SButton, { props: { loading: true } });

    await wrapper.trigger("click");

    expect(wrapper.emitted("click")).toBeUndefined();
    expect(wrapper.attributes("disabled")).toBeUndefined();
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });
});

describe("SIconButton", () => {
  it("renders a real button and keeps the aria-label on it", () => {
    const wrapper = mount(SIconButton, { attrs: { "aria-label": "Close" }, slots: { default: "<svg />" } });

    expect((wrapper.element as Element).tagName).toBe("BUTTON");
    expect(wrapper.attributes("aria-label")).toBe("Close");
    expect(wrapper.find(".s-button").classes()).toContain("icon-only");
  });

  it("blocks clicks while loading", async () => {
    const wrapper = mount(SIconButton, { attrs: { "aria-label": "Close" }, props: { loading: true } });

    await wrapper.trigger("click");

    expect(wrapper.emitted("click")).toBeUndefined();
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });
});

describe("SLinkButton", () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ component: { template: "<div />" }, path: "/:path(.*)*" }],
  });

  it("renders a link with the look inside it", () => {
    const wrapper = mount(SLinkButton, { global: { plugins: [router] }, props: { href: "/login" } });

    expect((wrapper.element as Element).tagName).toBe("A");
    expect(wrapper.attributes("href")).toBe("/login");
    expect(wrapper.find("a > .s-button").exists()).toBe(true);
  });

  it("leaves the tab order and ignores taps when disabled", () => {
    const wrapper = mount(SLinkButton, { global: { plugins: [router] }, props: { disabled: true, href: "/login" } });

    expect(wrapper.attributes("tabindex")).toBe("-1");
    expect(wrapper.attributes("aria-disabled")).toBe("true");
    expect(wrapper.classes()).toContain("pointer-events-none");
  });
});
