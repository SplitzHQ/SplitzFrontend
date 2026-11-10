import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AddTransactionRequest, ReceiptDto, TransactionDto } from "@/backend";

import { useTransactionStore } from "../transaction";

const transactionApiMock = vi.hoisted(() => ({
  addTransaction: vi.fn<(request: AddTransactionRequest) => Promise<TransactionDto>>(),
}));

vi.mock("@/backend", () => ({
  TransactionApi: class {
    addTransaction = transactionApiMock.addTransaction;
  },
}));

vi.mock("@/backend/config", () => ({ default: {} }));

vi.mock("@pinia/colada", () => ({
  useQueryCache: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/libs/asset-url", () => ({
  resolveAssetUrl: (url: string) => `https://assets.example.test/${url}`,
}));

const recognition: ReceiptDto = {
  amount: "12.50",
  category: "dining_out",
  createTime: new Date("2026-03-14T18:40:00.000Z"),
  currency: "EUR",
  images: ["receipts/u1/r1/1.webp", "receipts/u1/r1/2.webp"],
  location: "Mint St",
  model: "vision-1",
  name: "Blue Bottle",
  receiptId: "00000000-0000-0000-0000-00000000000a",
  status: "Succeeded",
  transactionTime: new Date("2026-03-14T18:30:00.000Z"),
  usedCustomProvider: true,
};

describe("useTransactionStore receipt recognition", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("prefills the draft from a recognized receipt", () => {
    const store = useTransactionStore();
    store.transaction = { amount: 0, currency: "USD", name: "Typed name", userId: "u1" };

    store.applyReceiptRecognition(recognition);

    expect(store.receiptId).toBe(recognition.receiptId);
    expect(store.transaction.amount).toBe(12.5);
    expect(store.transaction.currency).toBe("EUR");
    expect(store.transaction.name).toBe("Blue Bottle");
    expect(store.transaction.icon).toBe("dining_out");
    expect(store.transaction.transactionTime).toEqual(recognition.transactionTime);
    expect(store.transaction.geoCoordinate).toBe("Mint St");
    expect(store.previewPhotoBase64).toBe("https://assets.example.test/receipts/u1/r1/1.webp");
  });

  it("keeps typed values when the model left a field empty or invalid", () => {
    const store = useTransactionStore();
    store.transaction = { amount: 42, currency: "USD", icon: "fuel", name: "Typed name", userId: "u1" };

    store.applyReceiptRecognition({
      ...recognition,
      amount: "0",
      category: "not_a_category",
      currency: null,
      images: [],
      location: null,
      name: null,
      transactionTime: null,
    });

    expect(store.transaction.amount).toBe(42);
    expect(store.transaction.currency).toBe("USD");
    expect(store.transaction.name).toBe("Typed name");
    expect(store.transaction.icon).toBe("uncategorized");
    expect(store.transaction.transactionTime).toBeUndefined();
    expect(store.previewPhotoBase64).toBeUndefined();
  });

  it("sends the recognition id and the receipt date with the saved expense", async () => {
    const store = useTransactionStore();
    store.transaction = { amount: 0, currency: "USD", groupId: "g1", userId: "u1" };
    store.members = [{ id: "u1", userName: "Me" }];
    store.paidBy = "u1";
    store.addToIncludedMembers("u1");
    transactionApiMock.addTransaction.mockImplementation(({ transactionInputDto }) =>
      Promise.resolve({ ...transactionInputDto!, balances: [], transactionId: "t1" })
    );

    store.applyReceiptRecognition(recognition);
    await store.saveTransaction();

    expect(transactionApiMock.addTransaction).toHaveBeenCalledTimes(1);
    const transactionInputDto = transactionApiMock.addTransaction.mock.calls[0][0].transactionInputDto!;
    expect(transactionInputDto.receiptId).toBe(recognition.receiptId);
    expect(transactionInputDto.transactionTime).toEqual(recognition.transactionTime);
    expect(transactionInputDto.amount).toBe("12.50");
    expect(transactionInputDto.currency).toBe("EUR");
    expect(transactionInputDto.icon).toBe("dining_out");

    store.resetTransactionStore();
    expect(store.receiptId).toBeUndefined();
    expect(store.previewPhotoBase64).toBeUndefined();
  });
});

/** Makes a draft that three members split equally. The first member paid. */
function splitAmongThree(amount: number, currency: string) {
  const store = useTransactionStore();
  store.transaction = { amount, currency, groupId: "g1", userId: "u1" };
  store.members = [
    { id: "u1", userName: "A" },
    { id: "u2", userName: "B" },
    { id: "u3", userName: "C" },
  ];
  store.paidBy = "u1";
  for (const id of ["u1", "u2", "u3"]) store.addToIncludedMembers(id);
  return store;
}

describe("useTransactionStore currency decimal places", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    transactionApiMock.addTransaction.mockImplementation(({ transactionInputDto }) =>
      Promise.resolve({ ...transactionInputDto!, balances: [], transactionId: "t1" })
    );
  });

  it("splits a JPY amount in whole yen", () => {
    const store = splitAmongThree(1000, "JPY");

    expect(store.amountDecimals).toBe(0);
    expect(store.finalSplitAmount).toEqual({ u1: 334, u2: 333, u3: 333 });
    expect(store.isUserInputValid).toBe(true);
  });

  it("splits a USD amount in cents", () => {
    const store = splitAmongThree(10, "USD");

    expect(store.amountDecimals).toBe(2);
    expect(Object.values(store.finalSplitAmount).map((value) => value.toFixed(2))).toEqual(["3.34", "3.33", "3.33"]);
  });

  it("saves a JPY expense with no decimal places", async () => {
    const store = splitAmongThree(1000, "JPY");

    await store.saveTransaction();

    const input = transactionApiMock.addTransaction.mock.calls[0][0].transactionInputDto!;
    expect(input.amount).toBe("1000");
    expect(input.name).toBe("Expense - JPY 1000");
    expect(input.balances?.map((entry) => entry.balance)).toEqual(["666", "-333", "-333"]);
  });

  it("saves a KWD expense with three decimal places", async () => {
    const store = splitAmongThree(1.5, "KWD");

    await store.saveTransaction();

    const input = transactionApiMock.addTransaction.mock.calls[0][0].transactionInputDto!;
    expect(input.amount).toBe("1.500");
    expect(input.balances?.map((entry) => entry.balance)).toEqual(["1.000", "-0.500", "-0.500"]);
  });
});
