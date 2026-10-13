import { describe, expect, it } from "vitest";

import { describeNotification } from "@/components/Notification/notification-text";
import type { TypedNotification } from "@/types/notification";

const $t = (key: string, args?: Record<string, string | number>) => (args ? `${key} ${JSON.stringify(args)}` : key);

function base(type: TypedNotification["type"], data: object) {
  return {
    category: type === "FriendRequest" || type === "GroupInvite" ? "Request" : "Activity",
    createTime: new Date("2026-10-08T10:00:00Z"),
    data,
    isDismissed: false,
    isRead: false,
    notificationId: "n1",
    priority: "Normal",
    type,
  } as unknown as TypedNotification;
}

describe("describeNotification", () => {
  it("shows the sender's avatar and name for a friend request", () => {
    const text = describeNotification(
      $t,
      base("FriendRequest", { fromUserId: "u2", fromUserName: "Bob", fromUserPhoto: "/bob.png", requestId: "r" })
    );

    expect(text.title).toBe("notification-friend-request-title");
    expect(text.body).toContain('"name":"Bob"');
    expect(text.image).toEqual({ alt: "Bob", src: "/bob.png" });
    expect(text.tone).toBe("brand");
  });

  it("uses the owe wording when the recipient's share is negative", () => {
    const text = describeNotification(
      $t,
      base("RelatedTransactionCreated", {
        amount: 30,
        creatorName: "Bob",
        creatorUserId: "u2",
        currency: "USD",
        groupId: "g",
        groupName: "Trip",
        transactionId: "t",
        transactionName: "Pizza",
        userBalance: -15,
      })
    );

    expect(text.body).toContain("notification-related-transaction-owe-body");
    expect(text.body).toContain('"amount":"$15.00"');
  });

  it("uses the lent wording when the recipient's share is positive", () => {
    const text = describeNotification(
      $t,
      base("RelatedTransactionCreated", {
        amount: 30,
        creatorName: "Bob",
        creatorUserId: "u2",
        currency: "USD",
        groupId: "g",
        groupName: "Trip",
        transactionId: "t",
        transactionName: "Pizza",
        userBalance: "15",
      })
    );

    expect(text.body).toContain("notification-related-transaction-lent-body");
  });

  it("falls back to a placeholder for unnamed invoices", () => {
    const text = describeNotification(
      $t,
      base("RelatedInvoiceSettled", { groupId: "g", groupName: "Trip", invoiceId: "i", invoiceName: null })
    );

    expect(text.body).toContain('"invoice":"notification-invoice-unnamed"');
    expect(text.tone).toBe("success");
  });

  it("keeps plain group activity in the neutral tone", () => {
    const text = describeNotification(
      $t,
      base("SettlementRecorded", {
        amount: 5,
        currency: "USD",
        fromUserId: "a",
        fromUserName: "Ann",
        groupName: "Trip",
        invoiceId: "i",
        recorderName: "Bob",
        recorderUserId: "u2",
        toUserId: "b",
        toUserName: null,
      })
    );

    expect(text.tone).toBe("neutral");
    expect(text.body).toContain('"to":"notification-someone"');
    expect(text.title).toContain('"group":"Trip"');
  });
});
