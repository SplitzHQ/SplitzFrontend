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
 * Build the human-readable copy for one notification. Kept as a plain function so it can be tested
 * without mounting a component.
 */
export function describeNotification($t: Translate, n: TypedNotification): NotificationText {
  const invoiceName = (name: string | null | undefined) => name ?? $t("notification-invoice-unnamed");
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
    case "InvoiceCreated": {
      return {
        body: $t("notification-invoice-created-body", {
          creator: userName(n.data.creatorName),
          invoice: invoiceName(n.data.invoiceName),
        }),
        icon: PhWallet,
        title: $t("notification-invoice-created-title", { group: n.data.groupName ?? "" }),
        tone: "neutral",
      };
    }
    case "RelatedInvoiceCreated": {
      return {
        body: $t("notification-related-invoice-created-body", {
          creator: userName(n.data.creatorName),
          group: n.data.groupName ?? "",
          invoice: invoiceName(n.data.invoiceName),
        }),
        icon: PhWallet,
        title: $t("notification-related-invoice-created-title"),
        tone: "brand",
      };
    }
    case "SettlementRecorded":
    case "RelatedSettlementRecorded": {
      const related = n.type === "RelatedSettlementRecorded";
      const args = {
        amount: formatCurrency(n.data.amount, n.data.currency),
        from: userName(n.data.fromUserName),
        group: n.data.groupName ?? "",
        invoice: invoiceName(n.data.invoiceName),
        recorder: userName(n.data.recorderName),
        to: userName(n.data.toUserName),
      };
      return {
        body: related
          ? $t("notification-related-settlement-recorded-body", args)
          : $t("notification-settlement-recorded-body", args),
        icon: PhArrowsLeftRight,
        title: related
          ? $t("notification-related-settlement-recorded-title")
          : $t("notification-settlement-recorded-title", args),
        tone: related ? "brand" : "neutral",
      };
    }
    case "InvoiceSettled":
    case "RelatedInvoiceSettled": {
      const related = n.type === "RelatedInvoiceSettled";
      const args = { group: n.data.groupName ?? "", invoice: invoiceName(n.data.invoiceName) };
      return {
        body: related
          ? $t("notification-related-invoice-settled-body", args)
          : $t("notification-invoice-settled-body", args),
        icon: PhCheckCircle,
        title: related
          ? $t("notification-related-invoice-settled-title")
          : $t("notification-invoice-settled-title", args),
        tone: "success",
      };
    }
  }
}
