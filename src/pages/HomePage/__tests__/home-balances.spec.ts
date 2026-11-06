import { describe, expect, it } from "vitest";

import {
  leadTotal,
  mostUsedCurrency,
  settledState,
  sortGroups,
  type HomeBalance,
  type HomeGroupBalances,
} from "../home-balances";

/** Makes a group for the sort rules. A larger `hoursAgo` means an older last activity. */
function group(name: string, hoursAgo: number, myBalances: HomeBalance[] = []): HomeGroupBalances {
  return {
    lastActivityTime: new Date(Date.UTC(2026, 0, 1) - hoursAgo * 3_600_000),
    myBalances,
    name,
    settled: myBalances.some(({ amount }) => amount !== 0) ? null : "you",
  };
}

/** Returns the names of the groups, in order. */
const names = (list: HomeGroupBalances[]) => list.map(({ name }) => name);
const usd = (amount: number) => ({ amount, currency: "USD" });
const eur = (amount: number) => ({ amount, currency: "EUR" });

describe("settledState", () => {
  it("says No expenses for a group with no expenses, also when old rows have a zero balance", () => {
    expect(settledState(0, [usd(0)], [{ balance: "0" }])).toBe("none");
  });

  it("returns null when the user has a balance", () => {
    expect(settledState(3, [usd(5)], [{ balance: "5" }, { balance: "-5" }])).toBeNull();
  });

  it("compares the balances as numbers, so a 0.00 balance counts as settled", () => {
    expect(settledState(3, [usd(0)], [{ balance: "0.00" }, { balance: "-0" }])).toBe("all");
  });

  it("says You're settled up when only other members have a balance", () => {
    expect(settledState(3, [usd(0)], [{ balance: "0" }, { balance: "12.5" }])).toBe("you");
  });
});

describe("mostUsedCurrency", () => {
  it("counts each group once for each currency and skips zero balances", () => {
    const groups = [group("A", 1, [eur(1), eur(2)]), group("B", 2, [usd(1)]), group("C", 3, [usd(4), eur(0)])];

    expect(mostUsedCurrency(groups)).toBe("USD");
  });

  it("gives a tie to the currency of the first group", () => {
    expect(mostUsedCurrency([group("A", 1, [eur(1)]), group("B", 2, [usd(1)])])).toBe("EUR");
  });
});

describe("leadTotal", () => {
  it("shows the total in the most used currency", () => {
    expect(leadTotal([usd(-900), eur(20)], "EUR")).toEqual(eur(20));
  });

  it("shows the largest number when no total has that currency", () => {
    expect(leadTotal([eur(20), usd(-900)], "JPY")).toEqual(usd(-900));
  });
});

describe("sortGroups", () => {
  const groups = [
    group("bali", 30, [usd(10), eur(500)]),
    group("Lisbon", 5, [eur(64)]),
    group("Camping", 10),
    group("Roommates", 1, [usd(-42)]),
    group("Office", 20, [usd(9)]),
  ];

  it("puts the most recent activity first", () => {
    expect(names(sortGroups(groups, "recent"))).toEqual(["Roommates", "Lisbon", "Camping", "Office", "bali"]);
  });

  it("puts the unsettled groups first and keeps the recent order in each part", () => {
    expect(names(sortGroups(groups, "unsettled"))).toEqual(["Roommates", "Lisbon", "Office", "bali", "Camping"]);
  });

  it("compares the most used currency, then the groups without it, then the groups with no balance", () => {
    // USD is the most used currency. Lisbon has only EUR, so it comes after the USD groups. Camping has no balance.
    expect(names(sortGroups(groups, "amount"))).toEqual(["Roommates", "bali", "Office", "Lisbon", "Camping"]);
  });

  it("sorts by name with no difference between capital and small letters", () => {
    expect(names(sortGroups(groups, "name"))).toEqual(["bali", "Camping", "Lisbon", "Office", "Roommates"]);
  });

  it("does not change the list that it gets", () => {
    const copy = [...groups];
    sortGroups(groups, "name");
    expect(groups).toEqual(copy);
  });
});
