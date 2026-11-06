import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import type { TransactionBalanceDto, TransactionDto } from "@/backend";
import { formatCurrency } from "@/libs/format-currency";
import SelectableTransactionItem from "@/pages/SettleUpPage/SelectableTransactionItem.vue";

import { balanceOf, findTransactionPayer } from "../transaction-row";
import TransactionItem from "../TransactionItem.vue";

vi.mock("@/stores/user", () => ({ useUserStore: () => ({ user: { id: "me" } }) }));
vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (id: string, args?: Record<string, unknown>) => (args ? `${id}:${JSON.stringify(args)}` : id),
  }),
}));

const ME = "me";

/** Returns one balance entry. The name of the user is the ID. */
function balance(userId: string, amount: string | undefined): TransactionBalanceDto {
  return { balance: amount, user: { id: userId, userName: userId }, userId };
}

/** Returns a transaction of 50 USD with these balances. */
function transaction(balances: TransactionBalanceDto[], name = "Dinner"): TransactionDto {
  return {
    amount: "50.00",
    balances,
    createTime: new Date(0),
    currency: "USD",
    groupId: "group",
    icon: "groceries",
    name,
    tags: [],
    transactionId: "tx",
    transactionTime: new Date(0),
  };
}

/** Mounts a link row with the router and the `$t` of the template. */
async function mountLink(value: TransactionDto) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { component: { render: () => null }, path: "/" },
      {
        component: { render: () => null },
        name: "transactionDetail",
        path: "/group/:groupId/transaction/:transactionId",
      },
    ],
  });
  await router.push("/");
  return mount(TransactionItem, {
    global: {
      mocks: { $t: (id: string) => id },
      plugins: [router],
    },
    props: { transaction: value },
  });
}

/** Mounts a row that the user can select. */
function mountSelectable(selected: boolean) {
  return mount(SelectableTransactionItem, {
    global: { mocks: { $t: (id: string) => id }, stubs: { transition: false } },
    props: { selected, transaction: transaction([balance("a", "25.00"), balance("b", "-25.00")]) },
  });
}

describe("findTransactionPayer", () => {
  it("returns null without balances", () => {
    expect(findTransactionPayer(undefined)).toBeNull();
    expect(findTransactionPayer([])).toBeNull();
  });

  it("returns the user with the positive balance", () => {
    const payer = findTransactionPayer([balance("a", "-25.00"), balance("b", "25.00")]);

    expect(payer?.id).toBe("b");
  });

  it("returns the only user when that user paid only for that user", () => {
    expect(findTransactionPayer([balance("a", "0.00")])?.id).toBe("a");
  });

  it("does not name a user who owes money when the payer is not in the list", () => {
    expect(findTransactionPayer([balance("a", "-25.00"), balance("b", "-25.00")])).toBeNull();
    expect(findTransactionPayer([balance("a", "-50.00")])).toBeNull();
  });

  it("returns null when several users have a zero balance", () => {
    expect(findTransactionPayer([balance("a", "0.00"), balance("b", "0.00")])).toBeNull();
  });

  it("returns the larger balance for two payers", () => {
    const payer = findTransactionPayer([balance("a", "10.00"), balance("b", "30.00"), balance("c", "-40.00")]);

    expect(payer?.id).toBe("b");
  });

  it("reads a missing balance as zero", () => {
    expect(balanceOf(balance("a", undefined))).toBe(0);
    expect(findTransactionPayer([balance("a", undefined)])?.id).toBe("a");
  });
});

describe("TransactionItem", () => {
  it("links to the detail page of the transaction", async () => {
    const wrapper = await mountLink(transaction([balance(ME, "25.00"), balance("a", "-25.00")]));

    expect(wrapper.get("a").attributes("href")).toBe("/group/group/transaction/tx");
  });

  it("has a focus ring, motion tokens and a press that scales only without reduced motion", async () => {
    const classes = (await mountLink(transaction([]))).get("a").classes().join(" ");

    expect(classes).toContain("focus-visible:outline-2");
    expect(classes).toContain("var(--motion-duration-hover-in)");
    expect(classes).toContain("active:scale-98");
    expect(classes).toContain("motion-reduce:active:scale-100");
  });

  it("reads the row in order for a screen reader", async () => {
    const wrapper = await mountLink(transaction([balance(ME, "-25.00"), balance("a", "25.00")]));
    const parts = wrapper.findAll("p").map((part) => part.text());

    expect(parts[0]).toBe("Dinner");
    expect(parts[1]).toContain("group-detail-paid-by");
    expect(parts[2]).toBe("group-detail-you-owe-label");
    expect(parts[3]).toBe(formatCurrency(25, "USD"));
  });

  it("does not show a minus sign beside the label for money that the user owes", async () => {
    const wrapper = await mountLink(transaction([balance(ME, "-25.00"), balance("a", "25.00")]));
    const amount = wrapper.findAll("p")[3];

    expect(amount.text()).not.toContain("-");
    expect(amount.classes()).toContain("text-base-text-error");
  });

  it("shows money that the user gets with the success color", async () => {
    const wrapper = await mountLink(transaction([balance(ME, "25.00"), balance("a", "-25.00")]));
    const parts = wrapper.findAll("p");

    expect(parts[2].text()).toBe("group-detail-you-lent-label");
    expect(parts[3].classes()).toContain("text-base-text-success");
  });

  it("shows no balance when the user is not in the split or has a zero balance", async () => {
    const notInSplit = await mountLink(transaction([balance("a", "25.00"), balance("b", "-25.00")]));
    const paidForSelf = await mountLink(transaction([balance(ME, "0.00")]));

    expect(notInSplit.findAll("p")).toHaveLength(2);
    expect(paidForSelf.findAll("p")).toHaveLength(2);
  });

  it("uses the amount as the name when the transaction has no name", async () => {
    const wrapper = await mountLink(transaction([], ""));

    expect(wrapper.findAll("p")[0].text()).toBe(formatCurrency(50, "USD"));
  });

  it("hides the category icon from a screen reader", async () => {
    const wrapper = await mountLink(transaction([]));

    expect(wrapper.get("svg").attributes("aria-hidden")).toBe("true");
  });
});

describe("SelectableTransactionItem", () => {
  it("tells a screen reader the state", () => {
    expect(mountSelectable(true).get("button").attributes("aria-pressed")).toBe("true");
    expect(mountSelectable(false).get("button").attributes("aria-pressed")).toBe("false");
  });

  it("puts the slot at the end of the row and emits toggle", async () => {
    const wrapper = mountSelectable(false);
    const button = wrapper.get("button");

    expect(button.element.lastElementChild?.tagName.toLowerCase()).toBe("svg");

    await button.trigger("click");
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });
});
