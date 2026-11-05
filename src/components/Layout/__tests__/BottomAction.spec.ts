import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import BottomAction from "../BottomAction.vue";

/** Mounts a bottom action with one button, as each page does. */
function mountAction() {
  return mount(BottomAction, { slots: { default: '<button id="action">Save</button>' } });
}

describe("BottomAction", () => {
  it("puts the button over a bottom blur that a screen reader does not read", () => {
    const wrapper = mountAction();
    const band = wrapper.get(".blur-band");

    expect(band.classes()).toContain("is-bottom");
    expect(band.attributes("aria-hidden")).toBe("true");
    expect(wrapper.find("#action").exists()).toBe(true);
  });

  it("takes a tap only on the button, so the area around it does not block the content", () => {
    const wrapper = mountAction();

    expect(wrapper.classes()).toContain("pointer-events-none");
    expect(wrapper.get("#action").element.parentElement?.classList).toContain("pointer-events-auto");
  });
});
