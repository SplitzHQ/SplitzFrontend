import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { type Component, defineComponent, h, ref } from "vue";

import SSegmentControl, { type SegmentControlProps } from "../SSegmentControl.vue";

const ITEMS = ["One", "Two", "Three"];

/** Shows the layout id of a segment as an attribute, so the test can read it. */
const SegmentStub = defineComponent({
  props: { layoutId: { required: true, type: String } },
  setup: (props) => () => h("i", { "data-layout-id": props.layoutId }),
});

/** Two controls on one page. */
const TwoControls = defineComponent({
  render: () =>
    ["a", "b"].map((key) =>
      h(SSegmentControl as Component, { items: ITEMS, key, label: "Choice", modelValue: 0, size: "sm" }, () => "Item")
    ),
});

/** Returns the layout id of each segment, in page order. */
function layoutIds(): (string | undefined)[] {
  const wrapper = mount(TwoControls, { global: { stubs: { SSegment: SegmentStub } } });
  return wrapper.findAll("[data-layout-id]").map((segment) => segment.attributes("data-layout-id"));
}

/** Mounts a control in the document with a model that follows each change. Only an element in the document can take the focus. */
function mountControl(start = 0, props: Partial<SegmentControlProps> = {}) {
  const model = ref(start);
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(SSegmentControl as Component, {
          items: ITEMS,
          label: "Choice",
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

describe("SSegmentControl", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("gives all segments of one control the same layout id, so the background slides between them", () => {
    const ids = layoutIds();

    expect(ids[0]).toBe(ids[1]);
  });

  it("gives each control its own layout id, so each control shows its selected background", () => {
    const ids = layoutIds();

    expect(ids[0]).not.toBe(ids[ITEMS.length]);
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

  it("puts the first segment in the tab order when the index is outside the list", () => {
    const { radios } = mountControl(-1);

    expect(radios().map((radio) => radio.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
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
});
