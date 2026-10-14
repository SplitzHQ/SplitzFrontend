import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NotificationDto } from "@/backend/openapi";

import { NOTIFICATION_POLL_INTERVAL_MS, useNotificationStore } from "../notification";

const notificationApiMock = vi.hoisted(() => ({
  dismissAllNotifications: vi.fn(),
  dismissNotification: vi.fn(),
  getNotificationSummary: vi.fn(),
  getNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
}));

const accountApiMock = vi.hoisted(() => ({
  acceptFriendRequest: vi.fn(),
  ignoreFriendRequest: vi.fn(),
}));

const groupApiMock = vi.hoisted(() => ({
  acceptGroupInvite: vi.fn(),
  ignoreGroupInvite: vi.fn(),
}));

const queryCacheMock = vi.hoisted(() => ({
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
}));

const userStoreMock = vi.hoisted(() => ({
  fetchUserInfo: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/backend/openapi", () => ({
  AccountApi: vi.fn(function () {
    return accountApiMock;
  }),
  GroupApi: vi.fn(function () {
    return groupApiMock;
  }),
  NotificationApi: vi.fn(function () {
    return notificationApiMock;
  }),
}));

vi.mock("@/backend/config", () => ({ default: {} }));

vi.mock("@pinia/colada", () => ({
  useQueryCache: () => queryCacheMock,
}));

vi.mock("@/stores/user", () => ({
  useUserStore: () => userStoreMock,
}));

function makeNotification(overrides: Partial<NotificationDto> & Pick<NotificationDto, "type">): NotificationDto {
  return {
    category: "Activity",
    createTime: new Date("2026-10-08T10:00:00Z"),
    data: {},
    isDismissed: false,
    isRead: false,
    notificationId: crypto.randomUUID(),
    priority: "Normal",
    ...overrides,
  };
}

const friendRequest = makeNotification({
  category: "Request",
  data: { fromUserId: "u2", fromUserName: "Bob", requestId: "req-1" },
  notificationId: "n-request",
  priority: "High",
  type: "FriendRequest",
});

const groupInvite = makeNotification({
  category: "Request",
  data: { groupId: "g1", groupName: "Trip", inviteId: "inv-1", invitedByUserId: "u2", invitedByUserName: "Bob" },
  notificationId: "n-invite",
  priority: "High",
  type: "GroupInvite",
});

const lowActivity = makeNotification({
  createTime: new Date("2026-10-08T12:00:00Z"),
  data: {
    amount: 10,
    creatorName: "Bob",
    creatorUserId: "u2",
    currency: "USD",
    groupId: "g1",
    groupName: "Trip",
    transactionId: "t1",
    transactionName: "Taxi",
  },
  notificationId: "n-low",
  priority: "Low",
  type: "TransactionCreated",
});

const highActivity = makeNotification({
  createTime: new Date("2026-10-08T09:00:00Z"),
  data: {
    amount: 30,
    creatorName: "Bob",
    creatorUserId: "u2",
    currency: "USD",
    groupId: "g1",
    groupName: "Trip",
    transactionId: "t2",
    transactionName: "Pizza",
    userBalance: -15,
  },
  notificationId: "n-high",
  priority: "High",
  type: "RelatedTransactionCreated",
});

const unknownType = makeNotification({ notificationId: "n-unknown", type: "SomethingNew" });

describe("useNotificationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    localStorage.setItem("accessToken", "token");
    vi.clearAllMocks();
    notificationApiMock.getNotifications.mockResolvedValue([
      friendRequest,
      groupInvite,
      lowActivity,
      highActivity,
      unknownType,
    ]);
    notificationApiMock.getNotificationSummary.mockResolvedValue({
      pendingRequests: 2,
      unreadActivity: 2,
      unreadRequests: 2,
    });
    for (const fn of Object.values({ ...notificationApiMock, ...accountApiMock, ...groupApiMock })) {
      if (fn !== notificationApiMock.getNotifications && fn !== notificationApiMock.getNotificationSummary) {
        fn.mockResolvedValue(undefined);
      }
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("splits notifications by category and sorts by priority then time", async () => {
    const store = useNotificationStore();
    await store.fetch();

    expect(store.requests.map((n) => n.notificationId)).toEqual(["n-request", "n-invite"]);
    expect(store.activity.map((n) => n.notificationId)).toEqual(["n-high", "n-low"]);
    expect(store.pendingRequestCount).toBe(2);
    expect(store.unreadActivityCount).toBe(2);
    expect(store.unreadTotal).toBe(4);
  });

  it("drops notifications of unknown types instead of crashing", async () => {
    const store = useNotificationStore();
    await store.fetch();

    expect(store.notifications).toHaveLength(5);
    expect([...store.requests, ...store.activity].some((n) => n.notificationId === "n-unknown")).toBe(false);
  });

  it("does not call the API when signed out", async () => {
    localStorage.clear();
    const store = useNotificationStore();
    await store.fetch();

    expect(notificationApiMock.getNotifications).not.toHaveBeenCalled();
  });

  it("marks read optimistically and lowers the unread count once", async () => {
    const store = useNotificationStore();
    await store.fetch();

    await store.markRead("n-low");
    await store.markRead("n-low");

    expect(store.notifications.find((n) => n.notificationId === "n-low")?.isRead).toBe(true);
    expect(store.unreadActivityCount).toBe(1);
    expect(notificationApiMock.markNotificationRead).toHaveBeenCalledOnce();
    expect(notificationApiMock.markNotificationRead).toHaveBeenCalledWith({ id: "n-low" });
  });

  it("removes a dismissed notification locally", async () => {
    const store = useNotificationStore();
    await store.fetch();

    await store.dismiss("n-high");

    expect(store.activity.map((n) => n.notificationId)).toEqual(["n-low"]);
    expect(store.unreadActivityCount).toBe(1);
    expect(notificationApiMock.dismissNotification).toHaveBeenCalledWith({ id: "n-high" });
  });

  it("clears only activity with dismissAllActivity", async () => {
    const store = useNotificationStore();
    await store.fetch();

    await store.dismissAllActivity();

    expect(store.activity).toHaveLength(0);
    expect(store.requests).toHaveLength(2);
    expect(store.unreadActivityCount).toBe(0);
    expect(notificationApiMock.dismissAllNotifications).toHaveBeenCalledOnce();
  });

  it("accepts a friend request, drops it from the list and refreshes the user", async () => {
    const store = useNotificationStore();
    await store.fetch();
    const request = store.requests.find((n) => n.type === "FriendRequest")!;

    await store.acceptFriendRequest(request, "Bobby");

    expect(accountApiMock.acceptFriendRequest).toHaveBeenCalledWith({ body: "Bobby", requestId: "req-1" });
    expect(store.requests.map((n) => n.notificationId)).toEqual(["n-invite"]);
    expect(store.pendingRequestCount).toBe(1);
    expect(userStoreMock.fetchUserInfo).toHaveBeenCalledOnce();
  });

  it("accepts a group invite and invalidates the group list", async () => {
    groupApiMock.acceptGroupInvite.mockResolvedValue({ groupId: "g1", name: "Trip" });
    const store = useNotificationStore();
    await store.fetch();
    const invite = store.requests.find((n) => n.type === "GroupInvite")!;

    const group = await store.acceptGroupInvite(invite);

    expect(group.groupId).toBe("g1");
    expect(groupApiMock.acceptGroupInvite).toHaveBeenCalledWith({ inviteId: "inv-1" });
    expect(queryCacheMock.invalidateQueries).toHaveBeenCalledWith({ key: ["getGroups"] });
    expect(store.requests.map((n) => n.notificationId)).toEqual(["n-request"]);
  });

  it("keeps the request when the server rejects the ignore", async () => {
    accountApiMock.ignoreFriendRequest.mockRejectedValue(new Error("boom"));
    const store = useNotificationStore();
    await store.fetch();
    const request = store.requests.find((n) => n.type === "FriendRequest")!;

    await expect(store.ignoreFriendRequest(request)).rejects.toThrow("boom");
    expect(store.requests).toHaveLength(2);
  });

  it("polls on an interval while the page is visible and stops on reset", async () => {
    vi.useFakeTimers();
    const store = useNotificationStore();

    store.startPolling();
    store.startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(notificationApiMock.getNotifications).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(NOTIFICATION_POLL_INTERVAL_MS * 2);
    expect(notificationApiMock.getNotifications).toHaveBeenCalledTimes(3);

    store.reset();
    await vi.advanceTimersByTimeAsync(NOTIFICATION_POLL_INTERVAL_MS * 2);
    expect(notificationApiMock.getNotifications).toHaveBeenCalledTimes(3);
    expect(store.notifications).toHaveLength(0);
    expect(store.unreadTotal).toBe(0);
  });
});
