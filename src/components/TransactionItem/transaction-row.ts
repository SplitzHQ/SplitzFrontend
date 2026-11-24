import type { SplitzUserReducedDto, TransactionBalanceDto } from "@/backend";

/**
 * Shared Tailwind classes for interactive list rows (links or buttons) wrapping `TransactionItemContent` or `HomePage`
 * group rows.
 * Negative horizontal margins (`-mx-2 px-2`) extend the hover and pressed background 8px past the aligned content on
 * both sides, so parent containers must leave 8px of horizontal clearance (see `transaction-item.usage.ts`).
 * Pressing scales the row down to 98% (`container` duration with `standard` easing on press-in, `sheet` duration and
 * easing on release, matching `SSegmentControl`) while keeping `hover-in` timing on background color. Scaling is
 * disabled when reduced motion is active. Callers supply `focus-visible:outline-offset-*` to fit their scroll container.
 */
export const TRANSACTION_ROW_CLASS = [
  "-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 touch-manipulation",
  "[transition:background-color_var(--motion-duration-hover-in)_var(--motion-easing-standard),scale_var(--motion-duration-sheet)_var(--motion-easing-sheet)]",
  "active:[transition:background-color_var(--motion-duration-hover-in)_var(--motion-easing-standard),scale_var(--motion-duration-container)_var(--motion-easing-standard)]",
  "hover:bg-comp-row-bg-hover active:bg-comp-row-bg-pressed active:scale-98",
  "motion-reduce:active:scale-100 [:root[data-reduce-motion]_&]:active:scale-100",
  "focus-visible:outline-2 focus-visible:outline-base-border-brand-solid",
].join(" ");

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
