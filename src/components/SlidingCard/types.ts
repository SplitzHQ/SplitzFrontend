export type CardType = "settle-up" | "draft" | "placeholder";

export interface CardData {
  id: string;
  type: CardType;
  userName?: string;
  avatarUrl?: string | null;
  message?: string;
  amount?: number | string;
  draftCount?: number;
  currentIndex: number;
  totalCount: number;
  actionButtonText?: string;
}
