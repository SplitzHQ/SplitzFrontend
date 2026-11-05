import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AuthShell, { type AuthShellProps } from "../AuthShell.vue";

/** Mounts the shell. The logo is not part of these tests. */
function mountShell(props: Partial<AuthShellProps> = {}, footer?: string) {
  return mount(AuthShell, {
    global: { stubs: { BrandWordmark: true } },
    props: { title: "Sign in", ...props },
    slots: footer ? { footer } : {},
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

  it("reads a change of the title aloud only on a centered status page", () => {
    expect(mountShell().find("[aria-live]").exists()).toBe(false);

    const live = mountShell({ centered: true }).get("[aria-live]");

    expect(live.attributes("aria-live")).toBe("polite");
    expect(live.find("h1").exists()).toBe(true);
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
