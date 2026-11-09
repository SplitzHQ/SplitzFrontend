import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import AuthShell, { type AuthShellProps } from "../AuthShell.vue";

/** Mounts the shell. The logo is not part of these tests. */
function mountShell(props: Partial<AuthShellProps> = {}, footer?: string, slots: Record<string, string> = {}) {
  return mount(AuthShell, {
    global: { stubs: { BrandTapMark: true } },
    props: { title: "Sign in", ...props },
    slots: footer ? { footer, ...slots } : slots,
  });
}

describe("AuthShell", () => {
  it("is the main landmark and holds the only h1", () => {
    const wrapper = mountShell({ subtitle: "Welcome back" });

    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(wrapper.get("h1").text()).toBe("Sign in");
    expect(wrapper.text()).toContain("Welcome back");
  });

  it("reads a change of the title aloud only on a status page", () => {
    expect(mountShell().find("[aria-live]").exists()).toBe(false);

    const live = mountShell({ status: true }).get("[aria-live]");

    expect(live.attributes("aria-live")).toBe("polite");
    expect(live.find("h1").exists()).toBe(true);
  });

  it("shows the sign-in pattern on every account page, a status page too", () => {
    expect(mountShell().findComponent({ name: "BrandPattern" }).exists()).toBe(true);
    expect(mountShell({ status: true }).findComponent({ name: "BrandPattern" }).exists()).toBe(true);
  });

  it("shows the logo only on a page that is not a status page", () => {
    expect(mountShell().find("header").exists()).toBe(true);
    expect(mountShell({ status: true }).find("header").exists()).toBe(false);
  });

  it("shows the highlighted part of the subtitle in its own element, with the spaces of the text", () => {
    const wrapper = mountShell({ highlight: "a@b.co", subtitle: "We sent a link to a@b.co. Open it." });

    expect(wrapper.get("p").text()).toBe("We sent a link to a@b.co. Open it.");
    expect(wrapper.get("p span").text()).toBe("a@b.co");
  });

  it("shows a subtitle without the highlight as it is", () => {
    const wrapper = mountShell({ highlight: "a@b.co", subtitle: "Check your email." });

    expect(wrapper.get("p").text()).toBe("Check your email.");
    expect(wrapper.find("p span").exists()).toBe(false);
  });

  it("makes the content and the actions one form when the page handles submit", async () => {
    const onSubmit = vi.fn();
    const wrapper = mountShell({ onSubmit }, undefined, {
      actions: "<button type='submit'>Go</button>",
      default: "<input />",
    });

    const form = wrapper.get("form");
    expect(form.find("input").exists()).toBe(true);
    expect(form.find("button").exists()).toBe(true);

    await form.trigger("submit");
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("has no form on a page with no submit", () => {
    const wrapper = mountShell({}, undefined, { actions: "<a href='/login'>Sign in</a>" });

    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.find("a").exists()).toBe(true);
  });

  it("renders a footer only when the page gives one", () => {
    expect(mountShell().find("footer").exists()).toBe(false);
    expect(mountShell({}, "<a href='/login'>Sign in</a>").find("footer a").exists()).toBe(true);
  });

  it("keeps the three parts as siblings, because the animation order reads their position", () => {
    const wrapper = mountShell({}, "<a href='/login'>Sign in</a>");
    const parts = [...wrapper.get("footer").element.parentElement!.children].map((part) => part.tagName);

    expect(parts).toEqual(["HEADER", "SECTION", "FOOTER"]);
  });
});
