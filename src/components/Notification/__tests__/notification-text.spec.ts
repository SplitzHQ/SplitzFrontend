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

  it("uses settle-up wording without a round name", () => {
    const text = describeNotification(
      $t,
      base("RelatedInvoiceSettled", { groupId: "g", groupName: "Trip", invoiceId: "i", invoiceName: "Old name" })
    );

    expect(text.title).toBe("notification-related-settle-up-done-title");
    expect(text.body).toBe('notification-related-settle-up-done-body {"group":"Trip"}');
    expect(text.tone).toBe("success");
  });

  it("names the creator of a new settle-up", () => {
    const text = describeNotification(
      $t,
      base("InvoiceCreated", {
        creatorName: "Bob",
        creatorUserId: "u2",
        groupId: "g",
        groupName: "Trip",
        invoiceId: "i",
      })
    );

    expect(text.title).toContain("notification-settle-up-created-title");
    expect(text.body).toContain("notification-settle-up-created-body");
    expect(text.body).toContain('"creator":"Bob"');
    expect(text.body).not.toContain("invoice");
    expect(text.tone).toBe("neutral");
  });

  const payment = {
    amount: 5,
    currency: "USD",
    fromUserId: "a",
    fromUserName: "Ann",
    groupId: "g",
    groupName: "Trip",
    invoiceId: "i",
    recorderName: "Bob",
    recorderUserId: "u2",
    toUserId: "b",
    toUserName: "Cat",
  };

  it("asks the receiver to confirm a payment that is not confirmed", () => {
    const text = describeNotification($t, base("RelatedSettlementRecorded", { ...payment, isConfirmed: false }));

    expect(text.title).toContain("notification-related-settlement-recorded-title");
    expect(text.body).toContain("notification-related-settlement-recorded-body");
    expect(text.body).toContain('"from":"Ann"');
    expect(text.body).toContain('"amount":"$5.00"');
    expect(text.tone).toBe("brand");
  });

  it("tells the payer that the receiver confirmed the payment", () => {
    const text = describeNotification($t, base("RelatedSettlementRecorded", { ...payment, isConfirmed: true }));

    expect(text.title).toContain("notification-related-settlement-confirmed-title");
    expect(text.body).toContain("notification-related-settlement-confirmed-body");
    expect(text.body).toContain('"to":"Cat"');
    expect(text.tone).toBe("success");
  });

  it("treats an old payment without isConfirmed as confirmed", () => {
    const text = describeNotification($t, base("RelatedSettlementRecorded", payment));

    expect(text.body).toContain("notification-related-settlement-confirmed-body");
  });

  it("keeps plain group activity in the neutral tone", () => {
    const text = describeNotification(
      $t,
      base("SettlementRecorded", { ...payment, groupId: null, isConfirmed: false, toUserName: null })
    );

    expect(text.tone).toBe("neutral");
    expect(text.body).toContain("notification-settlement-recorded-body");
    expect(text.body).toContain('"to":"notification-someone"');
    expect(text.title).toContain('"group":"Trip"');
  });

  it("uses the confirmed wording for a confirmed payment between other members", () => {
    const text = describeNotification($t, base("SettlementRecorded", { ...payment, isConfirmed: true }));

    expect(text.title).toContain("notification-settlement-confirmed-title");
    expect(text.body).toContain("notification-settlement-confirmed-body");
    expect(text.tone).toBe("neutral");
  });
});
