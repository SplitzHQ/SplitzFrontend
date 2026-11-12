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

  it("shows the password rule under the field, and does not submit or show a toast", async () => {
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("short1");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.get("#password-error").text()).toBe("auth-password-policy");
    expect(wrapper.find('[data-test="register-error"]').exists()).toBe(false);
    expect(userStoreMock.register).not.toHaveBeenCalled();
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it("has one password field, and links it to the checklist", () => {
    const wrapper = mount(RegisterPage);

    expect(wrapper.find('input[name="confirm-password"]').exists()).toBe(false);
    expect(wrapper.get('input[name="password"]').attributes("aria-describedby")).toBe("password-rules");
    expect(wrapper.find("#password-rules").exists()).toBe(true);
  });

  it("shows a password error from the backend under the field", async () => {
    const body = JSON.stringify({ errors: { PasswordRequiresUpper: ["Needs an upper case letter."] } });
    userStoreMock.register.mockRejectedValue(new ResponseError(new Response(body, { status: 400 })));
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get("#password-error").text()).toBe("auth-password-policy");
    expect(wrapper.find('[data-test="register-error"]').exists()).toBe(false);
  });

  it("tells users to check email after registration when email is enabled", async () => {
    userStoreMock.register.mockResolvedValue(true);
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: true, passwordResetEnabled: true });
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
    await wrapper.find("form").trigger("submit");

    await flushPromises();
    expect(wrapper.text()).toContain("auth-register-complete-title");
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("treats registration as a normal success when email delivery is disabled", async () => {
    userStoreMock.register.mockResolvedValue(true);
    userStoreMock.fetchEmailCapabilities.mockResolvedValue({ emailEnabled: false, passwordResetEnabled: false });
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
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
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).not.toContain("auth-register-failed");
    expect(toastMock.success).toHaveBeenCalledWith("auth-register-success");
    expect(routerMock.push).toHaveBeenCalledWith({ name: "login" });
  });

  it("preserves generic handling for ordinary registration failures", async () => {
    userStoreMock.register.mockRejectedValue(new Error("registration failed"));
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[data-test="register-error"]').text()).toContain("auth-register-failed");
    expect(userStoreMock.fetchEmailCapabilities).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test="register-rate-limit"]').exists()).toBe(false);
    expect(wrapper.get('[data-test="register-submit"]').attributes("disabled")).toBeUndefined();

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(userStoreMock.register).toHaveBeenCalledTimes(2);
  });

  it.each(["DuplicateEmail", "DuplicateUserName"])(
    "explains that the email is registered for %s without consuming the response",
    async (errorCode) => {
      const response = new Response(JSON.stringify({ errors: { [errorCode]: ["Already taken."] } }), {
        headers: { "Content-Type": "application/problem+json" },
        status: 400,
      });
      userStoreMock.register.mockRejectedValue(new ResponseError(response));
      const wrapper = mount(RegisterPage);

      await wrapper.find('input[name="email"]').setValue("person@example.com");
      await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(wrapper.get('[data-test="register-error"]').text()).toContain("auth-register-email-already-registered");
      expect(toastMock.success).not.toHaveBeenCalled();
      expect(userStoreMock.fetchEmailCapabilities).not.toHaveBeenCalled();
      expect(routerMock.push).not.toHaveBeenCalled();
      expect(response.bodyUsed).toBe(false);
      expect(wrapper.get('[data-test="register-submit"]').attributes("disabled")).toBeUndefined();
    }
  );

  it.each([
    [400, "not json"],
    [400, "null"],
    [400, "{}"],
    [500, JSON.stringify({ errors: { DuplicateEmail: ["Already taken."] } })],
  ])("keeps the generic error for HTTP %s with body %s", async (status, body) => {
    userStoreMock.register.mockRejectedValue(new ResponseError(new Response(body, { status })));
    const wrapper = mount(RegisterPage);

    await wrapper.find('input[name="email"]').setValue("person@example.com");
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[data-test="register-error"]').text()).toContain("auth-register-failed");
    expect(toastMock.success).not.toHaveBeenCalled();
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
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
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
    await wrapper.find('input[name="password"]').setValue("SplitDinner2026");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get('[data-test="register-rate-limit"]').text()).toContain("2");
    expect(wrapper.get('[data-test="register-submit"]').attributes("disabled")).toBeDefined();
    expect(wrapper.text()).not.toContain("auth-register-failed");

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
