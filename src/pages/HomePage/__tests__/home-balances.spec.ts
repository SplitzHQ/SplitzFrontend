import { describe, expect, it } from "vitest";

import {
  mostUsedCurrency,
  selectPrimaryTotal,
  settledState,
  sortGroups,
  type HomeBalance,
  type HomeGroupBalances,
} from "../home-balances";

/** Builds a test group fixture (`hoursAgo` offsets `lastActivityTime` into the past). */
function createGroupFixture(name: string, hoursAgo: number, myBalances: HomeBalance[] = []): HomeGroupBalances {
  return {
    lastActivityTime: new Date(Date.UTC(2026, 0, 1) - hoursAgo * 3_600_000),
    myBalances,
    name,
    settled: myBalances.some(({ amount }) => amount !== 0) ? null : "you",
  };
}

const groupNames = (list: HomeGroupBalances[]) => list.map(({ name }) => name);
const usd = (amount: number) => ({ amount, currency: "USD" });
const eur = (amount: number) => ({ amount, currency: "EUR" });

describe("settledState", () => {
  it("returns 'none' when a group has zero transactions, even if zero-valued balance rows exist", () => {
    expect(settledState(0, [usd(0)], [{ balance: "0" }])).toBe("none");
  });

  it("returns null when the current user has a non-zero balance", () => {
    expect(settledState(3, [usd(5)], [{ balance: "5" }, { balance: "-5" }])).toBeNull();
  });

  it("parses decimal strings numerically so '0.00' and '-0' count as settled", () => {
    expect(settledState(3, [usd(0)], [{ balance: "0.00" }, { balance: "-0" }])).toBe("all");
  });

  it("returns 'you' when only other members still have non-zero balances", () => {
    expect(settledState(3, [usd(0)], [{ balance: "0" }, { balance: "12.5" }])).toBe("you");
  });
});

describe("mostUsedCurrency", () => {
  it("counts each currency at most once per group and ignores zero balances", () => {
    const groups = [
      createGroupFixture("A", 1, [eur(1), eur(2)]),
      createGroupFixture("B", 2, [usd(1)]),
      createGroupFixture("C", 3, [usd(4), eur(0)]),
    ];

    expect(mostUsedCurrency(groups)).toBe("USD");
  });

  it("breaks frequency ties in favor of the first group's currency", () => {
    expect(mostUsedCurrency([createGroupFixture("A", 1, [eur(1)]), createGroupFixture("B", 2, [usd(1)])])).toBe("EUR");
  });
});

describe("selectPrimaryTotal", () => {
  it("selects the total matching the preferred currency", () => {
    expect(selectPrimaryTotal([usd(-900), eur(20)], "EUR")).toEqual(eur(20));
  });

  it("falls back to the largest numeric magnitude when the preferred currency is absent", () => {
    expect(selectPrimaryTotal([eur(20), usd(-900)], "JPY")).toEqual(usd(-900));
  });
});

describe("sortGroups", () => {
  const groups = [
    createGroupFixture("bali", 30, [usd(10), eur(500)]),
    createGroupFixture("Lisbon", 5, [eur(64)]),
    createGroupFixture("Camping", 10),
    createGroupFixture("Roommates", 1, [usd(-42)]),
    createGroupFixture("Office", 20, [usd(9)]),
  ];

  it("orders groups by most recent activity first", () => {
    expect(groupNames(sortGroups(groups, "recent"))).toEqual(["Roommates", "Lisbon", "Camping", "Office", "bali"]);
  });

  it("places unsettled groups ahead of settled ones while preserving recency within each bucket", () => {
    expect(groupNames(sortGroups(groups, "unsettled"))).toEqual(["Roommates", "Lisbon", "Office", "bali", "Camping"]);
  });

  it("orders by primary-currency balance magnitude, then non-primary open balances, then settled groups", () => {
    // USD is the most frequent currency; Lisbon only has EUR so it trails USD groups, and Camping is settled.
    expect(groupNames(sortGroups(groups, "amount"))).toEqual(["Roommates", "bali", "Office", "Lisbon", "Camping"]);
  });

  it("sorts alphabetically case-insensitively", () => {
    expect(groupNames(sortGroups(groups, "name"))).toEqual(["bali", "Camping", "Lisbon", "Office", "Roommates"]);
  });

  it("does not mutate the input array", () => {
    const snapshot = [...groups];
    sortGroups(groups, "name");
    expect(groups).toEqual(snapshot);
  });
});
