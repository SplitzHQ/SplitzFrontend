import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

import SPopover from "@/components/SPopover/SPopover.vue";

let wrapper: VueWrapper;

/** Render a controlled popover with native trigger and panel controls. */
function mountPopover(enabled = true) {
  wrapper = mount(
    defineComponent({
      components: { SPopover },
      setup() {
        return { enabled: ref(enabled), open: ref(false) };
      },
      template: `
      <SPopover v-model="open" :enabled="enabled" label="Requests" class="w-[26rem]" data-test="panel">
        <template #trigger><button type="button">Open requests</button></template>
        <button type="button" @click="open = false">Close requests</button>
        <button type="button" @click="enabled = false">Disable panel</button>
      </SPopover>
    `,
    }),
    { attachTo: document.body }
  );
  return wrapper.get("button");
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  wrapper?.unmount();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("SPopover", () => {
  it("portals the panel, forwards attributes and merges width classes", async () => {
    const trigger = mountPopover();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    await trigger.trigger("click");
    await flushPromises();

    const panel = document.querySelector('[role="dialog"]');
    expect(panel?.getAttribute("aria-label")).toBe("Requests");
    expect(panel?.getAttribute("data-test")).toBe("panel");
    expect(panel?.classList.contains("w-[26rem]")).toBe(true);
    expect(panel?.classList.contains("w-96")).toBe(false);
    expect(trigger.element.closest("[role='dialog']")).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("true");

    panel?.querySelector<HTMLButtonElement>("button")?.click();
    await flushPromises();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const trigger = mountPopover();
    await trigger.trigger("click");
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    await flushPromises();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger.element);
  });

  it("closes when focus moves outside", async () => {
    const trigger = mountPopover();
    await trigger.trigger("click");
    await flushPromises();
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    await flushPromises();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(outside);
  });

  it("leaves disabled triggers usable without popover semantics", async () => {
    const trigger = mountPopover(false);
    await trigger.trigger("click");
    await flushPromises();
    expect(trigger.attributes("aria-haspopup")).toBeUndefined();
    expect(trigger.attributes("aria-expanded")).toBeUndefined();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("closes the panel when disabled while open", async () => {
    const trigger = mountPopover();
    await trigger.trigger("click");
    await flushPromises();
    const buttons = document.querySelectorAll('[role="dialog"] button');
    (buttons[1] as HTMLButtonElement).click();
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(wrapper.get("button").attributes("aria-haspopup")).toBeUndefined();
  });
});
