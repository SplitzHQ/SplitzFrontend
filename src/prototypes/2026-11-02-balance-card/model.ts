import type { GroupMemberTransferDto } from "@/backend";
import type { BalanceCardProps } from "@/pages/GroupDetailPage/BalanceCard.vue";

/** Sample group balances to try both variants with. A negative member amount means that member owes you. */
export type ScenarioId = "mixed" | "youOwe" | "settled";

const member = (userId: string, name: string, amount: string): GroupMemberTransferDto => ({
  amount,
  currency: "USD",
  name,
  userId,
});

export const SCENARIOS: Record<ScenarioId, { label: string; card: BalanceCardProps }> = {
  mixed: {
    card: {
      currency: "USD",
      memberBalances: [member("ana", "Ana", "-42.50"), member("ben", "Ben", "18.20"), member("chen", "Chen", "-12.00")],
      totalBalance: "36.30",
    },
    label: "Mixed",
  },
  settled: {
    card: { currency: "USD", memberBalances: [], totalBalance: "0" },
    label: "Settled",
  },
  youOwe: {
    card: {
      currency: "USD",
      memberBalances: [member("ana", "Ana", "25.00"), member("ben", "Ben", "60.75")],
      totalBalance: "-85.75",
    },
    label: "You owe",
  },
};

/** The scenario IDs in the order the switch shows them. */
export const SCENARIO_ORDER: ScenarioId[] = ["mixed", "youOwe", "settled"];
