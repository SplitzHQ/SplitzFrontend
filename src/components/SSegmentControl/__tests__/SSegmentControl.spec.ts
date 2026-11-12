import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { type Component, defineComponent, h, nextTick, ref } from "vue";

import SSegmentControl, { type SegmentControlProps } from "../SSegmentControl.vue";

const ITEMS = ["One", "Two", "Three"];

/** Mounts a control in the document with a model that follows each change. Only an element in the document can take the focus. */
function mountControl(start = 0, props: Partial<SegmentControlProps> = {}) {
  const model = ref(start);
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(SSegmentControl as Component, {
          "aria-label": "Choice",
          items: ITEMS,
          modelValue: model.value,
          "onUpdate:modelValue": (value: number) => (model.value = value),
          size: "sm",
          ...props,
        }),
    }),
    { attachTo: document.body }
  );
  return { model, radios: () => wrapper.findAll("[role='radio']"), wrapper };
}

/** Returns the radio group of a new control with these props. */
function radioGroup(props: Partial<SegmentControlProps>) {
  return mountControl(0, props).wrapper.get("[role='radiogroup']");
}

/** Returns true while the track shows a press. */
function isPressed(wrapper: ReturnType<typeof mountControl>["wrapper"]): boolean {
  return wrapper.get(".track").attributes("data-pressed") !== undefined;
}

describe("SSegmentControl", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("is a named radio group, and each segment tells if it is selected", () => {
    const { radios, wrapper } = mountControl(1);

    expect(wrapper.get("[role='radiogroup']").attributes("aria-label")).toBe("Choice");
    expect(radios().map((radio) => radio.attributes("aria-checked"))).toEqual(["false", "true", "false"]);
  });

  it("selects a segment when the user taps it", async () => {
    const { model, radios } = mountControl();

    await radios()[2].trigger("click");

    expect(model.value).toBe(2);
  });

  it("puts only the selected segment in the tab order", () => {
    const { radios } = mountControl(1);

    expect(radios().map((radio) => radio.attributes("tabindex"))).toEqual(["-1", "0", "-1"]);
  });

  it.each([
    ["ArrowRight", 0, 1],
    ["ArrowDown", 0, 1],
    ["ArrowLeft", 1, 0],
    ["ArrowUp", 1, 0],
    ["ArrowRight", 2, 0],
    ["ArrowLeft", 0, 2],
  ])("%s from index %i selects and focuses index %i", async (key, start, end) => {
    const { model, radios } = mountControl(start);

    await radios()[start].trigger("keydown", { key });

    expect(model.value).toBe(end);
    expect(document.activeElement).toBe(radios()[end].element);
  });

  it("does not change on another key, and the key keeps its default action", () => {
    const { model, radios } = mountControl();
    const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Tab" });

    radios()[0].element.dispatchEvent(event);

    expect(model.value).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("allows two items with the same text", () => {
    const { radios } = mountControl(0, { items: ["Same", "Same"] });

    expect(radios()).toHaveLength(2);
  });

  it("shows the text of the item when the caller gives no slot", () => {
    const { radios } = mountControl();

    expect(radios()[1].text()).toBe("Two");
  });

  it("shows one selected background, and none when the index is outside the list", () => {
    expect(mountControl(1).wrapper.findAll("[data-segment-selection]")).toHaveLength(1);
    expect(mountControl(-1).wrapper.findAll("[data-segment-selection]")).toHaveLength(0);
  });

  it("does not put a mask on a control that fits", () => {
    const { wrapper } = mountControl();

    expect(wrapper.get<HTMLElement>("[role='radiogroup']").element.style.maskImage).toBe("");
  });

  it("wraps the segments only with the wrap prop", () => {
    expect(radioGroup({}).classes()).toContain("overflow-x-auto");
    expect(radioGroup({ wrap: true }).classes()).not.toContain("overflow-x-auto");
  });

  describe("press", () => {
    it("keeps the press during a touch pan and ends it when the finger lifts", async () => {
      const { radios, wrapper } = mountControl();
      const group = wrapper.get("[role='radiogroup']");

      await radios()[1].trigger("pointerdown", { pointerType: "touch" });
      expect(isPressed(wrapper)).toBe(true);

      await group.trigger("pointercancel", { pointerType: "touch" });
      await group.trigger("pointerleave", { pointerType: "touch" });
      expect(isPressed(wrapper)).toBe(true);

      await group.trigger("touchend");
      expect(isPressed(wrapper)).toBe(false);
    });

    it("ends the press when the browser cancels the touch", async () => {
      const { radios, wrapper } = mountControl();

      await radios()[1].trigger("pointerdown", { pointerType: "touch" });
      await wrapper.get("[role='radiogroup']").trigger("touchcancel");

      expect(isPressed(wrapper)).toBe(false);
    });

    it("ends the press when a mouse leaves the track", async () => {
      const { radios, wrapper } = mountControl();

      await radios()[1].trigger("pointerdown", { pointerType: "mouse" });
      await wrapper.get("[role='radiogroup']").trigger("pointerleave", { pointerType: "mouse" });

      expect(isPressed(wrapper)).toBe(false);
    });

    it("ignores a button other than the main button", async () => {
      const { radios, wrapper } = mountControl();

      radios()[1].element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 2 }));
      await nextTick();

      expect(isPressed(wrapper)).toBe(false);
    });
  });
});
