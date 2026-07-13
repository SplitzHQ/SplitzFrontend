import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend/openapi";

import LoginPage from "../LoginPage.vue";

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const userStoreMock = vi.hoisted(() => ({
  login: vi.fn(),
  resendConfirmationEmail: vi.fn(),
}));

vi.mock("vue-router", () => ({
  RouterLink: {
    props: ["to"],
    template: "<a :data-to='typeof to === `object` ? to.name : to'><slot /></a>",
  },
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
    $t: (key: string, args?: Record<string, unknown>) =>
      typeof args?.seconds === "number" ? `${key}:${args.seconds}` : key,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("preserves the 2FA code toggle", async () => {
    const wrapper = mount(LoginPage);

    expect(wrapper.find('input[name="2fa-code"]').exists()).toBe(false);

    await wrapper.get('[data-test="toggle-two-factor"]').trigger("click");

    expect(wrapper.find('input[name="2fa-code"]').exists()).toBe(true);
  });

  it("links to password recovery", () => {
    const wrapper = mount(LoginPage);

    expect(wrapper.get('[data-test="forgot-password-link"]').attributes("data-to")).toBe("forgotPassword");
  });

  it("offers a confirmation resend after Identity returns NotAllowed", async () => {
    const response = Response.json({ detail: "NotAllowed" }, { status: 401 });
    userStoreMock.login.mockRejectedValue(new ResponseError(response));
    userStoreMock.resendConfirmationEmail.mockResolvedValue(undefined);
    const wrapper = mount(LoginPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("auth-login-resend-confirmation");

    await wrapper.get('[data-test="resend-confirmation"]').trigger("click");

    expect(userStoreMock.resendConfirmationEmail).toHaveBeenCalledWith("person@example.com");
    expect(toastMock.success).toHaveBeenCalledWith("auth-resend-confirmation-success");
  });

  it("does not offer confirmation resend after ordinary login errors", async () => {
    const response = Response.json({ detail: "Failed" }, { status: 401 });
    userStoreMock.login.mockRejectedValue(new ResponseError(response));
    const wrapper = mount(LoginPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("wrong-password");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find('[data-test="resend-confirmation"]').exists()).toBe(false);
  });

  it("shows a login cooldown without exposing confirmation resend after a 429", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    const response = new Response(null, { headers: { "Retry-After": "2" }, status: 429 });
    userStoreMock.login.mockRejectedValue(new ResponseError(response));
    const wrapper = mount(LoginPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("wrong-password");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[data-test="login-rate-limit"]').text()).toContain("2");
    expect(wrapper.get('[data-test="login-submit"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find('[data-test="resend-confirmation"]').exists()).toBe(false);

    await wrapper.find("form").trigger("submit");
    expect(userStoreMock.login).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();
    expect(wrapper.find('[data-test="login-rate-limit"]').exists()).toBe(false);
    expect(wrapper.get('[data-test="login-submit"]').attributes("disabled")).toBeUndefined();
    expect(userStoreMock.login).toHaveBeenCalledTimes(1);

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(userStoreMock.login).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
