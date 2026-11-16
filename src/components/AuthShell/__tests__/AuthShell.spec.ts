import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h, type VNode } from "vue";

import AuthShell, { type AuthShellProps } from "../AuthShell.vue";

/** Mounts the shell. The logo is not part of these tests. */
function mountShell(
  props: Partial<AuthShellProps> = {},
  footer?: string,
  slots: Record<string, string | (() => VNode)> = {}
) {
  return mount(AuthShell, {
    global: { stubs: { BrandTapGlyph: true } },
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

  it("reads a change of the title aloud only on a result page", () => {
    expect(mountShell().find("[aria-live]").exists()).toBe(false);

    const live = mountShell({ isResultPage: true }).get("[aria-live]");

    expect(live.attributes("aria-live")).toBe("polite");
    expect(live.find("h1").exists()).toBe(true);
  });

  it("shows the logo only on a page that is not a result page", () => {
    expect(mountShell().find("header").exists()).toBe(true);
    expect(mountShell({ isResultPage: true }).find("header").exists()).toBe(false);
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

  it("renders the page-owned form without intercepting its submit event", async () => {
    const onSubmit = vi.fn<(event: Event) => void>();
    const wrapper = mountShell({}, undefined, {
      default: () => h("form", { onSubmit }, [h("input"), h("button", { type: "submit" }, "Go")]),
    });

    const form = wrapper.get("form");
    expect(wrapper.findAll("form")).toHaveLength(1);
    expect(form.find("input").exists()).toBe(true);
    expect(form.find("button").exists()).toBe(true);

    await form.trigger("submit");
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].defaultPrevented).toBe(false);
  });

  it("renders status actions in the default slot without adding a form", () => {
    const wrapper = mountShell({ isResultPage: true }, undefined, { default: "<a href='/login'>Sign in</a>" });

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
