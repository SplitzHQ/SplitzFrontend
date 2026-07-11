import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    $t: (key: string) => key,
  }),
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
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
});
