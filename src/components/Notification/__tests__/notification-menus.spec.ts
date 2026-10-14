import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, reactive, ref } from "vue";

import AvatarMenu from "@/components/Notification/AvatarMenu.vue";
import NotificationBell from "@/components/Notification/NotificationBell.vue";

const mocks = vi.hoisted(() => ({
  desktop: { value: true },
  push: vi.fn(),
  store: {
    fetch: vi.fn(),
    markAllRead: vi.fn(),
    pendingRequestCount: 1,
    requests: [{ notificationId: "request-1" }],
    unreadActivityCount: 2,
  },
}));

vi.mock("@/libs/use-media-query", () => ({ useIsDesktop: () => mocks.desktop }));
vi.mock("@/libs/asset-url", () => ({ assetsBasePath: "https://assets.example.test" }));
vi.mock("@/stores/notification", () => ({ useNotificationStore: () => mocks.store }));
vi.mock("@/stores/user", () => ({ useUserStore: () => ({ user: { photo: null, userName: "User" } }) }));
vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (id: string) => id }) }));
vi.mock("vue-router", () => ({ useRouter: () => ({ push: mocks.push }) }));

let wrapper: VueWrapper;

/** Mount the real popover while isolating the panels' data and sheet behavior. */
function mountMenu(menu: "avatar" | "bell") {
  wrapper = mount(
    defineComponent({
      components: { AvatarMenu, NotificationBell },
      template: menu === "avatar" ? "<AvatarMenu />" : "<NotificationBell />",
    }),
    {
      attachTo: document.body,
      global: {
        stubs: {
          Avatar: { template: '<span data-test="avatar" />' },
          NotificationPanel: {
            emits: ["navigate"],
            template: '<button type="button" @click="$emit(\'navigate\')">Open notification</button>',
          },
          RequestCard: { template: '<button type="button">Accept request</button>' },
          Sheet: {
            props: ["modelValue"],
            template: '<div v-if="modelValue" role="dialog" data-test="sheet"><slot /></div>',
          },
        },
      },
    }
  );
  return wrapper.get("button");
}

beforeEach(() => {
  mocks.desktop = ref(true);
  mocks.store = reactive({
    fetch: vi.fn().mockResolvedValue(undefined),
    markAllRead: vi.fn().mockResolvedValue(undefined),
    pendingRequestCount: 1,
    requests: [{ notificationId: "request-1" }],
    unreadActivityCount: 2,
  });
  mocks.push.mockReset();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  wrapper?.unmount();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("notification popovers", () => {
  it("opens the desktop bell once, fetches once, and closes on navigation", async () => {
    const trigger = mountMenu("bell");
    await trigger.trigger("click");
    await flushPromises();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(mocks.store.fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-test="sheet"]')).toBeNull();
    const panel = document.querySelector('[role="dialog"]');
    expect(panel?.getAttribute("aria-label")).toBe("notification-title");
    panel?.querySelector<HTMLButtonElement>("button")?.click();
    await flushPromises();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("keeps the bell's mobile sheet and fetch-on-open behavior", async () => {
    mocks.desktop.value = false;
    const trigger = mountMenu("bell");
    await trigger.trigger("click");
    await flushPromises();
    expect(document.querySelector('[data-test="sheet"]')).not.toBeNull();
    expect(document.querySelector("[data-dismissable-layer]")).toBeNull();
    expect(mocks.store.fetch).toHaveBeenCalledTimes(1);
    await trigger.trigger("click");
    await flushPromises();
    expect(document.querySelector('[data-test="sheet"]')).toBeNull();
  });

  it("opens desktop avatar requests and marks them read once", async () => {
    const trigger = mountMenu("avatar");
    await trigger.trigger("click");
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("notification-requests-title");
    expect(mocks.store.markAllRead).toHaveBeenCalledExactlyOnceWith("Request");
    expect(mocks.push).not.toHaveBeenCalled();
    mocks.store.pendingRequestCount = 0;
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await wrapper.get("button").trigger("click");
    expect(mocks.push).toHaveBeenCalledWith({ name: "profile" });
  });

  it.each(["mobile", "no requests"])("uses the avatar as a profile link with %s", async (mode) => {
    if (mode === "mobile") mocks.desktop.value = false;
    else mocks.store.pendingRequestCount = 0;
    const trigger = mountMenu("avatar");
    await trigger.trigger("click");
    await flushPromises();
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith({ name: "profile" });
    expect(mocks.store.markAllRead).not.toHaveBeenCalled();
    expect(trigger.attributes("aria-haspopup")).toBeUndefined();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("closes the desktop bell when switching to mobile", async () => {
    const trigger = mountMenu("bell");
    await trigger.trigger("click");
    await flushPromises();
    mocks.desktop.value = false;
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
  });
});
