import { flushPromises, shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend/openapi";

import ProfilePage from "../ProfilePage.vue";

const accountApiMock = vi.hoisted(() => ({
  removeFriend: vi.fn(),
  updateUserInfo: vi.fn(),
  uploadUserAvatar: vi.fn(),
}));
const userStoreMock = vi.hoisted(() => ({
  fetchUserInfo: vi.fn(),
  logout: vi.fn(),
  user: {
    email: "person@example.com",
    friends: [],
    photo: null,
    userName: "Person",
  },
}));
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock("@/backend", () => ({
  AccountApi: class {
    removeFriend = accountApiMock.removeFriend;
    updateUserInfo = accountApiMock.updateUserInfo;
    uploadUserAvatar = accountApiMock.uploadUserAvatar;
  },
}));

vi.mock("@/backend/config", () => ({ default: {} }));

vi.mock("@/stores/user", () => ({
  useUserStore: () => userStoreMock,
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("vue-sonner", () => ({ toast: toastMock }));

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: Record<string, unknown>) =>
      typeof args?.seconds === "number" ? `${key}:${args.seconds}` : key,
  }),
}));

describe("ProfilePage avatar upload", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("disables the picker during a rate-limit cooldown and never retries automatically", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    accountApiMock.uploadUserAvatar.mockRejectedValue(
      new ResponseError(new Response(null, { headers: { "Retry-After": "2" }, status: 429 }))
    );
    const wrapper = mountPage();
    const input = wrapper.get('input[type="file"]');
    const inputClick = vi.spyOn(input.element as HTMLInputElement, "click");
    const trigger = wrapper.get('[data-test="avatar-upload-trigger"]');

    await trigger.trigger("click");
    expect(inputClick).toHaveBeenCalledTimes(1);

    Object.defineProperty(input.element, "files", {
      configurable: true,
      value: [new File(["avatar"], "avatar.png", { type: "image/png" })],
    });
    await input.trigger("change");
    await flushPromises();

    expect(wrapper.get('[data-test="avatar-rate-limit"]').text()).toContain("2");
    expect(trigger.attributes("disabled")).toBeDefined();
    expect(input.attributes("disabled")).toBeDefined();
    expect(accountApiMock.uploadUserAvatar).toHaveBeenCalledTimes(1);

    await trigger.trigger("click");
    expect(inputClick).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();
    expect(wrapper.find('[data-test="avatar-rate-limit"]').exists()).toBe(false);
    expect(accountApiMock.uploadUserAvatar).toHaveBeenCalledTimes(1);

    await trigger.trigger("click");
    expect(inputClick).toHaveBeenCalledTimes(2);
  });
});

function mountPage() {
  return shallowMount(ProfilePage, {
    global: {
      stubs: {
        AddFriendSheet: true,
        Avatar: true,
        EditNicknameSheet: true,
        HeaderMobileSecondary: true,
        Layout: {
          template: '<div><slot name="header" /><slot /></div>',
        },
        RateLimitCountdown: false,
        SButton: true,
        SIconButton: true,
        TextInput: true,
      },
    },
  });
}
