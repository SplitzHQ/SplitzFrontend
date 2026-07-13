import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend/openapi";

import ForgotPasswordPage from "../ForgotPasswordPage.vue";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const userStoreMock = vi.hoisted(() => ({
  fetchEmailCapabilities: vi.fn(),
  forgotPassword: vi.fn(),
}));

vi.mock("vue-router", () => ({
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
  },
}));

vi.mock("vue-sonner", () => ({
  toast: toastMock,
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

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("disables recovery when password reset email is unavailable", async () => {
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: false, passwordResetEnabled: false });

    const wrapper = mount(ForgotPasswordPage);
    await flushPromises();

    expect(wrapper.text()).toContain("auth-forgot-password-unavailable-title");
    expect(wrapper.find('input[name="email"]').attributes("disabled")).toBeDefined();
    expect(wrapper.get('[data-test="forgot-password-submit"]').attributes("disabled")).toBeDefined();
  });

  it("submits password recovery requests with generic success copy", async () => {
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: true, passwordResetEnabled: true });
    userStoreMock.forgotPassword.mockResolvedValue(undefined);

    const wrapper = mount(ForgotPasswordPage);
    await flushPromises();

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(userStoreMock.forgotPassword).toHaveBeenCalledWith("person@example.com");
    expect(wrapper.text()).toContain("auth-forgot-password-success-title");
    expect(toastMock.success).toHaveBeenCalledWith("auth-forgot-password-success-toast");
  });

  it("shows a recoverable error without leaking account existence", async () => {
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: true, passwordResetEnabled: true });
    userStoreMock.forgotPassword.mockRejectedValue(new Error("network"));

    const wrapper = mount(ForgotPasswordPage);
    await flushPromises();

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("auth-forgot-password-error");
    expect(toastMock.error).toHaveBeenCalledWith("auth-forgot-password-error");
  });

  it("stays on the form during a recovery cooldown and retries only after manual submit", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: true, passwordResetEnabled: true });
    userStoreMock.forgotPassword.mockRejectedValue(
      new ResponseError(new Response(null, { headers: { "Retry-After": "2" }, status: 429 }))
    );
    const wrapper = mount(ForgotPasswordPage);
    await flushPromises();

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[data-test="recovery-rate-limit"]').text()).toContain("2");
    expect(wrapper.get('[data-test="forgot-password-submit"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find('input[name="email"]').attributes("disabled")).toBeUndefined();
    expect(wrapper.text()).not.toContain("auth-forgot-password-success-title");
    expect(toastMock.error).not.toHaveBeenCalledWith("auth-forgot-password-error");

    await wrapper.find("form").trigger("submit");
    expect(userStoreMock.forgotPassword).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();
    expect(wrapper.find('[data-test="recovery-rate-limit"]').exists()).toBe(false);
    expect(userStoreMock.forgotPassword).toHaveBeenCalledTimes(1);

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(userStoreMock.forgotPassword).toHaveBeenCalledTimes(2);
  });

  it("ignores duplicate recovery submissions while the first request is pending", async () => {
    let resolveRecovery!: () => void;
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: true, passwordResetEnabled: true });
    userStoreMock.forgotPassword.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRecovery = resolve;
      })
    );
    const wrapper = mount(ForgotPasswordPage);
    await flushPromises();

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find("form").trigger("submit");
    await wrapper.find("form").trigger("submit");

    expect(userStoreMock.forgotPassword).toHaveBeenCalledTimes(1);

    resolveRecovery();
    await flushPromises();
  });
});
