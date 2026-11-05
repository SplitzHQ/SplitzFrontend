import type { SplitzUserReducedDto, TransactionBalanceDto } from "@/backend";

/**
 * The classes of an element that holds `TransactionItemContent` and reacts to a press: a link or a button.
 * The pressed fill extends 8px past the content on each side, and the content stays in its place. The parent must have
 * this space. See `transaction-item.usage.ts`.
 * The caller adds the offset of the focus ring, because the ring must fit in the scroll area of the screen.
 */
export const TRANSACTION_ROW_CLASS =
  "-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 touch-manipulation transition-colors duration-hover-in ease-standard active:bg-base-bg-secondary_hover focus-visible:outline-2 focus-visible:outline-base-border-brand-solid";

/**
 * Returns the user who paid for a transaction, or null when the balances do not show it.
 * The backend does not send the payer. A balance is the amount paid minus the share of the user, so:
 * - The payer is the user with the largest positive balance.
 * - One user with a zero balance paid only for that user.
 * - Without a positive balance, several users give no answer. The payer is not always in the list: the new-expense
 *   flow saves balances only for the users in the split. Do not name a user who owes money as the payer.
 *
 * Two users can have a positive balance if the backend gets a transaction with two payers. The function then returns
 * the user with the larger balance. The new-expense flow has one payer.
 */
export function findTransactionPayer(balances: TransactionBalanceDto[] | undefined): SplitzUserReducedDto | null {
  const entries = balances ?? [];
  const top = entries.reduce<TransactionBalanceDto | null>(
    (best, entry) => (best === null || balanceOf(entry) > balanceOf(best) ? entry : best),
    null
  );
  if (top === null) return null;

  const paidForOthers = balanceOf(top) > 0;
  const paidOnlyForSelf = balanceOf(top) === 0 && entries.length === 1;
  return paidForOthers || paidOnlyForSelf ? top.user : null;
}

/** Returns the balance of one entry as a number. The DTO has an optional string, so a missing balance is zero. */
export function balanceOf(entry: TransactionBalanceDto): number {
  return Number(entry.balance ?? 0);
}
