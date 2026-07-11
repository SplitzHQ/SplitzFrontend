import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend/openapi";

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

  it("validates the configured password policy before submit", async () => {
    routeMock.query = { email: "person@example.com", resetCode: "reset-code" };
    const wrapper = mount(ResetPasswordPage);

    await wrapper.find('input[name="new-password"]').setValue("short1");
    await wrapper.find('input[name="confirm-password"]').setValue("short1");
    await wrapper.find("form").trigger("submit");

    expect(userStoreMock.resetPassword).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("auth-reset-password-policy");
  });

  it("submits reset and routes to login with success feedback", async () => {
    routeMock.query = { email: "person@example.com", resetCode: "reset-code" };
    userStoreMock.resetPassword.mockResolvedValue(undefined);
    const wrapper = mount(ResetPasswordPage);

    await wrapper.find('input[name="new-password"]').setValue("Password1234");
    await wrapper.find('input[name="confirm-password"]').setValue("Password1234");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(userStoreMock.resetPassword).toHaveBeenCalledWith({
      email: "person@example.com",
      newPassword: "Password1234",
      resetCode: "reset-code",
    });
    expect(toastMock.success).toHaveBeenCalledWith("auth-reset-password-success-toast");
    expect(routerMock.push).toHaveBeenCalledWith({ name: "login", query: { passwordReset: "success" } });
  });

  it("shows a recoverable expired token error", async () => {
    routeMock.query = { email: "person@example.com", resetCode: "expired-code" };
    const response = Response.json({ errors: { InvalidToken: ["Invalid token."] } }, { status: 400 });
    userStoreMock.resetPassword.mockRejectedValue(new ResponseError(response));
    const wrapper = mount(ResetPasswordPage);

    await wrapper.find('input[name="new-password"]').setValue("Password1234");
    await wrapper.find('input[name="confirm-password"]').setValue("Password1234");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("auth-reset-password-error");
    expect(wrapper.text()).toContain("auth-reset-password-forgot-link");
  });

  it("shows a password policy error returned by the backend", async () => {
    routeMock.query = { email: "person@example.com", resetCode: "reset-code" };
    const response = Response.json(
      { errors: { PasswordTooShort: ["Passwords must be at least 12 characters."] } },
      { status: 400 }
    );
    userStoreMock.resetPassword.mockRejectedValue(new ResponseError(response));
    const wrapper = mount(ResetPasswordPage);

    await wrapper.find('input[name="new-password"]').setValue("longenough1x");
    await wrapper.find('input[name="confirm-password"]').setValue("longenough1x");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("auth-reset-password-policy");
    expect(wrapper.text()).not.toContain("auth-reset-password-error");
  });
});
