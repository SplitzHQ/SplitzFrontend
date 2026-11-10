import { Big } from "big.js";
import { describe, expect, it } from "vitest";

import type { InvoiceDto, InvoiceSettlementDto, TransactionDto } from "@/backend";

import {
  canCancel,
  dateRange,
  nextAction,
  previewRound,
  roundProgress,
  roundTransfers,
  simplifyDebts,
} from "../settle-up-round";

const ME = { id: "me", userName: "You" };
const MIA = { id: "mia", userName: "Mia" };
const BEN = { id: "ben", userName: "Ben" };
const LEO = { id: "leo", userName: "Leo" };

/** Returns an expense with a balance for each user, as the backend sends it. */
function expense(id: string, currency: string, balances: [typeof ME, string][], day = 1, invoiceId?: string) {
  const time = new Date(2026, 10, day, 12);
  return {
    amount: "0",
    balances: balances.map(([user, balance]) => ({ balance, user, userId: user.id })),
    createTime: time,
    currency,
    groupId: "group",
    icon: "dining_out",
    invoiceId,
    name: id,
    tags: [],
    transactionId: id,
    transactionTime: time,
  } as TransactionDto;
}

/** Returns a settlement of a round. */
function payment(from: typeof ME, to: typeof ME, isConfirmed: boolean): InvoiceSettlementDto {
  return {
    amount: "30.00",
    fromUser: from,
    invoiceId: "round",
    invoiceSettlementId: `${from.id}-${to.id}`,
    isConfirmed,
    recordedBy: from,
    recordedTime: new Date(2026, 10, 9),
    toUser: to,
  };
}

/** Returns a round with these debts and settlements. */
function round(debts: [typeof ME, typeof ME, string, string][], settlements: InvoiceSettlementDto[] = []): InvoiceDto {
  return {
    createTime: new Date(2026, 10, 9),
    createdBy: ME,
    currency: "USD",
    debts: debts.map(([fromUser, toUser, amount, remaining]) => ({
      amount,
      fromUser,
      invoiceId: "round",
      paid: "0",
      remaining,
      toUser,
    })),
    groupId: "group",
    invoiceId: "round",
    settlements,
    status: "Open",
  };
}

describe("simplifyDebts", () => {
  it("matches the largest debtor to the largest creditor, as the backend does", () => {
    const net = new Map([
      ["me", new Big("-12.50")],
      ["mia", new Big("60.75")],
      ["ben", new Big("-30.00")],
      ["leo", new Big("-18.25")],
    ]);

    expect(simplifyDebts(net).map((debt) => [debt.fromUserId, debt.toUserId, debt.amount.toFixed(2)])).toEqual([
      ["ben", "mia", "30.00"],
      ["leo", "mia", "18.25"],
      ["me", "mia", "12.50"],
    ]);
  });

  it("orders equal amounts by user ID", () => {
    const net = new Map([
      ["b", new Big("-10")],
      ["a", new Big("-10")],
      ["c", new Big("20")],
    ]);

    expect(simplifyDebts(net).map((debt) => debt.fromUserId)).toEqual(["a", "b"]);
  });
});

describe("previewRound", () => {
  it("keeps only the expenses that no round covers, one entry for each currency", () => {
    const previews = previewRound([
      expense("dinner", "USD", [
        [ME, "24.00"],
        [MIA, "-24.00"],
      ]),
      expense("taxi", "EUR", [
        [MIA, "10.00"],
        [BEN, "-10.00"],
      ]),
      expense("old", "USD", [[ME, "5.00"]], 1, "old-round"),
    ]);

    expect(previews.map((preview) => preview.currency)).toEqual(["EUR", "USD"]);
    expect(previews[1].transactions.map((item) => item.transactionId)).toEqual(["dinner"]);
    expect(previews[1].transfers).toEqual([{ amount: "24.00", currency: "USD", from: MIA, to: ME }]);
  });
});

describe("roundTransfers", () => {
  it("reads open, sent and done from the debts and the payments", () => {
    const transfers = roundTransfers(
      round(
        [
          [ME, MIA, "42.50", "42.50"],
          [BEN, ME, "30.00", "30.00"],
          [LEO, MIA, "18.25", "0"],
        ],
        [payment(BEN, ME, false)]
      )
    );

    expect(transfers.map((transfer) => transfer.state)).toEqual(["open", "sent", "done"]);
    expect(transfers[1].pending?.invoiceSettlementId).toBe("ben-me");
    expect(roundProgress(transfers)).toEqual({ done: 1, total: 3 });
  });

  it("does not count a confirmed payment as one that waits", () => {
    const [transfer] = roundTransfers(round([[BEN, ME, "30.00", "10.00"]], [payment(BEN, ME, true)]));

    expect(transfer.state).toBe("open");
    expect(transfer.pending).toBeNull();
  });
});

describe("nextAction", () => {
  const transfers = roundTransfers(
    round(
      [
        [ME, MIA, "42.50", "42.50"],
        [BEN, ME, "30.00", "30.00"],
      ],
      [payment(BEN, ME, false)]
    )
  );

  it("asks the user to confirm before it asks the user to pay", () => {
    expect(nextAction(transfers, ME.id)).toMatchObject({ kind: "confirm", transfer: { from: BEN } });
  });

  it("asks the user to pay when nothing waits for a confirm", () => {
    expect(nextAction(transfers.slice(0, 1), ME.id)).toMatchObject({ kind: "pay", transfer: { to: MIA } });
  });

  it("returns null for a user with nothing to do", () => {
    expect(nextAction(transfers, LEO.id)).toBeNull();
    expect(nextAction(transfers, undefined)).toBeNull();
  });
});

describe("canCancel", () => {
  it("lets the starter cancel while no payment is confirmed", () => {
    expect(canCancel([round([], [payment(BEN, ME, false)])], ME.id)).toBe(true);
  });

  it("refuses another member or a round with a confirmed payment", () => {
    expect(canCancel([round([])], MIA.id)).toBe(false);
    expect(canCancel([round([], [payment(BEN, ME, true)])], ME.id)).toBe(false);
    expect(canCancel([], ME.id)).toBe(false);
  });
});

describe("dateRange", () => {
  it("returns the first and the last day", () => {
    const range = dateRange([expense("a", "USD", [], 5), expense("b", "USD", [], 1), expense("c", "USD", [], 3)]);

    expect(range?.first.getDate()).toBe(1);
    expect(range?.last.getDate()).toBe(5);
    expect(dateRange([])).toBeNull();
  });
});
