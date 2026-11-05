import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import Keyboard from "../Keyboard.vue";

vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (id: string) => id }) }));

/** Mounts a keyboard that writes the model back, as a parent with `v-model` does. */
function mountKeyboard(modelValue: number | null = 0, variant: "ghost" | "primary" = "ghost") {
  const wrapper = mount(Keyboard, {
    props: {
      modelValue,
      "onUpdate:modelValue": (value: number | null | undefined) => wrapper.setProps({ modelValue: value }),
      variant,
    },
  });
  return wrapper;
}

/** Returns the key with this text or this accessible name. */
function key(wrapper: ReturnType<typeof mountKeyboard>, name: string) {
  const found = wrapper
    .findAll("button")
    .find((button) => button.text() === name || button.attributes("aria-label") === name);
  if (!found) throw new Error(`No key named ${name}`);
  return found;
}

/** Returns the text of the calculator line. */
function line(wrapper: ReturnType<typeof mountKeyboard>) {
  return wrapper.get("[data-test='keyboard-expression']").text();
}

describe("Keyboard", () => {
  it("uses a native button for each key, so that a keyboard and a screen reader can use it", () => {
    const buttons = mountKeyboard().findAll("button");

    expect(buttons).toHaveLength(16);
    for (const button of buttons) {
      expect(button.attributes("type")).toBe("button");
    }
  });

  it("gives each key a name", () => {
    const buttons = mountKeyboard().findAll("button");

    for (const button of buttons) {
      expect(button.text() || button.attributes("aria-label")).toBeTruthy();
    }
  });

  it("names the keys that have an icon or a mark", () => {
    const wrapper = mountKeyboard();

    for (const name of [
      "keyboard-plus",
      "keyboard-minus",
      "keyboard-times",
      "keyboard-divide",
      "keyboard-backspace",
      "keyboard-decimal",
    ]) {
      expect(key(wrapper, name).exists()).toBe(true);
    }
  });

  it("groups the keys under one name", () => {
    const group = mountKeyboard().get("[role='group']");

    expect(group.attributes("aria-label")).toBe("keyboard-label");
  });

  it("announces the line to a screen reader", () => {
    const expression = mountKeyboard().get("[data-test='keyboard-expression']");

    expect(expression.attributes("aria-live")).toBe("polite");
    expect(expression.attributes("aria-atomic")).toBe("true");
  });

  it("writes the value to the model after each key press", async () => {
    const wrapper = mountKeyboard();

    await key(wrapper, "1").trigger("click");
    await key(wrapper, "keyboard-decimal").trigger("click");
    await key(wrapper, "5").trigger("click");

    expect(wrapper.props("modelValue")).toBe(1.5);
    expect(line(wrapper)).toBe("1.5");
  });

  it("calculates and removes with the icon keys", async () => {
    const wrapper = mountKeyboard();

    await key(wrapper, "2").trigger("click");
    await key(wrapper, "keyboard-plus").trigger("click");
    await key(wrapper, "3").trigger("click");
    expect(wrapper.props("modelValue")).toBe(5);

    await key(wrapper, "keyboard-backspace").trigger("click");
    expect(line(wrapper)).toBe("2 +");
    expect(wrapper.props("modelValue")).toBe(2);
  });

  it("does not fail on a division by zero", async () => {
    const wrapper = mountKeyboard(8);

    await key(wrapper, "keyboard-divide").trigger("click");
    await key(wrapper, "0").trigger("click");

    expect(line(wrapper)).toBe("8 ÷ 0");
    expect(wrapper.props("modelValue")).toBe(8);
  });

  it("shows the starting value at the first render", () => {
    expect(line(mountKeyboard(12.5))).toBe("12.5");
  });

  it("loads a value that comes from outside", async () => {
    const wrapper = mountKeyboard(5);

    await wrapper.setProps({ modelValue: 7 });
    await nextTick();

    expect(line(wrapper)).toBe("7");
  });

  it("keeps the line when the model gets the value that the keyboard wrote", async () => {
    const wrapper = mountKeyboard();

    await key(wrapper, "2").trigger("click");
    await key(wrapper, "keyboard-plus").trigger("click");
    await key(wrapper, "3").trigger("click");

    expect(line(wrapper)).toBe("2 + 3");
  });

  it("changes only the frame for each variant", () => {
    const ghost = mountKeyboard(0, "ghost");
    const primary = mountKeyboard(0, "primary");

    expect(ghost.classes()).toContain("border-transparent");
    expect(primary.classes()).toContain("bg-base-bg-secondary");
    expect(primary.findAll("button").map((button) => button.classes())).toEqual(
      ghost.findAll("button").map((button) => button.classes())
    );
  });
});
