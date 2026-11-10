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

  it("puts the action slot on the right, outside the text block", () => {
    const wrapper = mount(Notice, {
      props: { tone: "error" },
      slots: { action: '<button data-test="action">Try again</button>', default: "<p>Message</p>" },
    });

    const row = wrapper.get('[data-test="action"]').element.parentElement;
    expect(row?.classList.contains("justify-end")).toBe(true);
    expect(row?.closest(".text-base-text-danger")).toBeNull();
  });

  it("has no action row without the action slot", () => {
    expect(mountNotice().find(".justify-end").exists()).toBe(false);
  });

  it("uses the brand text token for the info text", () => {
    expect(mountNotice({ tone: "info" }).find(".text-base-text-brand").exists()).toBe(true);
  });
});
