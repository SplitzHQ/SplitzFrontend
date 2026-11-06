import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import Avatar, { type AvatarProps } from "../Avatar.vue";

vi.mock("@/libs/asset-url", () => ({ resolveAssetUrl: (url: string | null | undefined) => url }));

/** Mounts an avatar with the given pictures at the `xs` size. */
function mountAvatar(images: AvatarProps["images"]) {
  return mount(Avatar, { props: { images, size: "xs" } });
}

/** Returns the inline style of the tile of a person with no picture. */
function tileStyle(alt: string) {
  return mountAvatar([{ alt, src: null }])
    .get('[role="img"]')
    .attributes("style");
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

  it("puts the line on a photo and not on a tile with an initial", () => {
    const wrapper = mountAvatar([
      { alt: "Alex", src: "/alex.png" },
      { alt: "Bo", src: null },
    ]);

    expect(wrapper.get("img").classes()).toContain("picture-line");
    expect(wrapper.findAll(".picture-line")).toHaveLength(1);
  });

  it("gives the same name the same color", () => {
    expect(tileStyle("Alex")).toBe(tileStyle("Alex"));
    expect(tileStyle("Alex")).toContain("-500)");
    expect(tileStyle("Alex")).toContain("-100)");
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

  it("puts two people on a diagonal of the grid", () => {
    const wrapper = mountAvatar([
      { alt: "Alex", src: "/alex.png" },
      { alt: "Bo", src: null },
    ]);

    const grid = wrapper.get("[data-pair]");
    const [first, second] = grid.element.children;
    expect(grid.classes()).toContain("grid");
    expect(first.className).not.toContain("col-start-2");
    expect(second.className).toContain("col-start-2");
    expect(second.className).toContain("row-start-2");
  });

  it.each([1, 3, 4])("keeps the centered rows for %i people", (count) => {
    const images = ["A", "B", "C", "D"].slice(0, count).map((alt) => ({ alt, src: null }));

    const wrapper = mountAvatar(images);

    expect(wrapper.find("[data-pair]").exists()).toBe(false);
    expect(wrapper.html()).not.toContain("col-start-2");
  });

  it("passes aria-hidden to the root, for an avatar next to a visible name", () => {
    const wrapper = mount(Avatar, {
      attrs: { "aria-hidden": "true" },
      props: { images: [{ alt: "Alex", src: null }], size: "xs" },
    });

    expect(wrapper.attributes("aria-hidden")).toBe("true");
  });
});
