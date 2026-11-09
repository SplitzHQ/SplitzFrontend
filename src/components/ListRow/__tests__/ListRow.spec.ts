import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import { formatCurrency } from "@/libs/format-currency";

import AmountChip from "../AmountChip.vue";
import { LIST_ROW_TEXT } from "../list-row";
import ListRowContent from "../ListRowContent.vue";

/** Mounts the content in a div, because its root is a fragment. */
function mountRow(props: { title: string; subtitle?: string }, slots: Record<string, () => unknown> = {}) {
  return mount({ render: () => h("div", [h(ListRowContent, props, slots)]) });
}

describe("ListRowContent", () => {
  it("shows the name with the title level and the line under it with the subtitle level", () => {
    const wrapper = mountRow({ subtitle: "You paid $50.00", title: "Dinner" });
    const [title, subtitle] = wrapper.findAll("p");

    expect(title.text()).toBe("Dinner");
    expect(title.classes()).toEqual(expect.arrayContaining(["truncate", ...LIST_ROW_TEXT.title.split(" ")]));
    expect(subtitle.text()).toBe("You paid $50.00");
    expect(subtitle.classes()).toEqual(expect.arrayContaining(LIST_ROW_TEXT.subtitle.split(" ")));
  });

  it("shows no empty line when the row has no subtitle", () => {
    expect(mountRow({ subtitle: "", title: "Create group" }).findAll("p")).toHaveLength(1);
  });

  it("puts the slots in reading order: start, name, lines under the name, end", () => {
    const wrapper = mountRow(
      { title: "Ski trip" },
      {
        leading: () => h("span", "start"),
        subtitle: () => h("p", "You owe"),
        trailing: () => h("span", "end"),
      }
    );

    expect(wrapper.text()).toBe("startSki tripYou oweend");
  });
});

describe("AmountChip", () => {
  it("shows the absolute value, so the direction label gives the sign", () => {
    const chip = mount(AmountChip, { props: { amount: "-25.00", currency: "USD", tone: "owes" } });

    expect(chip.text()).toBe(formatCurrency(25, "USD"));
  });

  it("uses green on the success fill for money that the user gets, and red on the error fill for money that the user owes", () => {
    const owed = mount(AmountChip, { props: { amount: 10, currency: "USD", tone: "owed" } });
    const owes = mount(AmountChip, { props: { amount: 10, currency: "USD", tone: "owes" } });

    expect(owed.classes()).toEqual(expect.arrayContaining(["bg-base-bg-success-subtle", "text-base-text-success"]));
    expect(owes.classes()).toEqual(expect.arrayContaining(["bg-base-bg-error", "text-base-text-error"]));
  });

  it("has the size and the weight of the direction label next to it", () => {
    const chip = mount(AmountChip, { props: { amount: 10, currency: "USD", tone: "owed" } });
    const labelSize = LIST_ROW_TEXT.direction
      .split(" ")
      .filter((name) => name.startsWith("text-sm") || name.startsWith("font-"));

    expect(chip.classes()).toEqual(expect.arrayContaining(labelSize));
  });

  it("shows the default slot in place of the formatted amount", () => {
    const chip = mount(AmountChip, { props: { tone: "owed" }, slots: { default: () => "rolling" } });

    expect(chip.text()).toBe("rolling");
  });
});
