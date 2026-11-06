/**
 * The balance rules of the home page: the settled text of a group row, the total that the total balance row shows, and
 * the sort of the group list. The prototype `2026-11-05-home-balance-structure` decided these rules.
 *
 * The app has no exchange rates. So no rule adds or compares amounts in two currencies. When a rule must compare
 * groups with different currencies, it uses the currency that the most groups use.
 */

/** One balance of the user in one currency. A positive amount means that other people owe the user. */
export interface HomeBalance {
  amount: number;
  currency: string;
}

/**
 * The text of a group row in which the user has no balance:
 * - `none`: the group has no expenses.
 * - `all`: no member of the group has a balance.
 * - `you`: the user has no balance, but other members have one.
 *
 * The value is null when the user has a balance, and the row shows the amounts.
 */
export type SettledState = "none" | "all" | "you" | null;

/** The fields of a group that the rules read. */
export interface HomeGroupBalances {
  name: string;
  lastActivityTime: Date;
  /** The balances of the user in this group. A zero amount can be in the list. */
  myBalances: readonly HomeBalance[];
  settled: SettledState;
}

/** The sorts of the group list, in the order of the sort sheet. */
export const HOME_SORTS = ["recent", "unsettled", "amount", "name"] as const;
export type HomeSort = (typeof HOME_SORTS)[number];

/**
 * Returns the settled state of a group.
 *
 * @param transactionCount The number of expenses of the group.
 * @param myBalances The balances of the user in the group.
 * @param groupBalances The balances of all members. The backend sends each one as a decimal string.
 */
export function settledState(
  transactionCount: number,
  myBalances: readonly HomeBalance[],
  groupBalances: readonly { balance: string }[]
): SettledState {
  if (transactionCount === 0) return "none";
  if (myBalances.some(({ amount }) => amount !== 0)) return null;
  // The backend can send "0", "0.00" or "-0", so the check compares numbers and not strings.
  return groupBalances.every(({ balance }) => Number.parseFloat(balance) === 0) ? "all" : "you";
}

/**
 * Returns the currency that the most groups use, counting only the balances that are not zero. A tie goes to the
 * currency that comes first in the list, so pass the groups with the most recent group first.
 */
export function mostUsedCurrency(groups: readonly Pick<HomeGroupBalances, "myBalances">[]): string | undefined {
  const uses = new Map<string, number>();
  for (const { myBalances } of groups) {
    // A group counts once for each currency, also when it has two balance rows in that currency.
    const currencies = new Set(myBalances.filter(({ amount }) => amount !== 0).map(({ currency }) => currency));
    for (const currency of currencies) uses.set(currency, (uses.get(currency) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [currency, count] of uses) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Returns the total that the total balance row shows: the total in the most used currency, or the largest total when
 * no total has that currency. Two currencies cannot be compared without rates, so "largest" compares only the numbers.
 * That case is rare, because the most used currency nearly always has a total.
 */
export function leadTotal(totals: readonly HomeBalance[], common: string | undefined): HomeBalance | undefined {
  const match = totals.find(({ currency }) => currency === common);
  if (match) return match;
  return [...totals].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
}

/**
 * Returns the size of the balances of a group for the amount sort. A group with no balance gets -1, so it stays last.
 * A group with no balance in the common currency gets 0, so it comes after the groups that the sort can compare.
 */
function amountValue(balances: readonly HomeBalance[], common: string | undefined): number {
  const open = balances.filter(({ amount }) => amount !== 0);
  if (open.length === 0) return -1;
  const match = open.find(({ currency }) => currency === common);
  return match ? Math.abs(match.amount) : 0;
}

const nameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** Returns a sorted copy of the groups. The most recent activity breaks each tie. */
export function sortGroups<T extends HomeGroupBalances>(groups: readonly T[], sort: HomeSort): T[] {
  const byRecent = (a: T, b: T) => b.lastActivityTime.getTime() - a.lastActivityTime.getTime();
  const sorted = [...groups].sort(byRecent);
  if (sort === "recent") return sorted;
  if (sort === "name") return sorted.sort((a, b) => nameCollator.compare(a.name, b.name));
  if (sort === "unsettled") {
    const rank = (group: T) => (group.settled === null ? 0 : 1);
    return sorted.sort((a, b) => rank(a) - rank(b));
  }
  // `sorted` is in recent order, so the most recent group wins a tie of the most used currency.
  const common = mostUsedCurrency(sorted);
  return sorted.sort((a, b) => amountValue(b.myBalances, common) - amountValue(a.myBalances, common));
}
