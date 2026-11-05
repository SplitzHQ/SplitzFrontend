import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive } from "vue";

import NotificationBadge from "@/components/Notification/NotificationBadge.vue";
import NotificationItem from "@/components/Notification/NotificationItem.vue";
import NotificationPanel from "@/components/Notification/NotificationPanel.vue";
import NotificationSheet from "@/components/Notification/NotificationSheet.vue";
import RequestCard, { type RequestNotification } from "@/components/Notification/RequestCard.vue";
import type { TypedNotification } from "@/types/notification";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  store: {} as Record<string, unknown>,
}));

vi.mock("@/libs/asset-url", () => ({ resolveAssetUrl: (url: string | null | undefined) => url }));
vi.mock("@/stores/notification", () => ({ useNotificationStore: () => mocks.store }));
vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (id: string) => id }) }));
vi.mock("vue-router", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("vue-sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const global = { mocks: { $t: (id: string, args?: Record<string, string>) => (args ? `${id} ${args.remark}` : id) } };

/** An unread activity notification, with an icon and no picture. */
function activity(overrides: Partial<TypedNotification> = {}) {
  return {
    category: "Activity",
    createTime: new Date("2026-11-01T10:00:00Z"),
    data: {
      amount: 10,
      creatorName: "Bo",
      currency: "USD",
      groupId: "g1",
      groupName: "Trip",
      transactionId: "t1",
      transactionName: "Lunch",
    },
    isDismissed: false,
    isRead: false,
    notificationId: "n1",
    priority: "Normal",
    type: "TransactionCreated",
    ...overrides,
  } as unknown as TypedNotification;
}

/** A pending friend request. */
function friendRequest(remark: string | null = null) {
  // oxlint-disable-next-line typescript/no-unsafe-return -- the type-aware linter cannot read a type that a .vue file exports.
  return {
    category: "Request",
    createTime: new Date("2026-11-01T10:00:00Z"),
    data: { fromUserId: "u2", fromUserName: "Bo", fromUserPhoto: null, remark, requestId: "r1" },
    isDismissed: false,
    isRead: false,
    notificationId: "n2",
    priority: "Normal",
    type: "FriendRequest",
  } as unknown as RequestNotification;
}

beforeEach(() => {
  mocks.push.mockReset();
  mocks.store = reactive({
    activity: [],
    dismiss: vi.fn(),
    dismissAllActivity: vi.fn(),
    error: null,
    fetch: vi.fn(),
    loaded: true,
    loading: false,
    markAllRead: vi.fn(),
    markRead: vi.fn(),
    unreadActivityCount: 0,
  });
});

describe("NotificationBadge", () => {
  it.each([
    [1, "1"],
    [99, "99"],
    [100, "99+"],
  ])("shows %i as %s and hides it from a screen reader", (count, text) => {
    const badge = mount(NotificationBadge, { props: { count } }).get("span");

    expect(badge.text()).toBe(text);
    expect(badge.attributes("aria-hidden")).toBe("true");
    expect(badge.attributes("role")).toBeUndefined();
  });

  it("does not render at zero", () => {
    expect(
      mount(NotificationBadge, { props: { count: 0 } })
        .find("span")
        .exists()
    ).toBe(false);
  });
});

describe("NotificationItem", () => {
  it("gives an unread row text for a screen reader", () => {
    const wrapper = mount(NotificationItem, { global, props: { notification: activity() } });

    expect(wrapper.get(".sr-only").text()).toBe("notification-unread");
  });

  it("has no unread text on a read row", () => {
    const wrapper = mount(NotificationItem, { global, props: { notification: activity({ isRead: true }) } });

    expect(wrapper.find(".sr-only").exists()).toBe(false);
  });

  it("puts the unread dot next to the icon, and not in the text", () => {
    const unread = mount(NotificationItem, { global, props: { notification: activity() } });
    const read = mount(NotificationItem, { global, props: { notification: activity({ isRead: true }) } });

    expect(unread.get(".size-2").element.parentElement?.querySelector(".size-10")).not.toBeNull();
    expect(read.find(".size-2").exists()).toBe(false);
  });

  it("emits open and dismiss from separate buttons", async () => {
    const notification = activity();
    const wrapper = mount(NotificationItem, { global, props: { notification } });
    const [row, dismiss] = wrapper.findAll("button");

    await row.trigger("click");
    await dismiss.trigger("click");

    expect(dismiss.attributes("aria-label")).toBe("notification-dismiss");
    expect(wrapper.emitted("open")).toEqual([[notification]]);
    expect(wrapper.emitted("dismiss")).toEqual([[notification]]);
  });

  it("hides the picture from a screen reader, because the text has the name", () => {
    const notification = activity({
      data: { friendUserId: "u2", friendUserName: "Bo", friendUserPhoto: null },
      type: "FriendRequestAccepted",
    });
    const wrapper = mount(NotificationItem, { global, props: { notification } });

    expect(wrapper.get(".img-container").attributes("aria-hidden")).toBe("true");
  });
});

/** Mounts the panel with the given store state. */
function mountPanel(state: Record<string, unknown>) {
  Object.assign(mocks.store, state);
  return mount(NotificationPanel, { global, props: {} });
}

describe("NotificationPanel", () => {
  it("shows the empty message only after the first request", () => {
    const loading = mountPanel({ loaded: false, loading: true });
    expect(loading.text()).not.toContain("notification-empty-title");
    expect(loading.get('[role="status"]').attributes("aria-label")).toBe("notification-loading");

    const empty = mountPanel({ loaded: true, loading: false });
    expect(empty.text()).toContain("notification-empty-title");
    expect(empty.find('[role="status"]').exists()).toBe(false);
  });

  it("shows the empty message when no request ran, so the panel does not stay in a loading state", () => {
    const wrapper = mountPanel({ loaded: false, loading: false });

    expect(wrapper.text()).toContain("notification-empty-title");
  });

  it("announces an error and retries", async () => {
    const wrapper = mountPanel({ error: new Error("offline"), loaded: false });

    expect(wrapper.get('[role="alert"]').text()).toBe("notification-error");
    const buttons = wrapper.findAll("button");
    await buttons[buttons.length - 1].trigger("click");
    expect(mocks.store.fetch).toHaveBeenCalledOnce();
  });

  it("keeps a stale list on screen when a later request fails", () => {
    const wrapper = mountPanel({ activity: [activity()], error: new Error("offline") });

    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.findAll("li")).toHaveLength(1);
  });

  it("marks the row as read, opens its page and asks the container to close", async () => {
    const wrapper = mountPanel({ activity: [activity()] });

    await wrapper.get("li button").trigger("click");
    await flushPromises();

    expect(mocks.store.markRead).toHaveBeenCalledWith("n1");
    expect(mocks.push).toHaveBeenCalledWith({
      name: "transactionDetail",
      params: { groupId: "g1", transactionId: "t1" },
    });
    expect(wrapper.emitted("navigate")).toHaveLength(1);
  });
});

/** A sheet with no portal, so a test can read both slots. */
const SHEET_STUB = {
  props: ["modelValue"],
  template:
    '<div v-if="modelValue" role="dialog"><slot /><footer v-if="$slots.actions"><slot name="actions" /></footer></div>',
};

/** Mounts the panel for a sheet with the given store state. */
function mountPanelInSheet(state: Record<string, unknown>) {
  Object.assign(mocks.store, state);
  return mount(NotificationPanel, { global: { ...global, stubs: { Sheet: SHEET_STUB } }, props: { inSheet: true } });
}

describe("NotificationPanel in a popover", () => {
  it("keeps the two actions and the settings in the header", () => {
    const wrapper = mountPanel({ activity: [activity()], unreadActivityCount: 1 });

    expect(wrapper.text()).toContain("notification-mark-all-read");
    expect(wrapper.text()).toContain("notification-clear-all");
    expect(wrapper.find('[aria-label="notification-settings"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="notification-more"]').exists()).toBe(false);
  });
});

describe("NotificationPanel in a sheet", () => {
  it("has only the More button in the header, and the second sheet stays closed", () => {
    const wrapper = mountPanelInSheet({ activity: [activity()], unreadActivityCount: 1 });

    expect(wrapper.get('[aria-label="notification-more"]').attributes("aria-expanded")).toBe("false");
    expect(wrapper.text()).not.toContain("notification-mark-all-read");
    expect(wrapper.text()).not.toContain("notification-clear-all");
  });

  it("shows the settings button in place of More when the list has no rows", async () => {
    const wrapper = mountPanelInSheet({ loaded: true });

    expect(wrapper.find('[aria-label="notification-more"]').exists()).toBe(false);
    await wrapper.get('[aria-label="notification-settings"]').trigger("click");

    expect(mocks.push).toHaveBeenCalledWith({ name: "notificationSettings" });
    expect(wrapper.emitted("navigate")).toHaveLength(1);
  });

  it("lists all the actions in the second sheet", async () => {
    const wrapper = mountPanelInSheet({ activity: [activity()], unreadActivityCount: 1 });

    await wrapper.get('[aria-label="notification-more"]').trigger("click");

    expect(wrapper.findAll('[role="dialog"] button').map((row) => row.text())).toEqual([
      "notification-mark-all-read",
      "notification-clear-all",
      "notification-settings",
    ]);
  });

  it("leaves out Mark all read when all rows are read", async () => {
    const wrapper = mountPanelInSheet({ activity: [activity({ isRead: true })], unreadActivityCount: 0 });

    await wrapper.get('[aria-label="notification-more"]').trigger("click");

    expect(wrapper.findAll('[role="dialog"] button').map((row) => row.text())).toEqual([
      "notification-clear-all",
      "notification-settings",
    ]);
  });

  it.each([
    [0, "markAllRead", ["Activity"]],
    [1, "dismissAllActivity", []],
  ])("runs the action of row %i and closes the second sheet", async (row, action, args) => {
    const spy = vi.fn();
    const wrapper = mountPanelInSheet({ activity: [activity()], [action]: spy, unreadActivityCount: 1 });

    await wrapper.get('[aria-label="notification-more"]').trigger("click");
    await wrapper.findAll('[role="dialog"] button')[row].trigger("click");

    expect(spy).toHaveBeenCalledWith(...args);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("closes the second sheet and asks the container to close when the settings open", async () => {
    const wrapper = mountPanelInSheet({ activity: [activity()], unreadActivityCount: 1 });

    await wrapper.get('[aria-label="notification-more"]').trigger("click");
    await wrapper.findAll('[role="dialog"] button')[2].trigger("click");

    expect(mocks.push).toHaveBeenCalledWith({ name: "notificationSettings" });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(wrapper.emitted("navigate")).toHaveLength(1);
  });
});

/** Mounts an open sheet with the given store state and with a stub for the panel. */
function mountSheet(state: Record<string, unknown>) {
  Object.assign(mocks.store, state);
  return mount(NotificationSheet, {
    global: { ...global, stubs: { NotificationPanel: true, Sheet: SHEET_STUB } },
    props: { modelValue: true },
  });
}

describe("NotificationSheet", () => {
  it("puts Clear all on the left and Mark all read on the right", () => {
    const wrapper = mountSheet({ activity: [activity()], unreadActivityCount: 1 });

    expect(wrapper.findAll("footer button").map((button) => button.text())).toEqual([
      "notification-clear-all",
      "notification-mark-all-read",
    ]);
  });

  it("keeps only Clear all when all rows are read", () => {
    const wrapper = mountSheet({ activity: [activity({ isRead: true })], unreadActivityCount: 0 });

    expect(wrapper.findAll("footer button").map((button) => button.text())).toEqual(["notification-clear-all"]);
  });

  it("has no bottom actions when the list has no rows", () => {
    const wrapper = mountSheet({ activity: [], unreadActivityCount: 0 });

    expect(wrapper.find("footer").exists()).toBe(false);
  });

  it("runs the store action of each button", async () => {
    const dismissAllActivity = vi.fn();
    const markAllRead = vi.fn();
    const wrapper = mountSheet({ activity: [activity()], dismissAllActivity, markAllRead, unreadActivityCount: 1 });
    const buttons = wrapper.findAll("footer button");

    await buttons[0].trigger("click");
    await buttons[1].trigger("click");

    expect(dismissAllActivity).toHaveBeenCalledOnce();
    expect(markAllRead).toHaveBeenCalledWith("Activity");
  });
});

describe("RequestCard", () => {
  it("puts Accept after Ignore, so the main action is on the right", () => {
    const wrapper = mount(RequestCard, { global, props: { notification: friendRequest() } });

    expect(wrapper.findAll("[data-test]").map((button) => button.attributes("data-test"))).toEqual([
      "request-ignore",
      "request-accept",
    ]);
  });

  it("writes the remark through the locale file", () => {
    const wrapper = mount(RequestCard, { global, props: { notification: friendRequest("Hi") } });

    expect(wrapper.text()).toContain("notification-request-remark Hi");
  });

  it("disables only the other button while a request runs", async () => {
    let finish: () => void = vi.fn();
    Object.assign(mocks.store, {
      acceptFriendRequest: vi.fn(() => new Promise<void>((resolve) => (finish = resolve))),
    });
    const wrapper = mount(RequestCard, { global, props: { notification: friendRequest() } });

    await wrapper.get('[data-test="request-accept"]').trigger("click");

    expect(wrapper.get('[data-test="request-accept"]').attributes("aria-busy")).toBe("true");
    expect(wrapper.get('[data-test="request-accept"]').attributes("disabled")).toBeUndefined();
    expect(wrapper.get('[data-test="request-ignore"]').attributes("disabled")).toBeDefined();
    finish();
    await flushPromises();
  });
});
