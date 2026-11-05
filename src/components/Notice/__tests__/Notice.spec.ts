import { PhPaperPlaneTilt } from "@phosphor-icons/vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { NOTICE_ICONS } from "../notice-icons";
import Notice, { type NoticeProps } from "../Notice.vue";

/** Mounts a notice with a message and an icon. */
function mountNotice(props: NoticeProps = {}) {
  return mount(Notice, { props, slots: { default: "<p>Message</p>", icon: "<svg />" } });
}

describe("Notice", () => {
  it("has no live role by default", () => {
    expect(mountNotice({ tone: "error" }).attributes("role")).toBeUndefined();
  });

  it("is an alert with announce", () => {
    expect(mountNotice({ announce: true, tone: "info" }).attributes("role")).toBe("alert");
  });

  it("hides the icon from a screen reader", () => {
    expect(mountNotice().get("svg").element.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the title when it has one", () => {
    expect(mountNotice({ title: "Title" }).text()).toContain("Title");
    expect(mountNotice().findAll("p")).toHaveLength(1);
  });

  it.each(Object.entries(NOTICE_ICONS))("shows the default icon of the %s tone", (tone, icon) => {
    const wrapper = mount(Notice, { props: { tone: tone as NoticeProps["tone"] }, slots: { default: "Message" } });

    expect(wrapper.findComponent(icon).exists()).toBe(true);
  });

  it("replaces the default icon with the icon slot", () => {
    const wrapper = mount(Notice, { props: { tone: "info" }, slots: { icon: PhPaperPlaneTilt } });

    expect(wrapper.findComponent(PhPaperPlaneTilt).exists()).toBe(true);
    expect(wrapper.findComponent(NOTICE_ICONS.info).exists()).toBe(false);
  });

  it("uses the 900 token for the info text", () => {
    expect(mountNotice({ tone: "info" }).find(".text-util-color-brand-900").exists()).toBe(true);
  });
});
