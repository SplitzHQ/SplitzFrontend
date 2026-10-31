import { describe, expect, it } from "vitest";

import type { InvoiceDebtDto, InvoiceSettlementDto } from "@/backend";

import { getDebtProgress } from "../invoice-debts";

const ann = { id: "ann", userName: "Ann" };
const bob = { id: "bob", userName: "Bob" };
const cat = { id: "cat", userName: "Cat" };

function debt(fromUser: typeof ann, toUser: typeof ann, amount: string): InvoiceDebtDto {
  return { amount, fromUser, invoiceId: "i", toUser };
}

function payment(fromUser: typeof ann, toUser: typeof ann, amount: string): InvoiceSettlementDto {
  return {
    amount,
    fromUser,
    invoiceId: "i",
    invoiceSettlementId: `${fromUser.id}-${toUser.id}-${amount}`,
    recordedBy: fromUser,
    recordedTime: new Date(),
    toUser,
  };
}

describe("getDebtProgress", () => {
  it("leaves the full amount when nothing is paid", () => {
    const [progress] = getDebtProgress([debt(ann, bob, "12.50")], []);
    expect(progress.paid.toString()).toBe("0");
    expect(progress.remaining.toString()).toBe("12.5");
  });

  it("sums payments for the same pair without float drift", () => {
    const [progress] = getDebtProgress([debt(ann, bob, "0.3")], [payment(ann, bob, "0.1"), payment(ann, bob, "0.2")]);
    expect(progress.paid.toString()).toBe("0.3");
    expect(progress.remaining.toString()).toBe("0");
  });

  it("ignores payments in the other direction or between other people", () => {
    const [progress] = getDebtProgress([debt(ann, bob, "10")], [payment(bob, ann, "10"), payment(ann, cat, "10")]);
    expect(progress.remaining.toString()).toBe("10");
  });

  it("never reports a negative remaining amount", () => {
    const [progress] = getDebtProgress([debt(ann, bob, "5")], [payment(ann, bob, "8")]);
    expect(progress.remaining.toString()).toBe("0");
  });
});
