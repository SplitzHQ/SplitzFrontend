import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ConfirmEmailPage from "../ConfirmEmailPage.vue";

const routeMock = vi.hoisted(() => ({
  query: {} as Record<string, unknown>,
}));
const userStoreMock = vi.hoisted(() => ({
  confirmEmail: vi.fn(),
}));

vi.mock("vue-router", () => ({
  RouterLink: {
    props: ["to"],
    template: "<a><slot /></a>",
  },
  useRoute: () => routeMock,
}));

vi.mock("@/stores/user", () => ({
  useUserStore: () => userStoreMock,
}));

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string) => key,
  }),
}));

describe("ConfirmEmailPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    routeMock.query = {};
  });

  it("shows an invalid-link state when required query parameters are missing", async () => {
    routeMock.query = { userId: "user-1" };

    const wrapper = mount(ConfirmEmailPage);
    await flushPromises();

    expect(userStoreMock.confirmEmail).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("auth-confirm-email-invalid-title");
    expect(wrapper.text()).toContain("auth-confirm-email-resend-link");
  });

  it("confirms email with Identity query parameters and shows success", async () => {
    routeMock.query = { changedEmail: "new@example.com", code: "confirm-code", userId: "user-1" };
    userStoreMock.confirmEmail.mockResolvedValue(undefined);

    const wrapper = mount(ConfirmEmailPage);
    await flushPromises();

    expect(userStoreMock.confirmEmail).toHaveBeenCalledWith({
      changedEmail: "new@example.com",
      code: "confirm-code",
      userId: "user-1",
    });
    expect(wrapper.text()).toContain("auth-confirm-email-success-title");
    expect(wrapper.text()).toContain("auth-confirm-email-login-link");
  });

  it("shows an expired-link state when confirmation fails", async () => {
    routeMock.query = { code: "expired-code", userId: "user-1" };
    userStoreMock.confirmEmail.mockRejectedValue(new Error("expired"));

    const wrapper = mount(ConfirmEmailPage);
    await flushPromises();

    expect(wrapper.text()).toContain("auth-confirm-email-error-title");
    expect(wrapper.text()).toContain("auth-confirm-email-resend-link");
  });
});
