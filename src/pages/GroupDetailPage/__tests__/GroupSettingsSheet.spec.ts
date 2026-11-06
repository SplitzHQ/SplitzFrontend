import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GroupApi } from "@/backend";
import { ResponseError } from "@/backend/openapi";

import GroupSettingsSheet from "../GroupSettingsSheet.vue";

const mocks = vi.hoisted(() => ({
  api: {
    archiveGroup: vi.fn<GroupApi["archiveGroup"]>(),
    unarchiveGroup: vi.fn<GroupApi["unarchiveGroup"]>(),
  },
  invalidateQueries: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/backend", async () => {
  const { ResponseError: RealResponseError } = await import("@/backend/openapi");
  return {
    GroupApi: class {
      archiveGroup = mocks.api.archiveGroup;
      unarchiveGroup = mocks.api.unarchiveGroup;
    },
    ResponseError: RealResponseError,
  };
});
vi.mock("@/backend/config", () => ({ default: {} }));
vi.mock("@pinia/colada", () => ({ useQueryCache: () => ({ invalidateQueries: mocks.invalidateQueries }) }));
vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("vue-sonner", () => ({ toast: mocks.toast }));
vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (key: string) => key }) }));

function mountSheet(isArchived: boolean) {
  return shallowMount(GroupSettingsSheet, {
    global: { stubs: { Sheet: { template: "<div><slot /></div>" } } },
    props: { groupId: "group-1", isArchived, modelValue: true },
  });
}

describe("GroupSettingsSheet archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.invalidateQueries.mockResolvedValue(undefined);
  });

  it("archives the group, refreshes group data and closes", async () => {
    mocks.api.archiveGroup.mockResolvedValue(undefined);
    const wrapper = mountSheet(false);

    expect(wrapper.get('[data-test="group-archive"]').text()).toContain("group-settings-archive");
    await wrapper.get('[data-test="group-archive"]').trigger("click");
    await flushPromises();

    expect(mocks.api.archiveGroup).toHaveBeenCalledWith({ groupId: "group-1" });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ key: ["getGroup", "group-1"] });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ key: ["getGroups"] });
    expect(mocks.toast.success).toHaveBeenCalledWith("group-settings-archive-success");
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });

  it("explains that unpaid expenses block archiving", async () => {
    mocks.api.archiveGroup.mockRejectedValue(
      new ResponseError(new Response("Only groups with no unpaid expenses can be archived", { status: 400 }))
    );
    const wrapper = mountSheet(false);

    await wrapper.get('[data-test="group-archive"]').trigger("click");
    await flushPromises();

    expect(mocks.toast.error).toHaveBeenCalledWith("group-settings-archive-unpaid");
    expect(mocks.invalidateQueries).not.toHaveBeenCalled();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("unarchives an archived group", async () => {
    mocks.api.unarchiveGroup.mockResolvedValue(undefined);
    const wrapper = mountSheet(true);

    expect(wrapper.get('[data-test="group-archive"]').text()).toContain("group-settings-unarchive");
    await wrapper.get('[data-test="group-archive"]').trigger("click");
    await flushPromises();

    expect(mocks.api.unarchiveGroup).toHaveBeenCalledWith({ groupId: "group-1" });
    expect(mocks.api.archiveGroup).not.toHaveBeenCalled();
    expect(mocks.toast.success).toHaveBeenCalledWith("group-settings-unarchive-success");
  });
});
