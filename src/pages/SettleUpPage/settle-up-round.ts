import { Big } from "big.js";

import {
  type InvoiceDto,
  type InvoiceReducedDto,
  type InvoiceSettlementDto,
  InvoiceStatus,
  type SplitzUserReducedDto,
  type TransactionDto,
} from "@/backend";

/**
 * The logic of a settle-up round (SPZ-105). The backend keeps a round as an invoice: one invoice for each currency, its
 * debts are the transfers, and its settlements are the payments. The app never says "invoice".
 */

/**
 * The state of one transfer.
 * - open: nobody marked it paid.
 * - sent: the payer marked it paid, and the receiver must confirm it.
 * - done: the receiver confirmed the full amount.
 */
export type TransferState = "open" | "sent" | "done";

/** One transfer of a round: who pays whom, how much, and how far it is. */
export interface RoundTransfer {
  invoiceId: string;
  from: SplitzUserReducedDto;
  to: SplitzUserReducedDto;
  /** The full amount of the transfer. */
  amount: string;
  /** The amount that is not confirmed yet. The payer pays this amount. */
  remaining: string;
  currency: string;
  state: TransferState;
  /** The payment that waits for the receiver, when the state is "sent". */
  pending: InvoiceSettlementDto | null;
}

/** A transfer that the start sheet shows before the round exists. */
export interface PreviewTransfer {
  from: SplitzUserReducedDto;
  to: SplitzUserReducedDto;
  amount: string;
  currency: string;
}

/** The expenses of one currency that a new round covers, and the transfers that settle them. */
export interface CurrencyPreview {
  currency: string;
  transactions: TransactionDto[];
  transfers: PreviewTransfer[];
}

/** One transfer that settles the net balances. The amount is always positive. */
interface SuggestedTransfer {
  fromUserId: string;
  toUserId: string;
  amount: Big;
}

/** Orders two balances by user ID, with the code-unit order of the backend's `StringComparer.Ordinal`. */
function byKey(a: [string, Big], b: [string, Big]): number {
  if (a[0] === b[0]) return 0;
  return a[0] < b[0] ? -1 : 1;
}

/**
 * Matches the largest debtors to the largest creditors, as `DebtSimplifier` in SplitzBackend does. The backend makes
 * the transfers of a new round with that class, so the preview must use the same order to show the same transfers.
 * A positive balance is money that the user gets back. A negative balance is money that the user owes.
 */
export function simplifyDebts(netBalances: ReadonlyMap<string, Big>): SuggestedTransfer[] {
  const entries = [...netBalances.entries()];
  const creditors = entries
    .filter(([, amount]) => amount.gt(0))
    .sort((a, b) => b[1].cmp(a[1]) || byKey(a, b))
    .map(([userId, amount]) => ({ amount, userId }));
  const debtors = entries
    .filter(([, amount]) => amount.lt(0))
    .sort((a, b) => a[1].cmp(b[1]) || byKey(a, b))
    .map(([userId, amount]) => ({ amount: amount.neg(), userId }));

  const transfers: SuggestedTransfer[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = creditor.amount.lt(debtor.amount) ? creditor.amount : debtor.amount;
    transfers.push({ amount, fromUserId: debtor.userId, toUserId: creditor.userId });
    creditor.amount = creditor.amount.minus(amount);
    debtor.amount = debtor.amount.minus(amount);
    if (creditor.amount.eq(0)) creditorIndex++;
    if (debtor.amount.eq(0)) debtorIndex++;
  }
  return transfers;
}

/** Returns the expenses that no round covers yet. A new round covers these expenses. */
export function uncoveredTransactions(transactions: readonly TransactionDto[]): TransactionDto[] {
  return transactions.filter((transaction) => !transaction.invoiceId && transaction.transactionId);
}

/**
 * Returns what a new round would cover, one entry for each currency: the expenses and the transfers. The transfers come
 * from the balances of the expenses, as `InvoiceDebtService.SimplifyDebts` makes them in the backend.
 */
export function previewRound(transactions: readonly TransactionDto[]): CurrencyPreview[] {
  const byCurrency = new Map<string, TransactionDto[]>();
  for (const transaction of uncoveredTransactions(transactions)) {
    byCurrency.set(transaction.currency, [...(byCurrency.get(transaction.currency) ?? []), transaction]);
  }

  return [...byCurrency.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([currency, items]) => {
      const users = new Map<string, SplitzUserReducedDto>();
      const net = new Map<string, Big>();
      for (const item of items) {
        for (const entry of item.balances ?? []) {
          users.set(entry.userId, entry.user);
          net.set(entry.userId, (net.get(entry.userId) ?? new Big(0)).plus(entry.balance ?? 0));
        }
      }
      const transfers = simplifyDebts(net).map((transfer) => ({
        amount: transfer.amount.toFixed(2),
        currency,
        from: users.get(transfer.fromUserId)!,
        to: users.get(transfer.toUserId)!,
      }));
      return { currency, transactions: items, transfers };
    });
}

/** Returns the transfers of one invoice of a round, with the state of each transfer. */
export function roundTransfers(invoice: InvoiceDto): RoundTransfer[] {
  const settlements = invoice.settlements ?? [];
  return (invoice.debts ?? []).map((debt) => {
    const pending =
      settlements.find(
        (settlement) =>
          !settlement.isConfirmed &&
          settlement.fromUser.id === debt.fromUser.id &&
          settlement.toUser.id === debt.toUser.id
      ) ?? null;
    let state: TransferState = "open";
    if (new Big(debt.remaining).lte(0)) state = "done";
    else if (pending) state = "sent";
    return {
      amount: debt.amount,
      currency: invoice.currency,
      from: debt.fromUser,
      invoiceId: invoice.invoiceId,
      pending,
      remaining: debt.remaining,
      state,
      to: debt.toUser,
    };
  });
}

/** Returns how many transfers are done, and how many there are. */
export function roundProgress(transfers: readonly RoundTransfer[]): { done: number; total: number } {
  return { done: transfers.filter((transfer) => transfer.state === "done").length, total: transfers.length };
}

/**
 * Returns what the current user must do next in a round, or null when nothing waits for the user.
 * A payment to confirm comes first, because another person waits for it.
 */
export function nextAction(
  transfers: readonly RoundTransfer[],
  userId: string | undefined
): { kind: "confirm" | "pay"; transfer: RoundTransfer } | null {
  if (!userId) return null;
  const confirm = transfers.find((transfer) => transfer.to.id === userId && transfer.state === "sent");
  if (confirm) return { kind: "confirm", transfer: confirm };
  const pay = transfers.find((transfer) => transfer.from.id === userId && transfer.state === "open");
  if (pay) return { kind: "pay", transfer: pay };
  return null;
}

/** True while the round of this invoice waits for payments. */
export function isActive(invoice: Pick<InvoiceReducedDto, "status">): boolean {
  return invoice.status === InvoiceStatus.Open;
}

/** True when nobody confirmed a payment of the round, so the person who started it can still cancel it. */
export function canCancel(invoices: readonly InvoiceDto[], userId: string | undefined): boolean {
  return (
    invoices.length > 0 &&
    invoices.every(
      (invoice) =>
        invoice.createdBy.id === userId && (invoice.settlements ?? []).every((settlement) => !settlement.isConfirmed)
    )
  );
}

/** Returns the first and the last day of the expenses, for a line such as "Nov 1 – Nov 5". */
export function dateRange(transactions: readonly TransactionDto[]): { first: Date; last: Date } | null {
  if (transactions.length === 0) return null;
  const times = transactions.map((transaction) => new Date(transaction.transactionTime).getTime());
  return { first: new Date(Math.min(...times)), last: new Date(Math.max(...times)) };
}
