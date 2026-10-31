import { Big } from "big.js";

import type { InvoiceDebtDto, InvoiceSettlementDto } from "@/backend";

/** A debt in an invoice, with the part that is not paid yet. */
export interface DebtProgress {
  debt: InvoiceDebtDto;
  /** Total of the payments from the debtor to the creditor. */
  paid: Big;
  /** Amount the debtor must still pay. Never less than zero. */
  remaining: Big;
}

function pairKey(fromUserId: string, toUserId: string): string {
  return `${fromUserId}\u0000${toUserId}`;
}

/**
 * Match each debt with the payments between the same two people, in the same direction.
 * The backend uses the same rule to decide when an invoice is settled.
 */
export function getDebtProgress(debts: InvoiceDebtDto[], settlements: InvoiceSettlementDto[]): DebtProgress[] {
  const paidByPair = new Map<string, Big>();
  for (const settlement of settlements) {
    const key = pairKey(settlement.fromUser.id, settlement.toUser.id);
    paidByPair.set(key, (paidByPair.get(key) ?? new Big(0)).plus(settlement.amount));
  }

  return debts.map((debt) => {
    const paid = paidByPair.get(pairKey(debt.fromUser.id, debt.toUser.id)) ?? new Big(0);
    const remaining = new Big(debt.amount).minus(paid);
    return { debt, paid, remaining: remaining.lt(0) ? new Big(0) : remaining };
  });
}
