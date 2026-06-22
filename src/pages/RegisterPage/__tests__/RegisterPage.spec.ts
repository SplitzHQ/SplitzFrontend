import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    $t: (key: string) => key,
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
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
});
