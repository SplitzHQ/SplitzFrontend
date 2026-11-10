import {
  PhArrowsLeftRight,
  PhCheckCircle,
  PhHandshake,
  PhReceipt,
  PhUserPlus,
  PhUsersThree,
  PhWallet,
} from "@phosphor-icons/vue";
import type { Component } from "vue";

import { formatCurrency } from "@/libs/format-currency";
import type { TypedNotification } from "@/types/notification";

type Translate = (key: string, args?: Record<string, string | number>) => string;

export interface NotificationText {
  title: string;
  body: string;
  icon: Component;
  /** Related items use the brand tone, settled items green, the rest stay neutral. */
  tone: "brand" | "neutral" | "success";
  /** Image to show instead of the icon tile, when the payload carries one. */
  image?: { src: string | null | undefined; alt: string };
}

/**
 * Locale keys for a payment notification. `related` goes to the payer or the receiver, `group` goes to the
 * other members. `recorded` means the payer marked the payment as paid and the receiver must confirm it.
 * `confirmed` means the receiver confirmed it.
 */
const settlementKeys = {
  group: {
    confirmed: { body: "notification-settlement-confirmed-body", title: "notification-settlement-confirmed-title" },
    recorded: { body: "notification-settlement-recorded-body", title: "notification-settlement-recorded-title" },
  },
  related: {
    confirmed: {
      body: "notification-related-settlement-confirmed-body",
      title: "notification-related-settlement-confirmed-title",
    },
    recorded: {
      body: "notification-related-settlement-recorded-body",
      title: "notification-related-settlement-recorded-title",
    },
  },
} as const;

/**
 * Build the human-readable copy for one notification. Kept as a plain function so it can be tested
 * without mounting a component.
 *
 * The backend calls a settle-up round an invoice. The copy says settle-up and never shows a round name,
 * because a round has no name.
 */
export function describeNotification($t: Translate, n: TypedNotification): NotificationText {
  const userName = (name: string | null | undefined) => name ?? $t("notification-someone");

  switch (n.type) {
    case "FriendRequest": {
      return {
        body: $t("notification-friend-request-body", { name: userName(n.data.fromUserName) }),
        icon: PhUserPlus,
        image: { alt: userName(n.data.fromUserName), src: n.data.fromUserPhoto },
        title: $t("notification-friend-request-title"),
        tone: "brand",
      };
    }
    case "GroupInvite": {
      return {
        body: $t("notification-group-invite-body", {
          group: n.data.groupName ?? "",
          inviter: userName(n.data.invitedByUserName),
        }),
        icon: PhUsersThree,
        image: { alt: n.data.groupName ?? "", src: n.data.groupPhoto },
        title: $t("notification-group-invite-title"),
        tone: "brand",
      };
    }
    case "FriendRequestAccepted": {
      return {
        body: $t("notification-friend-accepted-body", { name: userName(n.data.friendUserName) }),
        icon: PhHandshake,
        image: { alt: userName(n.data.friendUserName), src: n.data.friendUserPhoto },
        title: $t("notification-friend-accepted-title"),
        tone: "success",
      };
    }
    case "TransactionCreated": {
      return {
        body: $t("notification-transaction-created-body", {
          amount: formatCurrency(n.data.amount, n.data.currency),
          creator: userName(n.data.creatorName),
          name: n.data.transactionName,
        }),
        icon: PhReceipt,
        title: $t("notification-transaction-created-title", { group: n.data.groupName ?? "" }),
        tone: "neutral",
      };
    }
    case "RelatedTransactionCreated": {
      const share = Number(n.data.userBalance ?? 0);
      const args = {
        amount: formatCurrency(Math.abs(share), n.data.currency),
        creator: userName(n.data.creatorName),
        name: n.data.transactionName,
      };
      return {
        body:
          share < 0
            ? $t("notification-related-transaction-owe-body", args)
            : $t("notification-related-transaction-lent-body", args),
        icon: PhReceipt,
        title: $t("notification-related-transaction-created-title"),
        tone: "brand",
      };
    }
    case "InvoiceCreated":
    case "RelatedInvoiceCreated": {
      const related = n.type === "RelatedInvoiceCreated";
      const args = { creator: userName(n.data.creatorName), group: n.data.groupName ?? "" };
      return {
        body: related
          ? $t("notification-related-settle-up-created-body", args)
          : $t("notification-settle-up-created-body", args),
        icon: PhWallet,
        title: related
          ? $t("notification-related-settle-up-created-title")
          : $t("notification-settle-up-created-title", args),
        tone: related ? "brand" : "neutral",
      };
    }
    case "SettlementRecorded":
    case "RelatedSettlementRecorded": {
      const related = n.type === "RelatedSettlementRecorded";
      // An old payload has no `isConfirmed`. Old payments were recorded in one step, so they count as confirmed.
      const confirmed = n.data.isConfirmed ?? true;
      const args = {
        amount: formatCurrency(n.data.amount, n.data.currency),
        from: userName(n.data.fromUserName),
        group: n.data.groupName ?? "",
        to: userName(n.data.toUserName),
      };
      const keys = settlementKeys[related ? "related" : "group"][confirmed ? "confirmed" : "recorded"];
      let tone: NotificationText["tone"] = "neutral";
      if (related) {
        tone = confirmed ? "success" : "brand";
      }
      return {
        body: $t(keys.body, args),
        icon: confirmed ? PhCheckCircle : PhArrowsLeftRight,
        title: $t(keys.title, args),
        tone,
      };
    }
    case "InvoiceSettled":
    case "RelatedInvoiceSettled": {
      const related = n.type === "RelatedInvoiceSettled";
      const args = { group: n.data.groupName ?? "" };
      return {
        body: related
          ? $t("notification-related-settle-up-done-body", args)
          : $t("notification-settle-up-done-body", args),
        icon: PhCheckCircle,
        title: related
          ? $t("notification-related-settle-up-done-title")
          : $t("notification-settle-up-done-title", args),
        tone: "success",
      };
    }
  }
}
