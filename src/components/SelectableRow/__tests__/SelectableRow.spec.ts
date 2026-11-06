import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SelectableRow, { type SelectableRowProps } from "../SelectableRow.vue";

/** Mounts a row with a name in its slot. */
function mountRow(props: SelectableRowProps) {
  return mount(SelectableRow, { props, slots: { default: "<span>Alex</span>" } });
}

describe("SelectableRow", () => {
  it("gives its state to a screen reader and hides the mark", () => {
    const button = mountRow({ selected: true }).get("button");

    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("aria-pressed")).toBe("true");
    expect(button.text()).toBe("Alex");
    expect(button.element.querySelector("[aria-hidden='true'] svg")).not.toBeNull();
  });

  it("reads as not pressed when it is not selected", () => {
    expect(mountRow({ selected: false }).get("button").attributes("aria-pressed")).toBe("false");
  });

  it("emits toggle when the user taps it", async () => {
    const wrapper = mountRow({ selected: false });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("toggle")).toEqual([[]]);
  });

  it("does not emit toggle when it is disabled", async () => {
    const wrapper = mountRow({ disabled: true, selected: false });

    await wrapper.get("button").trigger("click");

    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
    expect(wrapper.emitted("toggle")).toBeUndefined();
  });
});
