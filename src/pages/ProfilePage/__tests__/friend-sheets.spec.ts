import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend";

import AddFriendSheet from "../AddFriendSheet.vue";
import RemoveFriendSheet from "../RemoveFriendSheet.vue";

const accountApiMock = vi.hoisted(() => ({
  removeFriend: vi.fn(),
  sendFriendRequest: vi.fn(),
}));
const userStoreMock = vi.hoisted(() => ({ fetchUserInfo: vi.fn() }));
const toastMock = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock("@/backend", () => ({
  AccountApi: class {
    removeFriend = accountApiMock.removeFriend;
    sendFriendRequest = accountApiMock.sendFriendRequest;
  },
  ResponseError: class extends Error {
    constructor(public response: Response) {
      super("response error");
    }
  },
}));
vi.mock("@/backend/config", () => ({ default: {} }));
vi.mock("@/stores/user", () => ({ useUserStore: () => userStoreMock }));
vi.mock("@pinia/colada", () => ({ useQueryCache: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock("vue-sonner", () => ({ toast: toastMock }));
vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (key: string) => key }) }));

/** Shows the content of the sheet in the test, without the portal of the real sheet. */
const stubs = { Sheet: { template: '<div><slot /><slot name="actions" /></div>' } };

/** Mounts an open RemoveFriendSheet. */
const mountSheet = () =>
  mount(RemoveFriendSheet, {
    global: { stubs },
    props: { friendId: "friend-1", friendName: "Alex", modelValue: true },
  });

/** Fills the ID, then sends the request. */
async function submit(id: string) {
  const wrapper = mount(AddFriendSheet, { global: { stubs }, props: { modelValue: true } });
  await wrapper.get("#add-friend-id").setValue(id);
  await wrapper.findAll("button").pop()!.trigger("click");
  await flushPromises();
  return wrapper;
}

describe("RemoveFriendSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes the friend only after the confirm tap, then closes", async () => {
    accountApiMock.removeFriend.mockResolvedValue(undefined);
    const wrapper = mountSheet();

    expect(accountApiMock.removeFriend).not.toHaveBeenCalled();

    await wrapper.get('[data-test="remove-friend-confirm"]').trigger("click");
    await flushPromises();

    expect(accountApiMock.removeFriend).toHaveBeenCalledWith({ id: "friend-1" });
    expect(wrapper.emitted("update:modelValue")).toContainEqual([false]);
    expect(toastMock.success).toHaveBeenCalledWith("profile-remove-friend-success");
  });

  it("stays open with the error in the sheet when the request fails", async () => {
    accountApiMock.removeFriend.mockRejectedValue(new Error("network"));
    const wrapper = mountSheet();

    await wrapper.get('[data-test="remove-friend-confirm"]').trigger("click");
    await flushPromises();

    expect(wrapper.get('[data-test="remove-friend-error"]').text()).toContain("profile-remove-friend-error");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(toastMock.error).not.toHaveBeenCalled();
  });
});

describe("AddFriendSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a problem with the ID under the field and keeps the input", async () => {
    accountApiMock.sendFriendRequest.mockRejectedValue(
      new ResponseError(new Response("You cannot add yourself", { status: 400 }))
    );

    const wrapper = await submit("me");

    expect(wrapper.get("#add-friend-id-error").text()).toBe("profile-add-friend-self");
    expect((wrapper.get("#add-friend-id").element as HTMLInputElement).value).toBe("me");
    expect(wrapper.find('[data-test="add-friend-error"]').exists()).toBe(false);
  });

  it("shows another failure in a notice and removes the error when the ID changes", async () => {
    accountApiMock.sendFriendRequest.mockRejectedValue(new Error("network"));

    const wrapper = await submit("friend-1");

    expect(wrapper.get('[data-test="add-friend-error"]').text()).toContain("profile-add-friend-error");

    await wrapper.get("#add-friend-id").setValue("friend-2");

    expect(wrapper.find('[data-test="add-friend-error"]').exists()).toBe(false);
  });

  it("closes and clears the input after a sent request", async () => {
    accountApiMock.sendFriendRequest.mockResolvedValue(undefined);

    const wrapper = await submit("friend-1");

    expect(wrapper.emitted("update:modelValue")).toContainEqual([false]);
    expect((wrapper.get("#add-friend-id").element as HTMLInputElement).value).toBe("");
    expect(toastMock.success).toHaveBeenCalledWith("profile-add-friend-success");
  });
});
