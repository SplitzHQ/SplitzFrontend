import type { PendingItem } from "@/components/PendingItems/PendingItems.vue";

import type { CardData } from "./types";

export function convertPendingItemToCardData(item: PendingItem): CardData {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    id: item.id,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    type: item.type === "settle-up" ? "settle-up" : item.type === "draft" ? "draft" : "placeholder",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    userName: item.userName,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    avatarUrl: item.userPhoto ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    message: item.message ?? item.draftMessage ?? item.placeholderText,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    amount: item.amount,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    draftCount: item.draftCount,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    currentIndex: item.currentIndex,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    totalCount: item.totalCount,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    actionButtonText: item.actionButtonText
  };
}

export function convertPendingItemsToCardData(items: PendingItem[]): CardData[] {
  return items.map(convertPendingItemToCardData);
}
