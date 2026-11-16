import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import Avatar, { type AvatarProps } from "../Avatar.vue";

vi.mock("@/libs/asset-url", () => ({
  resolveAssetUrl: (url: string | null | undefined) => url,
}));

/** Mounts an avatar with the given pictures at the `xs` size. */
function mountAvatar(images: AvatarProps["images"]) {
  return mount(Avatar, { props: { images, size: "xs" } });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Avatar", () => {
  it("shows one picture with the name as its alt text", () => {
    const image = mountAvatar([{ alt: "Alex", src: "/alex.png" }]).get("img");

    expect(image.attributes("src")).toBe("/alex.png");
    expect(image.attributes("alt")).toBe("Alex");
  });

  it.each([null, undefined, ""])("shows the initial with the name when the source is %j", (src) => {
    const wrapper = mountAvatar([{ alt: "alex", src }]);

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.get('[role="img"]').attributes("aria-label")).toBe("alex");
    expect(wrapper.text()).toBe("A");
  });

  it("shows the initial after a load error", async () => {
    const wrapper = mountAvatar([{ alt: "Alex", src: "/broken.png" }]);

    await wrapper.get("img").trigger("error");

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toBe("A");
  });

  it("shows a silhouette and no name when the name is empty", () => {
    const wrapper = mountAvatar([{ alt: "  ", src: null }]);

    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.text()).toBe("");
  });

  it("replaces only the picture that failed in a group", async () => {
    const wrapper = mountAvatar([
      { alt: "Alex", src: "/broken.png" },
      { alt: "Bo", src: "/bo.png" },
    ]);

    await wrapper.findAll("img")[0].trigger("error");

    expect(wrapper.findAll("img").map((image) => image.attributes("src"))).toEqual(["/bo.png"]);
    expect(wrapper.text()).toBe("A");
  });

  it("gives a group one name and hides the name of each person", () => {
    const wrapper = mountAvatar([
      { alt: "Alex", src: "/alex.png" },
      { alt: "Bo", src: null },
    ]);

    expect(wrapper.attributes("role")).toBe("img");
    expect(wrapper.attributes("aria-label")).toBe("Alex, Bo");
    expect(wrapper.get("img").attributes("alt")).toBe("");
    expect(wrapper.findAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(wrapper.find('div[role="img"] div[role="img"]').exists()).toBe(false);
  });

  it("gives one picture no group role", () => {
    const wrapper = mountAvatar([{ alt: "Alex", src: null }]);

    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("aria-label")).toBeUndefined();
  });

  it("shows the first four pictures of a longer list, with no warning and no key warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const images = ["A", "B", "C", "D", "E"].map((alt) => ({ alt, src: null }));

    const wrapper = mountAvatar(images);

    expect(wrapper.text()).toBe("ABCD");
    expect(wrapper.attributes("aria-label")).toBe("A, B, C, D");
    expect(warn).not.toHaveBeenCalled();
  });

  it("passes aria-hidden to the root, for an avatar next to a visible name", () => {
    const wrapper = mount(Avatar, {
      attrs: { "aria-hidden": "true" },
      props: { images: [{ alt: "Alex", src: null }], size: "xs" },
    });

    expect(wrapper.attributes("aria-hidden")).toBe("true");
  });
});
