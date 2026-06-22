import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ResetPasswordPage from "../ResetPasswordPage.vue";

const routeMock = vi.hoisted(() => ({
  query: {} as Record<string, unknown>,
}));
const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const userStoreMock = vi.hoisted(() => ({
  resetPassword: vi.fn(),
}));

vi.mock("vue-router", () => ({
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
  },
  useRoute: () => routeMock,
  useRouter: () => routerMock,
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

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    routeMock.query = {};
  });

  it("shows an invalid-link state when required query parameters are missing", () => {
    routeMock.query = { email: "person@example.com" };

    const wrapper = mount(ResetPasswordPage);

    expect(userStoreMock.resetPassword).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("auth-reset-password-invalid-title");
    expect(wrapper.text()).toContain("auth-reset-password-forgot-link");
  });

  it("validates password confirmation before submit", async () => {
    routeMock.query = { email: "person@example.com", resetCode: "reset-code" };
    const wrapper = mount(ResetPasswordPage);

    await wrapper.find('input[name="new-password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Different1!");
    await wrapper.find("form").trigger("submit");

    expect(userStoreMock.resetPassword).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("auth-reset-password-mismatch");
  });

  it("submits reset and routes to login with success feedback", async () => {
    routeMock.query = { email: "person@example.com", resetCode: "reset-code" };
    userStoreMock.resetPassword.mockResolvedValue(undefined);
    const wrapper = mount(ResetPasswordPage);

    await wrapper.find('input[name="new-password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(userStoreMock.resetPassword).toHaveBeenCalledWith({
      email: "person@example.com",
      newPassword: "Passw0rd!",
      resetCode: "reset-code",
    });
    expect(toastMock.success).toHaveBeenCalledWith("auth-reset-password-success-toast");
    expect(routerMock.push).toHaveBeenCalledWith({ name: "login", query: { passwordReset: "success" } });
  });

  it("shows a recoverable expired token error", async () => {
    routeMock.query = { email: "person@example.com", resetCode: "expired-code" };
    userStoreMock.resetPassword.mockRejectedValue(new Error("expired"));
    const wrapper = mount(ResetPasswordPage);

    await wrapper.find('input[name="new-password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("auth-reset-password-error");
    expect(wrapper.text()).toContain("auth-reset-password-forgot-link");
  });
});
