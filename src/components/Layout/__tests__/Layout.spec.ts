import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import Layout from "../Layout.vue";

/** Mounts a layout with a header and with content that binds the slot props, as each page does. */
function mountLayout() {
  return mount(Layout, {
    slots: {
      default: (attrs: Record<string, unknown>) => h("div", { ...attrs, id: "content" }),
      header: () => h("header", { id: "header" }),
    },
  });
}

describe("Layout", () => {
  it("puts the content in the main landmark and the header outside it", () => {
    const main = mountLayout().get("main");

    expect(main.find("#content").exists()).toBe(true);
    expect(main.find("#header").exists()).toBe(false);
  });

  it("gives the margin and the growth to the content as a slot prop", () => {
    const classes = mountLayout().get("#content").classes();

    expect(classes).toEqual(expect.arrayContaining(["mx-4", "mb-4", "grow"]));
  });

  it("puts the classes of a page on the root", () => {
    const wrapper = mount(Layout, { attrs: { class: "h-dvh" } });

    expect(wrapper.classes()).toContain("h-dvh");
  });
});
