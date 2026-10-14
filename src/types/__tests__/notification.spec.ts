import { describe, expect, it } from "vitest";

import type { NotificationDto } from "@/backend/openapi";
import { asTypedNotification, getNotificationRoute } from "@/types/notification";

function raw(type: string, data: unknown): NotificationDto {
  return {
    category: "Activity",
    createTime: new Date(),
    data,
    isDismissed: false,
    isRead: false,
    notificationId: "n",
    priority: "Low",
    type,
  };
}

describe("asTypedNotification", () => {
  it("accepts known types with object payloads", () => {
    expect(asTypedNotification(raw("InvoiceCreated", { invoiceId: "i" }))).not.toBeNull();
  });

  it("rejects unknown types and missing payloads", () => {
    expect(asTypedNotification(raw("Mystery", {}))).toBeNull();
    expect(asTypedNotification(raw("InvoiceCreated", null))).toBeNull();
    expect(asTypedNotification(raw("InvoiceCreated", "text"))).toBeNull();
  });
});

describe("getNotificationRoute", () => {
  it("deep links transactions to the transaction detail page", () => {
    const n = asTypedNotification(raw("RelatedTransactionCreated", { groupId: "g1", transactionId: "t1" }))!;
    expect(getNotificationRoute(n)).toEqual({
      name: "transactionDetail",
      params: { groupId: "g1", transactionId: "t1" },
    });
  });

  it("deep links invoice events to the group page", () => {
    const n = asTypedNotification(raw("InvoiceSettled", { groupId: "g1", invoiceId: "i1" }))!;
    expect(getNotificationRoute(n)).toEqual({ name: "groupDetail", params: { groupId: "g1" } });
  });

  it("does not navigate for requests", () => {
    const n = asTypedNotification(raw("FriendRequest", { requestId: "r" }))!;
    expect(getNotificationRoute(n)).toBeNull();
  });
});
