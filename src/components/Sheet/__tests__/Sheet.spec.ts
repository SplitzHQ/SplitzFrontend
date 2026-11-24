import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

import Sheet from "@/components/Sheet/Sheet.vue";

vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (id: string) => id }) }));

/** The height of the panel in the tests. jsdom has no layout, so every height is 0 without this value. */
const SHEET_HEIGHT = 400;

let wrapper: VueWrapper | undefined;

/** Mounts one sheet behind a button that opens it. The content has a field and a button. */
function mountSheet(props: Record<string, unknown> = {}, startOpen = false) {
  const open = ref(startOpen);
  wrapper = mount(
    defineComponent({
      components: { Sheet },
      setup: () => ({ open, props }),
      template: `
        <button type="button" data-test="opener" @click="open = true">Open</button>
        <Sheet v-model="open" aria-label="Add friend" v-bind="props">
          <p data-test="text">Text</p>
          <input data-test="field" />
          <button type="button" data-test="action">Save</button>
        </Sheet>
      `,
    }),
    { attachTo: document.body }
  );
  return { open, wrapper };
}

/** Mounts two sheets that can be open at the same time. */
function mountTwoSheets() {
  const first = ref(true);
  const second = ref(true);
  wrapper = mount(
    defineComponent({
      components: { Sheet },
      setup: () => ({ first, second }),
      template: `
        <Sheet v-model="first" aria-label="First"><p>First</p></Sheet>
        <Sheet v-model="second" aria-label="Second"><p>Second</p></Sheet>
      `,
    }),
    { attachTo: document.body }
  );
  return { first, second };
}

/** Returns the panel, or null when no sheet is open. */
function panel() {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

/** Returns the element that describes the panel. */
function describedBy() {
  return document.getElementById(panel()!.getAttribute("aria-describedby")!);
}

/** Returns one element of the content by its test name. */
function part(name: string) {
  return document.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
}

/** Presses the mouse on an element, moves it down by a distance, and optionally lets it go. */
async function mouseDrag(element: Element, distance: number, release = true) {
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, clientY: 100 }));
  await flushPromises();
  document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientY: 100 + distance }));
  await flushPromises();
  if (release) {
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    await flushPromises();
  }
}

/** Returns the part of the handle that takes a press. */
function handle() {
  return panel()!.querySelector("[data-sheet-handle]")!;
}

/** Drags the handle to the largest height. */
async function dragToLargest() {
  await mouseDrag(handle(), -400);
}

/** Sends a touch event with one finger at a vertical position. */
function touch(target: EventTarget, type: string, clientY: number) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, "touches", { value: type === "touchend" ? [] : [{ clientY }] });
  target.dispatchEvent(event);
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(SHEET_HEIGHT);
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("Sheet", () => {
  describe("dialog", () => {
    it("is a modal dialog with a name and no missing parts", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      mountSheet({}, true);
      await flushPromises();

      const dialog = panel()!;
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(dialog.getAttribute("aria-label")).toBe("Add friend");
      expect(dialog.hasAttribute("aria-labelledby")).toBe(false);
      expect(dialog.hasAttribute("aria-describedby")).toBe(false);
      expect(warn).not.toHaveBeenCalled();
    });

    it("updates aria-label on the dialog when the prop changes", async () => {
      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { "aria-label": "Add friend", modelValue: true },
      });
      await flushPromises();

      await wrapper.setProps({ "aria-label": "Invite friend" });
      expect(panel()!.getAttribute("aria-label")).toBe("Invite friend");
      expect(panel()!.hasAttribute("aria-labelledby")).toBe(false);
    });

    it("draws the title as a heading and gets its name from it", async () => {
      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { modelValue: true, title: "Add friend" },
        slots: { default: '<p data-test="text">Text</p>' },
      });
      await flushPromises();

      const dialog = panel()!;
      const heading = dialog.querySelector("h2");
      expect(heading?.textContent?.trim()).toBe("Add friend");
      expect(heading?.hidden).toBe(false);
      expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)).toBe(heading);
      expect(dialog.hasAttribute("aria-label")).toBe(false);
    });

    it("describes the panel with the line under the title", async () => {
      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { description: "Everyone loses this expense.", modelValue: true, title: "Delete this expense?" },
      });
      await flushPromises();

      const dialog = panel()!;
      const line = document.getElementById(dialog.getAttribute("aria-describedby")!);
      expect(line?.textContent?.trim()).toBe("Everyone loses this expense.");
      expect(dialog.querySelector("h2")?.classList.contains("pb-2")).toBe(true);
    });

    it("adds the gap under the description only when content follows it", async () => {
      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { description: "A line.", modelValue: true, title: "Title" },
      });
      await flushPromises();
      expect(describedBy()?.classList.contains("pb-5")).toBe(false);
      wrapper.unmount();

      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { description: "A line.", modelValue: true, title: "Title" },
        slots: { default: "<p>Text</p>" },
      });
      await flushPromises();
      expect(describedBy()?.classList.contains("pb-5")).toBe(true);
    });

    it("gives the title more space than a sheet with no title", async () => {
      wrapper = mount(Sheet, { attachTo: document.body, props: { modelValue: true, title: "Add friend" } });
      await flushPromises();
      const title = panel()!.querySelector("h2")!;
      expect(title.classList.contains("text-display-xs")).toBe(true);
      expect(title.classList.contains("pb-5")).toBe(true);
      expect(panel()!.querySelector(".sheet-content")?.classList.contains("pt-6")).toBe(true);
      wrapper.unmount();

      mountSheet({}, true);
      await flushPromises();
      expect(panel()!.querySelector(".sheet-content")?.classList.contains("pt-4")).toBe(true);
    });

    it("keeps the compatibility title hidden when aria-label names the sheet", async () => {
      mountSheet({}, true);
      await flushPromises();

      expect(panel()!.querySelector("h2")?.hidden).toBe(true);
    });

    it("keeps the actions out of the content that scrolls", async () => {
      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { "aria-label": "Add friend", modelValue: true },
        slots: {
          actions: '<button type="button" data-test="save">Save</button>',
          default: '<p data-test="text">Text</p>',
        },
      });
      await flushPromises();

      const content = part("text").parentElement!;
      expect(content.classList.contains("overflow-y-auto")).toBe(true);
      expect(content.contains(part("save"))).toBe(false);
      expect(panel()!.contains(part("save"))).toBe(true);
    });

    it("makes the top blur follow the scroll", async () => {
      mountSheet({}, true);
      await flushPromises();

      const content = part("text").parentElement!;
      const band = panel()!.querySelector<HTMLElement>(".blur-band.is-top")!.parentElement!;
      expect(band.style.getPropertyValue("--blur-band-strength")).toBe("0");

      content.scrollTop = 26;
      content.dispatchEvent(new Event("scroll"));
      expect(band.style.getPropertyValue("--blur-band-strength")).toBe("0.5");

      content.scrollTop = 200;
      content.dispatchEvent(new Event("scroll"));
      expect(band.style.getPropertyValue("--blur-band-strength")).toBe("1");
    });

    it("has no top blur without a handle, because the content can have a sticky header", async () => {
      mountSheet({ showHandle: false }, true);
      await flushPromises();

      expect(panel()!.querySelector(".blur-band.is-top")).toBeNull();
    });

    it("puts the bottom blur behind the actions and only when the sheet has actions", async () => {
      mountSheet({}, true);
      await flushPromises();
      expect(panel()!.querySelector(".blur-band.is-bottom")).toBeNull();
      wrapper?.unmount();
      wrapper = undefined;

      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { "aria-label": "Add friend", modelValue: true },
        slots: { actions: '<button type="button">Save</button>', default: "<p>Text</p>" },
      });
      await flushPromises();
      expect(panel()!.querySelector(".blur-band.is-bottom")).not.toBeNull();
    });

    it("moves focus to the panel and not to a field, so a phone does not open the keyboard", async () => {
      const { wrapper } = mountSheet();
      wrapper.get<HTMLButtonElement>('[data-test="opener"]').element.focus();
      await wrapper.get('[data-test="opener"]').trigger("click");
      await flushPromises();

      expect(document.activeElement).toBe(panel());
    });

    it("returns focus to the element that opened it", async () => {
      const { open, wrapper } = mountSheet();
      const opener = wrapper.get<HTMLButtonElement>('[data-test="opener"]').element;
      opener.focus();
      await wrapper.get('[data-test="opener"]').trigger("click");
      await flushPromises();

      open.value = false;
      await flushPromises();

      expect(document.activeElement).toBe(opener);
    });

    it("keeps Tab inside the panel", async () => {
      mountSheet({ showCloseButton: true }, true);
      await flushPromises();
      part("action").focus();

      part("action").dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Tab" }));
      await flushPromises();

      expect(document.activeElement).toBe(panel()!.querySelector("button[data-sheet-close]"));
    });
  });

  describe("close", () => {
    it("closes on Escape", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
      await flushPromises();

      expect(open.value).toBe(false);
    });

    it("closes only the top sheet on Escape", async () => {
      const { first, second } = mountTwoSheets();
      await flushPromises();

      document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
      await flushPromises();

      expect(second.value).toBe(false);
      expect(first.value).toBe(true);
    });

    it("closes on a tap on the backdrop and not on a tap in the panel", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      part("text").click();
      await flushPromises();
      expect(open.value).toBe(true);

      panel()!.parentElement!.click();
      await flushPromises();
      expect(open.value).toBe(false);
    });

    it("stays open after a tap outside the backdrop, for example on a toast", async () => {
      const { open } = mountSheet({}, true);
      const toast = document.createElement("button");
      document.body.append(toast);
      await flushPromises();

      toast.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
      toast.click();
      await flushPromises();

      expect(open.value).toBe(true);
    });

    it("has a close button with a translated name, and it does not submit a form", async () => {
      const { open } = mountSheet({ showCloseButton: true }, true);
      await flushPromises();

      const close = panel()!.querySelector<HTMLButtonElement>("button[data-sheet-close]")!;
      expect(close.type).toBe("button");
      expect(close.textContent?.trim()).toBe("header-close");

      close.click();
      await flushPromises();
      expect(open.value).toBe(false);
    });

    it("shows the close button only on keyboard focus", async () => {
      mountSheet({ showCloseButton: true }, true);
      await flushPromises();

      expect(panel()!.querySelector("button[data-sheet-close]")?.className).toContain("not-focus-visible:sr-only");
    });

    it("hides the handle from a screen reader, because it can only drag", async () => {
      mountSheet({}, true);
      await flushPromises();

      expect(panel()!.querySelectorAll("button:not([data-test])")).toHaveLength(0);
      expect(panel()!.querySelector("[aria-hidden='true'][data-sheet-handle]")).not.toBeNull();
    });
  });

  describe("sheet over a sheet", () => {
    it("marks only the lower sheet, while the top sheet is open", async () => {
      const { second } = mountTwoSheets();
      await flushPromises();
      const panels = [...document.querySelectorAll<HTMLElement>('[role="dialog"]')];
      expect(panels).toHaveLength(2);
      expect(panels[0].classList.contains("is-behind")).toBe(true);
      expect(panels[1].classList.contains("is-behind")).toBe(false);

      second.value = false;
      await flushPromises();
      expect(panels[0].classList.contains("is-behind")).toBe(false);
    });

    it("does not mark a sheet that is alone", async () => {
      mountSheet({}, true);
      await flushPromises();
      expect(panel()!.classList.contains("is-behind")).toBe(false);
    });

    it("leaves no sheet in the stack after an unmount", async () => {
      mountTwoSheets();
      await flushPromises();
      wrapper?.unmount();
      wrapper = undefined;
      mountSheet({}, true);
      await flushPromises();
      expect(panel()!.classList.contains("is-behind")).toBe(false);
    });
  });

  describe("page scroll lock", () => {
    it("locks a sheet that mounts open", async () => {
      mountSheet({}, true);
      await flushPromises();

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("unlocks when the sheet closes", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      open.value = false;
      await flushPromises();

      expect(document.body.style.overflow).toBe("");
    });

    it("unlocks when an open sheet unmounts", async () => {
      const { wrapper } = mountSheet({}, true);
      await flushPromises();

      wrapper.unmount();

      expect(document.body.style.overflow).toBe("");
    });

    it("stays locked until the last open sheet closes", async () => {
      const { first, second } = mountTwoSheets();
      await flushPromises();

      second.value = false;
      await flushPromises();
      expect(document.body.style.overflow).toBe("hidden");

      first.value = false;
      await flushPromises();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("drag", () => {
    it("adds no document listeners for a drag until the drag starts", async () => {
      const add = vi.spyOn(document, "addEventListener");
      mountSheet({}, true);
      await flushPromises();
      expect(add.mock.calls.filter(([type]) => type === "mousemove")).toHaveLength(0);

      part("text").dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, clientY: 100 }));
      await flushPromises();
      expect(add.mock.calls.filter(([type]) => type === "mousemove")).toHaveLength(1);
    });

    it("closes after a drag past 30% of the height", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      await mouseDrag(part("text"), SHEET_HEIGHT * 0.3 + 1);

      expect(open.value).toBe(false);
    });

    it("moves back after a shorter drag", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      await mouseDrag(part("text"), SHEET_HEIGHT * 0.3);

      expect(open.value).toBe(true);
      expect(panel()!.style.transform).toBe("");
    });

    it("follows the press with no transition, and blocks text selection for a mouse", async () => {
      mountSheet({}, true);
      await flushPromises();

      await mouseDrag(part("text"), 40, false);

      expect(panel()!.style.transform).toBe("translateY(40px)");
      expect(panel()!.classList.contains("is-dragging")).toBe(true);
      expect(panel()!.classList.contains("select-none")).toBe(true);
    });

    it("does not start a mouse drag on a field or a button", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      await mouseDrag(part("field"), SHEET_HEIGHT);
      expect(open.value).toBe(true);

      await mouseDrag(part("action"), SHEET_HEIGHT);
      expect(open.value).toBe(true);
    });

    it("does not start a drag when the option is off", async () => {
      const { open } = mountSheet({ dismissOnDrag: false }, true);
      await flushPromises();

      await mouseDrag(part("text"), SHEET_HEIGHT);

      expect(open.value).toBe(true);
    });

    it("lets a finger drag start on a button, and keeps text selection", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      touch(part("action"), "touchstart", 100);
      await flushPromises();
      touch(document, "touchmove", 100 + SHEET_HEIGHT);
      await flushPromises();
      expect(panel()!.classList.contains("select-none")).toBe(false);

      touch(document, "touchend", 0);
      await flushPromises();
      expect(open.value).toBe(false);
    });

    it("does not start a finger drag on a field", async () => {
      mountSheet({}, true);
      await flushPromises();

      touch(part("field"), "touchstart", 100);
      await flushPromises();

      expect(panel()!.classList.contains("is-dragging")).toBe(false);
    });

    it("moves back and stays open when the browser cancels the touch", async () => {
      const { open } = mountSheet({}, true);
      await flushPromises();

      touch(part("text"), "touchstart", 100);
      await flushPromises();
      touch(document, "touchmove", 100 + SHEET_HEIGHT);
      await flushPromises();
      touch(document, "touchcancel", 0);
      await flushPromises();

      expect(open.value).toBe(true);
      expect(panel()!.classList.contains("is-dragging")).toBe(false);
    });

    it("ends the drag when the press moves above its start", async () => {
      mountSheet({}, true);
      await flushPromises();

      await mouseDrag(part("text"), -10, false);

      expect(panel()!.classList.contains("is-dragging")).toBe(false);
    });
  });

  describe("drag of the handle", () => {
    /** The height of the area around the panel. The largest height of the sheet is 90% of this value. */
    const SCREEN_HEIGHT = 1000;

    /** Opens a sheet and returns the model of the sheet. */
    async function openSheet(props: Record<string, unknown> = {}) {
      vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(SCREEN_HEIGHT);
      const { open } = mountSheet(props, true);
      await flushPromises();
      return open;
    }

    it("goes to the largest height, also with short content", async () => {
      await openSheet({ detent: "medium" });

      await dragToLargest();

      expect(panel()!.style.height).toBe("90%");
    });

    it("follows the press, and follows only a part of the drag above the largest height", async () => {
      await openSheet();

      await mouseDrag(handle(), -100, false);
      expect(panel()!.style.height).toBe("500px");

      document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientY: 100 - 2000 }));
      await flushPromises();
      expect(panel()!.style.height).toBe("924px");
    });

    it("goes back to the opening height after a short drag up", async () => {
      await openSheet();

      await mouseDrag(handle(), -100);

      expect(panel()!.style.height).toBe("");
      expect(panel()!.style.maxHeight).toBe("90dvh");
    });

    it("stays at the largest height after a short drag down, and goes back after a long one", async () => {
      await openSheet();
      await dragToLargest();
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(900);

      await mouseDrag(handle(), 100);
      expect(panel()!.style.height).toBe("90%");

      await mouseDrag(handle(), 400);
      expect(panel()!.style.height).toBe("");
    });

    it("does nothing on a tap", async () => {
      const open = await openSheet();

      await mouseDrag(handle(), 0);
      expect(open.value).toBe(true);
      expect(panel()!.style.height).toBe("");

      await dragToLargest();
      await mouseDrag(handle(), 0);
      expect(panel()!.style.height).toBe("90%");
    });

    it("closes after a drag past 30% of the opening height", async () => {
      const open = await openSheet();

      await mouseDrag(handle(), SHEET_HEIGHT * 0.3 + 1);

      expect(open.value).toBe(false);
    });

    it("does not close when the option is off, and still changes the height", async () => {
      const open = await openSheet({ dismissOnDrag: false });

      await mouseDrag(handle(), SHEET_HEIGHT);
      expect(open.value).toBe(true);
      expect(panel()!.style.transform).toBe("");

      await dragToLargest();
      expect(panel()!.style.height).toBe("90%");
    });

    it("opens at the opening height after it closed at the largest height", async () => {
      const open = await openSheet();
      await dragToLargest();

      open.value = false;
      await flushPromises();
      open.value = true;
      await flushPromises();

      expect(panel()!.style.height).toBe("");
    });

    it("drags from the title, and not from a free part when the drag goes up", async () => {
      vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(SCREEN_HEIGHT);
      wrapper = mount(Sheet, {
        attachTo: document.body,
        props: { modelValue: true, title: "Add friend" },
        slots: { default: '<p data-test="text">Text</p>' },
      });
      await flushPromises();

      await mouseDrag(part("text"), -400);
      expect(panel()!.style.height).toBe("");

      await mouseDrag(panel()!.querySelector("h2")!, -400);
      expect(panel()!.style.height).toBe("90%");
    });

    it("has no drag of the height when the handle is off", async () => {
      await openSheet({ showHandle: false });

      expect(panel()!.querySelector("[data-sheet-handle]")).toBeNull();
    });

    it("marks the handle while the user holds it", async () => {
      await openSheet();

      await mouseDrag(handle(), 0, false);

      expect(panel()!.querySelector(".sheet-handle-bar")?.hasAttribute("data-active")).toBe(true);
    });
  });
});
