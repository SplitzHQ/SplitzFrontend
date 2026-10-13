import { useQueryCache } from "@pinia/colada";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import config from "@/backend/config";
import {
  AccountApi,
  GroupApi,
  NotificationApi,
  type NotificationCategory,
  type NotificationDto,
  type NotificationSummaryDto,
} from "@/backend/openapi";
import reportError from "@/libs/report-error";
import { useUserStore } from "@/stores/user";
import { asTypedNotification, priorityRank, type TypedNotification } from "@/types/notification";

/** How often the client asks the server for new notifications while the tab is visible. */
export const NOTIFICATION_POLL_INTERVAL_MS = 300_000;

const emptySummary: NotificationSummaryDto = { pendingRequests: 0, unreadActivity: 0, unreadRequests: 0 };

function isSignedIn() {
  return !!localStorage.getItem("accessToken");
}

/**
 * Notifications for the signed-in user.
 *
 * Requests (friend requests, group invites) are surfaced on the avatar and need an accept / ignore decision.
 * Activity (transactions, invoices, settlements) is surfaced behind the bell and can be read or dismissed.
 * The store polls while the page is visible and refreshes when the tab regains focus.
 */
export const useNotificationStore = defineStore("notification", () => {
  const notificationApi = new NotificationApi(config);
  const accountApi = new AccountApi(config);
  const groupApi = new GroupApi(config);
  const queryCache = useQueryCache();
  const userStore = useUserStore();

  const notifications = ref<NotificationDto[]>([]);
  const summary = ref<NotificationSummaryDto>({ ...emptySummary });
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<unknown>(null);

  const typedNotifications = computed(() =>
    notifications.value
      .map((n) => asTypedNotification(n))
      .filter((n): n is TypedNotification => n !== null)
      .sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority] || +b.createTime - +a.createTime)
  );

  const requests = computed(() => typedNotifications.value.filter((n) => n.category === "Request"));
  const activity = computed(() => typedNotifications.value.filter((n) => n.category === "Activity"));

  const pendingRequestCount = computed(() => summary.value.pendingRequests);
  const unreadActivityCount = computed(() => summary.value.unreadActivity);
  const unreadTotal = computed(() => summary.value.unreadActivity + summary.value.unreadRequests);

  /** Load the list and the badge counts together so they never disagree. */
  async function fetch() {
    if (!isSignedIn()) return;
    loading.value = true;
    try {
      const [list, counts] = await Promise.all([
        notificationApi.getNotifications({}),
        notificationApi.getNotificationSummary(),
      ]);
      notifications.value = list;
      summary.value = counts;
      error.value = null;
      loaded.value = true;
    } catch (error_) {
      error.value = error_;
      reportError("notification.fetch", error_);
    } finally {
      loading.value = false;
    }
  }

  // --- polling ---

  let timer: ReturnType<typeof setInterval> | null = null;
  let listenersAttached = false;

  function onVisibilityChange() {
    if (document.visibilityState === "visible") {
      void fetch();
      startTimer();
    } else {
      stopTimer();
    }
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => void fetch(), NOTIFICATION_POLL_INTERVAL_MS);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  /** Begin polling. Idempotent; call from the app shell once the user is signed in. */
  function startPolling() {
    if (listenersAttached) return;
    listenersAttached = true;
    document.addEventListener("visibilitychange", onVisibilityChange);
    globalThis.addEventListener("focus", onVisibilityChange);
    void fetch();
    if (document.visibilityState === "visible") startTimer();
  }

  function stopPolling() {
    if (!listenersAttached) return;
    listenersAttached = false;
    document.removeEventListener("visibilitychange", onVisibilityChange);
    globalThis.removeEventListener("focus", onVisibilityChange);
    stopTimer();
  }

  /** Forget everything, for sign-out. */
  function reset() {
    stopPolling();
    notifications.value = [];
    summary.value = { ...emptySummary };
    loaded.value = false;
    error.value = null;
  }

  // --- local mutations keep the UI instant; the server is the source of truth on the next fetch ---

  function patchLocal(id: string, patch: Partial<NotificationDto>) {
    const target = notifications.value.find((n) => n.notificationId === id);
    if (!target) return;
    const wasUnread = !target.isRead;
    Object.assign(target, patch);
    if (wasUnread && (patch.isRead || patch.isDismissed)) {
      if (target.category === "Request") summary.value.unreadRequests = Math.max(0, summary.value.unreadRequests - 1);
      else summary.value.unreadActivity = Math.max(0, summary.value.unreadActivity - 1);
    }
    if (patch.isDismissed) {
      if (target.category === "Request") summary.value.pendingRequests = Math.max(0, summary.value.pendingRequests - 1);
      notifications.value = notifications.value.filter((n) => n.notificationId !== id);
    }
  }

  async function markRead(id: string) {
    const target = notifications.value.find((n) => n.notificationId === id);
    if (!target || target.isRead) return;
    patchLocal(id, { isRead: true });
    try {
      await notificationApi.markNotificationRead({ id });
    } catch (error_) {
      reportError("notification.markRead", error_);
    }
  }

  async function markAllRead(category?: NotificationCategory) {
    for (const n of notifications.value) {
      if (!category || n.category === category) n.isRead = true;
    }
    if (!category || category === "Activity") summary.value.unreadActivity = 0;
    if (!category || category === "Request") summary.value.unreadRequests = 0;
    try {
      await notificationApi.markAllNotificationsRead({ category });
    } catch (error_) {
      reportError("notification.markAllRead", error_);
    }
  }

  async function dismiss(id: string) {
    patchLocal(id, { isDismissed: true, isRead: true });
    try {
      await notificationApi.dismissNotification({ id });
    } catch (error_) {
      reportError("notification.dismiss", error_);
    }
  }

  async function dismissAllActivity() {
    notifications.value = notifications.value.filter((n) => n.category !== "Activity");
    summary.value.unreadActivity = 0;
    try {
      await notificationApi.dismissAllNotifications();
    } catch (error_) {
      reportError("notification.dismissAll", error_);
    }
  }

  // --- request actions ---

  /** Drop a request notification locally once the server has resolved the underlying request. */
  function resolveRequestLocal(id: string) {
    patchLocal(id, { isDismissed: true, isRead: true });
  }

  async function acceptFriendRequest(notification: TypedNotification & { type: "FriendRequest" }, remark?: string) {
    await accountApi.acceptFriendRequest({ body: remark ?? undefined, requestId: notification.data.requestId });
    resolveRequestLocal(notification.notificationId);
    await userStore.fetchUserInfo();
  }

  async function ignoreFriendRequest(notification: TypedNotification & { type: "FriendRequest" }) {
    await accountApi.ignoreFriendRequest({ requestId: notification.data.requestId });
    resolveRequestLocal(notification.notificationId);
  }

  async function acceptGroupInvite(notification: TypedNotification & { type: "GroupInvite" }) {
    const group = await groupApi.acceptGroupInvite({ inviteId: notification.data.inviteId });
    resolveRequestLocal(notification.notificationId);
    await queryCache.invalidateQueries({ key: ["getGroups"] });
    return group;
  }

  async function ignoreGroupInvite(notification: TypedNotification & { type: "GroupInvite" }) {
    await groupApi.ignoreGroupInvite({ inviteId: notification.data.inviteId });
    resolveRequestLocal(notification.notificationId);
  }

  return {
    acceptFriendRequest,
    acceptGroupInvite,
    activity,
    dismiss,
    dismissAllActivity,
    error,
    fetch,
    ignoreFriendRequest,
    ignoreGroupInvite,
    loaded,
    loading,
    markAllRead,
    markRead,
    notifications,
    pendingRequestCount,
    requests,
    reset,
    startPolling,
    stopPolling,
    summary,
    unreadActivityCount,
    unreadTotal,
  };
});
