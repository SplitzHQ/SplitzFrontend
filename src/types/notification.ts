import type { NotificationDto } from "@/backend";

/**
 * Notification type identifiers. Must match `NotificationTypes` on the backend.
 */
export const NotificationType = {
  FriendRequest: "FriendRequest",
  FriendRequestAccepted: "FriendRequestAccepted",
  GroupInvite: "GroupInvite",
  InvoiceCreated: "InvoiceCreated",
  InvoiceSettled: "InvoiceSettled",
  RelatedInvoiceCreated: "RelatedInvoiceCreated",
  RelatedInvoiceSettled: "RelatedInvoiceSettled",
  RelatedSettlementRecorded: "RelatedSettlementRecorded",
  RelatedTransactionCreated: "RelatedTransactionCreated",
  SettlementRecorded: "SettlementRecorded",
  TransactionCreated: "TransactionCreated",
} as const;

export type NotificationTypeName = (typeof NotificationType)[keyof typeof NotificationType];

// The server stores only user and group IDs. It looks up names and photos each time notifications are read,
// and a user name is the reader's nickname for that user when one is set. A name is null when the user or
// group no longer exists.

export interface FriendRequestData {
  requestId: string;
  fromUserId: string;
  fromUserName?: string | null;
  fromUserPhoto?: string | null;
  remark?: string | null;
}

export interface FriendRequestAcceptedData {
  friendUserId: string;
  friendUserName?: string | null;
  friendUserPhoto?: string | null;
}

export interface GroupInviteData {
  inviteId: string;
  groupId: string;
  groupName?: string | null;
  groupPhoto?: string | null;
  invitedByUserId: string;
  invitedByUserName?: string | null;
}

export interface TransactionCreatedData {
  transactionId: string;
  groupId: string;
  groupName?: string | null;
  creatorUserId: string;
  creatorName?: string | null;
  transactionName: string;
  amount: number | string;
  currency: string;
  /** Recipient's share. Negative means they owe, positive means they are owed. */
  userBalance?: number | string | null;
}

export interface InvoiceCreatedData {
  creatorUserId: string;
  creatorName?: string | null;
  invoiceName?: string | null;
  invoiceId: string;
  groupId: string;
  groupName?: string | null;
}

export interface SettlementRecordedData {
  recorderUserId: string;
  recorderName?: string | null;
  amount: number | string;
  currency: string;
  fromUserId: string;
  fromUserName?: string | null;
  toUserId: string;
  toUserName?: string | null;
  invoiceId: string;
  invoiceName?: string | null;
  groupId?: string | null;
  groupName?: string | null;
}

export interface InvoiceSettledData {
  invoiceId: string;
  invoiceName?: string | null;
  groupId: string;
  groupName?: string | null;
}

type Base = Omit<NotificationDto, "type" | "data">;

/** Narrowed notification shapes keyed by `type`. */
export type TypedNotification =
  | (Base & { type: "FriendRequest"; data: FriendRequestData })
  | (Base & { type: "FriendRequestAccepted"; data: FriendRequestAcceptedData })
  | (Base & { type: "GroupInvite"; data: GroupInviteData })
  | (Base & { type: "TransactionCreated" | "RelatedTransactionCreated"; data: TransactionCreatedData })
  | (Base & { type: "InvoiceCreated" | "RelatedInvoiceCreated"; data: InvoiceCreatedData })
  | (Base & { type: "SettlementRecorded" | "RelatedSettlementRecorded"; data: SettlementRecordedData })
  | (Base & { type: "InvoiceSettled" | "RelatedInvoiceSettled"; data: InvoiceSettledData });

/**
 * Narrow a raw notification to its typed shape, or `null` for unknown types.
 * The server keeps `data` loosely typed, so this is the single place that trusts it.
 */
export function asTypedNotification(notification: NotificationDto): TypedNotification | null {
  const known = Object.values(NotificationType) as string[];
  if (
    !known.includes(notification.type) ||
    notification.data === null ||
    notification.data === undefined ||
    typeof notification.data !== "object"
  ) {
    return null;
  }
  return notification as unknown as TypedNotification;
}

/**
 * Route a notification should open when tapped. Requests do not navigate; they are handled inline.
 */
export function getNotificationRoute(
  notification: TypedNotification
): { name: string; params?: Record<string, string> } | null {
  switch (notification.type) {
    case "TransactionCreated":
    case "RelatedTransactionCreated": {
      return {
        name: "transactionDetail",
        params: { groupId: notification.data.groupId, transactionId: notification.data.transactionId },
      };
    }
    case "InvoiceCreated":
    case "RelatedInvoiceCreated":
    case "InvoiceSettled":
    case "RelatedInvoiceSettled": {
      return { name: "groupDetail", params: { groupId: notification.data.groupId } };
    }
    case "SettlementRecorded":
    case "RelatedSettlementRecorded": {
      return notification.data.groupId ? { name: "groupDetail", params: { groupId: notification.data.groupId } } : null;
    }
    case "FriendRequestAccepted": {
      return { name: "profile" };
    }
    default: {
      return null;
    }
  }
}

/** Order used when sorting by priority: higher first. */
export const priorityRank: Record<NotificationDto["priority"], number> = {
  High: 2,
  Low: 0,
  Normal: 1,
};

/**
 * Settings groups shown on the preferences page. Each entry lists the configurable types it controls.
 */
export const notificationSettingGroups = [
  { key: "friends", types: [NotificationType.FriendRequestAccepted] },
  { key: "transactions", types: [NotificationType.RelatedTransactionCreated, NotificationType.TransactionCreated] },
  { key: "invoices", types: [NotificationType.RelatedInvoiceCreated, NotificationType.InvoiceCreated] },
  { key: "settlements", types: [NotificationType.RelatedSettlementRecorded, NotificationType.SettlementRecorded] },
  { key: "invoice-settled", types: [NotificationType.RelatedInvoiceSettled, NotificationType.InvoiceSettled] },
] as const;

/** Types that only make sense globally and are hidden from per-group settings. */
export const globalOnlyNotificationTypes: readonly string[] = [NotificationType.FriendRequestAccepted];
