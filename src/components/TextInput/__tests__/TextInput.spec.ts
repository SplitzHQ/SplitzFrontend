import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";

import TextInput, { type TextInputProps } from "../TextInput.vue";

vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (id: string) => id }) }));

/** Mounts a field in the document, because only an element in the document can take the focus. */
function mountField(props: Partial<TextInputProps> = {}, modelValue?: string) {
  return mount(TextInput, {
    attachTo: document.body,
    props: { label: "Email", modelValue, placeholder: "Email address", ...props },
    slots: { icon: () => h("svg", { "data-testid": "icon" }) },
  });
}

/** Returns the label in the field. It holds the padding, the icon and the input. */
function tapAreaOf(wrapper: ReturnType<typeof mountField>) {
  return wrapper.get("input").element.parentElement!;
}

/** Returns the box with the border around the input. */
function fieldOf(wrapper: ReturnType<typeof mountField>) {
  return tapAreaOf(wrapper).parentElement!;
}

describe("TextInput", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // jsdom does not move the focus when a label gets a click, so these tests check the link. A browser does the rest.
  it("puts the padding and the icon in a label of the input, so a press on them focuses the input", () => {
    const wrapper = mountField();
    const tapArea = tapAreaOf(wrapper);

    expect(tapArea).toBeInstanceOf(HTMLLabelElement);
    expect((tapArea as HTMLLabelElement).control).toBe(wrapper.get("input").element);
    expect(tapArea.contains(wrapper.get("[data-testid='icon']").element)).toBe(true);
  });

  it("keeps the password button out of the label, so its name is not part of the name of the input", () => {
    const wrapper = mountField({ type: "password" });

    expect(tapAreaOf(wrapper).contains(wrapper.get("button").element)).toBe(false);
  });

  it("keeps the focus in the input during a press on the padding", () => {
    const wrapper = mountField();
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });

    tapAreaOf(wrapper).dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves a press on the input to the browser, so the caret can move", () => {
    const wrapper = mountField();
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });

    wrapper.get("input").element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("does not focus the input after a press on the reveal button", async () => {
    const wrapper = mountField({ type: "password" });

    await wrapper.get("button").trigger("click");

    expect(document.activeElement).not.toBe(wrapper.get("input").element);
    expect(wrapper.get("input").attributes("type")).toBe("text");
  });

  it("does not focus a disabled input", async () => {
    const wrapper = mountField({ disabled: true });

    tapAreaOf(wrapper).click();
    await nextTick();

    expect(document.activeElement).not.toBe(wrapper.get("input").element);
  });

  it("links the hint to the input", () => {
    const wrapper = mountField({ hint: "Use 8 characters.", id: "email" });

    expect(wrapper.get("input").attributes("aria-describedby")).toBe("email-hint");
    expect(wrapper.get("#email-hint").text()).toBe("Use 8 characters.");
  });

  it("links the hint and an element outside the field to the input", () => {
    const wrapper = mountField({ describedBy: "form-error", hint: "Use 8 characters.", id: "email" });

    expect(wrapper.get("input").attributes("aria-describedby")).toBe("email-hint form-error");
  });

  it("has no description when the field has no hint", () => {
    expect(mountField().get("input").attributes("aria-describedby")).toBeUndefined();
  });

  it("tells a screen reader when the value is wrong", () => {
    expect(mountField({ invalid: true }).get("input").attributes("aria-invalid")).toBe("true");
    expect(mountField().get("input").attributes("aria-invalid")).toBeUndefined();
  });

  describe("error", () => {
    it("shows the error text, links it to the input and tells a screen reader", () => {
      const input = mountField({ error: "Passwords do not match", id: "email" });

      expect(input.get("#email-error").text()).toBe("Passwords do not match");
      expect(input.get("#email-error").attributes("role")).toBe("alert");
      expect(input.get("input").attributes("aria-describedby")).toBe("email-error");
      expect(input.get("input").attributes("aria-invalid")).toBe("true");
    });

    it("replaces the hint", () => {
      const input = mountField({ error: "Too short", hint: "Use 8 characters.", id: "email" });

      expect(input.find("#email-hint").exists()).toBe(false);
      expect(input.text()).not.toContain("Use 8 characters.");
    });

    it("shows the hint again when the error goes away", async () => {
      const input = mountField({ error: "Too short", hint: "Use 8 characters.", id: "email" });

      await input.setProps({ error: undefined });

      expect(input.get("#email-hint").text()).toBe("Use 8 characters.");
      expect(input.get("input").attributes("aria-describedby")).toBe("email-hint");
      expect(input.get("input").attributes("aria-invalid")).toBeUndefined();
    });

    it("has the error border, and not the filled border", () => {
      const input = mountField({ error: "Too short" }, "abc");

      expect(fieldOf(input).className).toContain("border-base-border-error-solid");
      expect(fieldOf(input).className).not.toContain("border-base-border-primary");
    });
  });

  describe("border at rest", () => {
    it("is darker when the field has a value", () => {
      expect(fieldOf(mountField({}, "abc")).className).toContain("border-base-border-primary");
    });

    it("is the lighter gray when the field is empty", () => {
      expect(fieldOf(mountField()).className).toContain("border-base-border-secondary");
    });
  });

  describe("layout of the text under the field", () => {
    it("gives the label and the text the side space of the field, so they line up with the icon", () => {
      expect(mountField().get("label").classes()).toContain("px-3.25");
      expect(mountField({ hint: "Help" }).get("p").classes()).toContain("px-3.25");
      expect(mountField({ error: "Wrong" }).get("[role='alert']").classes()).toContain("px-3.25");
    });

    it("gives a hidden label no side space", () => {
      expect(mountField({ hideLabel: true }).get("label").classes()).toEqual(["sr-only"]);
    });
  });

  describe("shake", () => {
    const animate = vi.fn();

    beforeEach(() => {
      animate.mockClear();
      Element.prototype.animate = animate;
    });

    afterEach(() => {
      Reflect.deleteProperty(Element.prototype, "animate");
      document.documentElement.removeAttribute("data-reduce-motion");
    });

    it("moves the field one time when a new error appears", async () => {
      const wrapper = mountField();
      await wrapper.setProps({ error: "Wrong" });
      expect(animate).toHaveBeenCalledOnce();
      expect(animate.mock.contexts[0]).toBe(fieldOf(wrapper));
      const [keyframes] = animate.mock.calls[0] as [{ translate: string }[]];
      expect(keyframes.map(({ translate }) => translate)).toEqual(["0px 0", "-3px 0", "2px 0", "-1px 0", "0px 0"]);
    });

    it("does not move the field when one error changes to another error", async () => {
      const wrapper = mountField({ error: "Wrong" });
      await wrapper.setProps({ error: "Also wrong" });
      expect(animate).not.toHaveBeenCalled();
    });

    it("does not move the field when the error goes away", async () => {
      const wrapper = mountField({ error: "Wrong" });
      await wrapper.setProps({ error: undefined });
      expect(animate).not.toHaveBeenCalled();
    });

    it("does not move the field under reduced motion", async () => {
      document.documentElement.setAttribute("data-reduce-motion", "");
      const wrapper = mountField();
      await wrapper.setProps({ error: "Wrong" });
      expect(animate).not.toHaveBeenCalled();
    });
  });

  it("gives the password button a name that follows the state", async () => {
    const wrapper = mountField({ type: "password" });

    expect(wrapper.get("button").text()).toBe("text-input-show-password");
    await wrapper.get("button").trigger("click");
    expect(wrapper.get("button").text()).toBe("text-input-hide-password");
  });

  describe("text size", () => {
    it("gives the outlined text the 16px class", () => {
      expect(mountField().get("input").classes()).toContain("text-base");
    });

    it("gives the plain text the 14px class of its row, with no scale", () => {
      const classes = mountField({ variant: "plain" }).get("input").classes();
      expect(classes).toContain("text-sm");
      expect(classes.join(" ")).not.toContain("scale-");
    });
  });

  describe("plain variant", () => {
    it("has no box around the input and ends a long placeholder with an ellipsis", () => {
      const wrapper = mountField({ variant: "plain" });

      expect(wrapper.find("div").exists()).toBe(false);
      expect(wrapper.get("input").classes()).toContain("text-ellipsis");
    });

    it("gives a class on the component to the input", () => {
      const wrapper = mount(TextInput, {
        attrs: { class: "w-full" },
        props: { placeholder: "Search", variant: "plain" },
      });

      expect(wrapper.get("input").classes()).toContain("w-full");
    });

    it("uses the label as the name of the input, and shows no label element", () => {
      const wrapper = mountField({ variant: "plain" });

      expect(wrapper.get("input").attributes("aria-label")).toBe("Email");
      expect(wrapper.find("label").exists()).toBe(false);
    });

    it("tells a screen reader when the value is wrong", () => {
      expect(mountField({ invalid: true, variant: "plain" }).get("input").attributes("aria-invalid")).toBe("true");
    });

    it("links an element outside the field to the input", () => {
      const wrapper = mountField({ describedBy: "form-error", variant: "plain" });

      expect(wrapper.get("input").attributes("aria-describedby")).toBe("form-error");
    });

    it("shows no error text and links no missing element, but marks the value as wrong", () => {
      const wrapper = mountField({ error: "Too short", variant: "plain" });

      expect(wrapper.text()).not.toContain("Too short");
      expect(wrapper.get("input").attributes("aria-describedby")).toBeUndefined();
      expect(wrapper.get("input").attributes("aria-invalid")).toBe("true");
    });
  });
});
