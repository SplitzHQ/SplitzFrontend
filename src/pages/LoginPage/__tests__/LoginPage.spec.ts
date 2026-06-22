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
    $t: (key: string) => key,
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
});
