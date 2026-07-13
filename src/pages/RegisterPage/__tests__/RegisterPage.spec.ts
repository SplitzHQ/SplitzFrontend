import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend/openapi";

import RegisterPage from "../RegisterPage.vue";

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const userStoreMock = vi.hoisted(() => ({
  fetchEmailCapabilities: vi.fn(),
  register: vi.fn(),
}));

vi.mock("vue-router", () => ({
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
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

describe("RegisterPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tells users to check email after registration when email is enabled", async () => {
    userStoreMock.register.mockResolvedValue(true);
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: true, passwordResetEnabled: true });
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");

    expect(toastMock.success).toHaveBeenCalledWith("auth-register-success-email-enabled");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("treats registration as a normal success when email delivery is disabled", async () => {
    userStoreMock.register.mockResolvedValue(true);
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: false, passwordResetEnabled: false });
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");

    expect(toastMock.success).toHaveBeenCalledWith("auth-register-success");
    expect(wrapper.text()).not.toContain("auth-register-success-email-disabled");
    expect(routerMock.push).toHaveBeenCalledWith({ name: "login" });
  });

  it("does not report registration failure when email capability lookup fails after account creation", async () => {
    userStoreMock.register.mockResolvedValue(true);
    userStoreMock.fetchEmailCapabilities.mockRejectedValue(new Error("capabilities unavailable"));
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");

    expect(toastMock.error).not.toHaveBeenCalledWith("auth-register-failed");
    expect(toastMock.success).toHaveBeenCalledWith("auth-register-success");
    expect(routerMock.push).toHaveBeenCalledWith({ name: "login" });
  });

  it("preserves generic handling for ordinary registration failures", async () => {
    userStoreMock.register.mockRejectedValue(new Error("registration failed"));
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(toastMock.error).toHaveBeenCalledWith("auth-register-failed");
    expect(userStoreMock.fetchEmailCapabilities).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test="register-rate-limit"]').exists()).toBe(false);
    expect(wrapper.get('[data-test="register-submit"]').attributes("disabled")).toBeUndefined();

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(userStoreMock.register).toHaveBeenCalledTimes(2);
  });

  it("ignores duplicate button and form submissions while registration is pending", async () => {
    let resolveRegistration!: () => void;
    userStoreMock.register.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRegistration = resolve;
      })
    );
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: false, passwordResetEnabled: false });
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.get('[data-test="register-submit"]').trigger("click");
    await wrapper.find("form").trigger("submit");

    expect(userStoreMock.register).toHaveBeenCalledTimes(1);

    resolveRegistration();
    await flushPromises();
  });

  it("shows a registration cooldown and retries only after a manual submit", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    const response = new Response(null, { headers: { "Retry-After": "2" }, status: 429 });
    userStoreMock.register.mockRejectedValue(new ResponseError(response));
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("Passw0rd!");
    await wrapper.find('input[name="confirm-password"]').setValue("Passw0rd!");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[data-test="register-rate-limit"]').text()).toContain("2");
    expect(wrapper.get('[data-test="register-submit"]').attributes("disabled")).toBeDefined();
    expect(toastMock.error).not.toHaveBeenCalledWith("auth-register-failed");

    await wrapper.find("form").trigger("submit");
    expect(userStoreMock.register).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();
    expect(wrapper.find('[data-test="register-rate-limit"]').exists()).toBe(false);
    expect(wrapper.get('[data-test="register-submit"]').attributes("disabled")).toBeUndefined();
    expect(userStoreMock.register).toHaveBeenCalledTimes(1);

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(userStoreMock.register).toHaveBeenCalledTimes(2);
  });
});
