import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
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

/** Returns the box around the input. */
function fieldOf(wrapper: ReturnType<typeof mountField>) {
  return wrapper.get("input").element.parentElement!;
}

describe("TextInput", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("focuses the input after a press on the padding of the field", () => {
    const wrapper = mountField();

    fieldOf(wrapper).click();

    expect(document.activeElement).toBe(wrapper.get("input").element);
  });

  it("focuses the input after a press on the icon", async () => {
    const wrapper = mountField();

    await wrapper.get("[data-testid='icon']").trigger("click");

    expect(document.activeElement).toBe(wrapper.get("input").element);
  });

  it("keeps the focus in the input during a press on the padding", () => {
    const wrapper = mountField();
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });

    fieldOf(wrapper).dispatchEvent(event);

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

    fieldOf(wrapper).click();
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

  it("gives the password button a name that follows the state", async () => {
    const wrapper = mountField({ type: "password" });

    expect(wrapper.get("button").text()).toBe("text-input-show-password");
    await wrapper.get("button").trigger("click");
    expect(wrapper.get("button").text()).toBe("text-input-hide-password");
  });

  describe("plain variant", () => {
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
