import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { createAppFluent } from "@/libs/fluent";

import type { TransferState } from "../settle-up-round";
import TransferRow from "../TransferRow.vue";

const ME = { id: "me", userName: "You" };
const BEN = { id: "ben", userName: "Ben" };
const MIA = { id: "mia", userName: "Mia" };

/** Mounts a row. `i18n` renders the message ID, so the test reads the chosen sentence. */
function mountRow(from: typeof ME, to: typeof ME, state: TransferState | null) {
  return mount(TransferRow, {
    global: {
      mocks: { $t: (id: string) => id },
      stubs: { i18n: { props: ["path"], template: "<span data-test='sentence'>{{ path }}</span>" } },
    },
    props: { amount: "30.00", currency: "USD", from, state, to, userId: ME.id },
  });
}

describe("TransferRow", () => {
  it("says who pays whom from the view of the current user", () => {
    expect(mountRow(ME, MIA, null).get('[data-test="sentence"]').text()).toBe("settle-up-transfer-you-pay");
    expect(mountRow(BEN, ME, null).get('[data-test="sentence"]').text()).toBe("settle-up-transfer-pays-you");
    expect(mountRow(BEN, MIA, null).get('[data-test="sentence"]').text()).toBe("settle-up-transfer-between");
  });

  it("shows no state and no button in the start sheet", () => {
    const wrapper = mountRow(ME, MIA, null);

    expect(wrapper.find('[data-test="transfer-state"]').exists()).toBe(false);
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("gives the payer Mark paid on an open transfer", async () => {
    const wrapper = mountRow(ME, MIA, "open");

    await wrapper.get('[data-test="transfer-markPaid"]').trigger("click");

    expect(wrapper.emitted("markPaid")).toHaveLength(1);
  });

  it("gives the receiver Confirm on a transfer that waits", async () => {
    const wrapper = mountRow(BEN, ME, "sent");

    expect(wrapper.get('[data-test="transfer-state"]').text()).toContain("settle-up-state-sent-to-you");
    await wrapper.get('[data-test="transfer-confirm"]').trigger("click");

    expect(wrapper.emitted("confirm")).toHaveLength(1);
  });

  it("gives no button to a member who has nothing to do", () => {
    expect(mountRow(ME, MIA, "sent").find("button").exists()).toBe(false);
    expect(mountRow(BEN, MIA, "open").find("button").exists()).toBe(false);
    expect(mountRow(BEN, ME, "done").find("button").exists()).toBe(false);
  });

  it("puts the names in the darker color with the real messages", () => {
    const wrapper = mount(TransferRow, {
      global: { plugins: [createAppFluent()] },
      props: { amount: "42.50", currency: "USD", from: ME, state: "open", to: MIA, userId: ME.id },
    });

    expect(wrapper.text().replace(/\p{Cf}/gu, "")).toContain("You pay Mia");
    expect(wrapper.get(".text-base-text-primary").text()).toBe("Mia");
    expect(wrapper.get('[data-test="transfer-markPaid"]').text()).toBe("Mark paid");
  });
});
