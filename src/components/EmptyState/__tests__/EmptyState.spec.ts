import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EmptyState, { type EmptyStateProps } from "../EmptyState.vue";

/** Mounts an empty state with a search icon and the given props. */
function mountEmptyState(props: Partial<EmptyStateProps> = {}, action?: string) {
  return mount(EmptyState, {
    props: { icon: PhMagnifyingGlass, title: "No groups match", ...props },
    slots: action ? { action } : {},
  });
}

describe("EmptyState", () => {
  it("shows the title as an h2 by default", () => {
    expect(mountEmptyState().get("h2").text()).toBe("No groups match");
  });

  it("uses the heading tag of titleTag", () => {
    const wrapper = mountEmptyState({ titleTag: "h3" });

    expect(wrapper.find("h2").exists()).toBe(false);
    expect(wrapper.get("h3").text()).toBe("No groups match");
  });

  it("shows the description only when it has one", () => {
    expect(mountEmptyState().find("p").exists()).toBe(false);
    expect(mountEmptyState({ description: "Try another word." }).get("p").text()).toBe("Try another word.");
  });

  it("hides the icon from a screen reader", () => {
    const icon = mountEmptyState().get("svg").element;

    expect(icon.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("paints the tile in the danger color for the error tone", () => {
    const neutral = mountEmptyState().get("[aria-hidden]");
    const error = mountEmptyState({ tone: "error" }).get("[aria-hidden]");

    expect(neutral.classes()).toContain("bg-comp-empty-state-icon-bg");
    expect(error.classes()).toContain("bg-base-bg-danger-subtle");
  });

  it("renders the action slot only when it has content", () => {
    expect(mountEmptyState().find("button").exists()).toBe(false);
    expect(mountEmptyState({}, "<button>Clear search</button>").get("button").text()).toBe("Clear search");
  });
});
