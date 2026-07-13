import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend/openapi";

import ConfirmEmailPage from "../ConfirmEmailPage.vue";

const routeMock = vi.hoisted(() => ({
  query: {} as Record<string, unknown>,
}));
const userStoreMock = vi.hoisted(() => ({
  confirmEmail: vi.fn(),
}));

vi.mock("vue-router", () => ({
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
  },
  useRoute: () => routeMock,
}));

vi.mock("@/stores/user", () => ({
  useUserStore: () => userStoreMock,
}));

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: Record<string, unknown>) =>
      typeof args?.seconds === "number" ? `${key}:${args.seconds}` : key,
  }),
}));

describe("ConfirmEmailPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    routeMock.query = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an invalid-link state when required query parameters are missing", async () => {
    routeMock.query = { userId: "user-1" };

    const wrapper = mount(ConfirmEmailPage);
    await flushPromises();

    expect(userStoreMock.confirmEmail).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("auth-confirm-email-invalid-title");
    expect(wrapper.text()).toContain("auth-confirm-email-resend-link");
  });

  it("confirms email with Identity query parameters and shows success", async () => {
    routeMock.query = { changedEmail: "new@example.com", code: "confirm-code", userId: "user-1" };
    userStoreMock.confirmEmail.mockResolvedValue(undefined);

    const wrapper = mount(ConfirmEmailPage);
    await flushPromises();

    expect(userStoreMock.confirmEmail).toHaveBeenCalledWith({
      changedEmail: "new@example.com",
      code: "confirm-code",
      userId: "user-1",
    });
    expect(wrapper.text()).toContain("auth-confirm-email-success-title");
    expect(wrapper.text()).toContain("auth-confirm-email-login-link");
  });

  it("shows an expired-link state when confirmation fails", async () => {
    routeMock.query = { code: "expired-code", userId: "user-1" };
    userStoreMock.confirmEmail.mockRejectedValue(new Error("expired"));

    const wrapper = mount(ConfirmEmailPage);
    await flushPromises();

    expect(wrapper.text()).toContain("auth-confirm-email-error-title");
    expect(wrapper.text()).toContain("auth-confirm-email-resend-link");
  });

  it("shows a distinct confirmation cooldown and retries only after a manual click", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    routeMock.query = { code: "confirm-code", userId: "user-1" };
    userStoreMock.confirmEmail.mockRejectedValue(
      new ResponseError(new Response(null, { headers: { "Retry-After": "2" }, status: 429 }))
    );

    const wrapper = mount(ConfirmEmailPage);
    await flushPromises();

    expect(wrapper.get('[data-test="confirmation-rate-limit"]').text()).toContain("2");
    expect(wrapper.get('[data-test="confirmation-retry"]').attributes("disabled")).toBeDefined();
    expect(wrapper.text()).not.toContain("auth-confirm-email-error-title");
    expect(userStoreMock.confirmEmail).toHaveBeenCalledTimes(1);

    await wrapper.get('[data-test="confirmation-retry"]').trigger("click");
    expect(userStoreMock.confirmEmail).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();
    expect(wrapper.find('[data-test="confirmation-rate-limit"]').exists()).toBe(false);
    expect(userStoreMock.confirmEmail).toHaveBeenCalledTimes(1);

    await wrapper.get('[data-test="confirmation-retry"]').trigger("click");
    await flushPromises();
    expect(userStoreMock.confirmEmail).toHaveBeenCalledTimes(2);
  });
});
