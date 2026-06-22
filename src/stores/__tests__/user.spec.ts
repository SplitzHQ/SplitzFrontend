import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserStore } from "../user";

const splitzBackendApiMock = vi.hoisted(() => ({
  accountForgotPasswordPost: vi.fn(),
  accountLoginPost: vi.fn(),
  accountRegisterPost: vi.fn(),
  accountResendConfirmationEmailPost: vi.fn(),
  accountResetPasswordPost: vi.fn(),
  mapIdentityApiAccountConfirmEmail: vi.fn(),
}));

const accountApiMock = vi.hoisted(() => ({
  getUserInfo: vi.fn(),
}));

const accountEmailApiMock = vi.hoisted(() => ({
  getEmailCapabilities: vi.fn(),
}));

vi.mock("@/backend/openapi", () => ({
  AccountApi: vi.fn(function () {
    return accountApiMock;
  }),
  AccountEmailApi: vi.fn(function () {
    return accountEmailApiMock;
  }),
  SplitzBackendApi: vi.fn(function () {
    return splitzBackendApiMock;
  }),
}));

vi.mock("@/backend/config", () => ({
  default: {},
}));

describe("useUserStore email account actions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    accountApiMock.getUserInfo.mockRejectedValue(new Error("not signed in"));
  });

  it("loads transactional email capabilities", async () => {
    const capabilities = { emailEnabled: true, passwordResetEnabled: true };
    accountEmailApiMock.getEmailCapabilities.mockResolvedValue(capabilities);

    const store = useUserStore();

    await expect(store.fetchEmailCapabilities()).resolves.toEqual(capabilities);
    expect(accountEmailApiMock.getEmailCapabilities).toHaveBeenCalledOnce();
  });

  it("confirms email with Identity query parameters", async () => {
    const store = useUserStore();

    await store.confirmEmail({ changedEmail: "new@example.com", code: "confirm-code", userId: "user-1" });

    expect(splitzBackendApiMock.mapIdentityApiAccountConfirmEmail).toHaveBeenCalledWith({
      changedEmail: "new@example.com",
      code: "confirm-code",
      userId: "user-1",
    });
  });

  it("requests confirmation resend with generic success result", async () => {
    const store = useUserStore();

    await expect(store.resendConfirmationEmail("person@example.com")).resolves.toBeUndefined();
    expect(splitzBackendApiMock.accountResendConfirmationEmailPost).toHaveBeenCalledWith({
      resendConfirmationEmailRequest: { email: "person@example.com" },
    });
  });

  it("requests password recovery with generic success result", async () => {
    const store = useUserStore();

    await expect(store.forgotPassword("person@example.com")).resolves.toBeUndefined();
    expect(splitzBackendApiMock.accountForgotPasswordPost).toHaveBeenCalledWith({
      forgotPasswordRequest: { email: "person@example.com" },
    });
  });

  it("resets password with email, reset code, and new password", async () => {
    const store = useUserStore();

    await store.resetPassword({ email: "person@example.com", newPassword: "Passw0rd!", resetCode: "reset-code" });

    expect(splitzBackendApiMock.accountResetPasswordPost).toHaveBeenCalledWith({
      resetPasswordRequest: {
        email: "person@example.com",
        newPassword: "Passw0rd!",
        resetCode: "reset-code",
      },
    });
  });
});
