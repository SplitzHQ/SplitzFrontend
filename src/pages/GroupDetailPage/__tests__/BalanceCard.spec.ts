import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { createAppFluent } from "@/libs/fluent";

import BalanceCard, { type BalanceCardMember, type BalanceCardProps } from "../BalanceCard.vue";

/** Removes the marks that Fluent puts around a value. */
function plain(text: string) {
  return text.replace(/\p{Cf}/gu, "");
}

/** Returns one member line. A negative amount means that the member owes the user. */
function member(name: string, amount: string): BalanceCardMember {
  return { amount, currency: "USD", name, userId: name };
}

/** Mounts a card with the real English messages. */
function mountCard(props: BalanceCardProps) {
  return mount(BalanceCard, { global: { plugins: [createAppFluent()] }, props });
}

describe("BalanceCard", () => {
  it("names the direction of the net amount and shows the amount with no sign", () => {
    const wrapper = mountCard({ currency: "USD", memberBalances: [member("Mia", "25.00")], totalBalance: "-25.00" });

    expect(wrapper.text()).toContain("You owe");
    expect(wrapper.get('[data-test="balance-card-total"]').text()).toBe("$25.00");
    expect(wrapper.get('[data-test="balance-card-total"]').classes()).toContain("text-base-text-owe");
  });

  it("writes one line for each member, with the name in the darker color", () => {
    const wrapper = mountCard({
      currency: "USD",
      memberBalances: [member("Bob", "-51.25"), member("Mia", "10.00")],
      totalBalance: "41.25",
    });

    const lines = wrapper.findAll('[data-test="balance-card-direction"]');
    expect(lines.map((line) => plain(line.text()))).toEqual(["Bob owes you", "You owe Mia"]);
    expect(lines[0].get(".text-base-text-primary").text()).toBe("Bob");
  });

  it("emits settleUp from the button", async () => {
    const wrapper = mountCard({ currency: "USD", memberBalances: [member("Bob", "-5.00")], totalBalance: "5.00" });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("settleUp")).toHaveLength(1);
  });

  it("says that a settled group is settled and shows no button", () => {
    const wrapper = mountCard({ currency: "USD", memberBalances: [], totalBalance: "0" });

    expect(wrapper.text()).toContain("All settled up");
    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.find("ul").exists()).toBe(false);
  });

  it("hides the button while a settle-up round runs and keeps the amounts", () => {
    const wrapper = mountCard({
      canSettle: false,
      currency: "USD",
      memberBalances: [member("Bob", "-5.00")],
      totalBalance: "5.00",
    });

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.get('[data-test="balance-card-total"]').text()).toBe("$5.00");
  });
});
