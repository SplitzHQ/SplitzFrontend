import { PiniaColada, useQueryCache } from "@pinia/colada";
import { enableAutoUnmount, flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { createPinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import { GroupApi, type GroupDto } from "@/backend";

import HomePage from "../HomePage.vue";

const getGroups = vi.spyOn(GroupApi.prototype, "getGroups");

beforeEach(() => {
  getGroups.mockReset().mockResolvedValue([makeGroup("Paris trip")]);
});
enableAutoUnmount(afterEach);

const NEW_USER_TITLE = "home-empty-state-title";
const NO_RESULTS_CLEAR = '[data-testid="home-no-results-clear"]';
const LOAD_ERROR = '[data-testid="home-load-error"]';
const SKELETON = '[data-testid="home-groups-skeleton"]';

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: { keyword?: string }) => (args?.keyword ? `${key} ${args.keyword}` : key),
  }),
}));

vi.mock(import("vue-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useRouter: () => ({ push: vi.fn() }) as never,
}));

vi.mock("@/libs/status-bar-color", () => ({
  useStatusBarTopColor: vi.fn(),
}));

/** Makes one group that has the fields the home page reads. */
function makeGroup(name: string): GroupDto {
  return {
    balances: [],
    groupId: name,
    lastActivityTime: new Date(0),
    members: [],
    membersIdHash: "",
    name,
    photo: null,
    transactionCount: 0,
  };
}

/** Mounts the page without the header parts, which need the backend. Each slot of Layout renders. */
function mountPage(pinia = createPinia()) {
  return mount(HomePage, {
    global: {
      plugins: [pinia, PiniaColada],
      stubs: {
        AvatarMenu: true,
        BrandOpeningOverlay: true,
        BrandTapWordmark: true,
        Layout: { template: "<div><slot name='header' /><slot /></div>" },
        NotificationBell: true,
        RouterLink: RouterLinkStub,
      },
    },
  });
}

describe("HomePage search states", () => {
  it("shows the no-result state, not the new-user state, when the search finds no group", async () => {
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get("input").setValue("  zzz ");

    expect(wrapper.get("h2").text()).toBe("home-no-results-title zzz");
    expect(wrapper.get('[role="status"]').text()).toBe("home-no-results-title zzz");
    expect(wrapper.text()).not.toContain(NEW_USER_TITLE);
    expect(wrapper.find('[data-testid="home-create-group"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain("home-all-groups");
  });

  it("shows the group and no no-result state when the search finds a group", async () => {
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get("input").setValue("PARIS");

    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
    expect(wrapper.text()).toContain("home-all-groups");
  });

  it("treats a keyword of only spaces as no search", async () => {
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get("input").setValue("   ");

    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
  });

  it("returns to the list when the user taps the clear button of the no-result state", async () => {
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get("input").setValue("zzz");
    await wrapper.get(NO_RESULTS_CLEAR).trigger("click");

    expect(wrapper.get("input").element.value).toBe("");
    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
  });

  it("shows the new-user state when the user has no groups, also during a search", async () => {
    getGroups.mockResolvedValueOnce([]);
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain(NEW_USER_TITLE);

    await wrapper.get("input").setValue("zzz");

    expect(wrapper.text()).toContain(NEW_USER_TITLE);
    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
  });
});

describe("HomePage load states", () => {
  it("shows a skeleton that a screen reader skips, and reads the loading text, during the first load", async () => {
    let resolveRequest!: (groups: GroupDto[]) => void;
    const request = new Promise<GroupDto[]>((resolve) => {
      resolveRequest = resolve;
    });
    getGroups.mockReturnValueOnce(request);
    const wrapper = mountPage();
    await nextTick();

    expect(wrapper.get(SKELETON).attributes("aria-hidden")).toBe("true");
    expect(wrapper.text()).toContain("home-status-loading");

    resolveRequest([]);
    await flushPromises();
  });

  it("shows a retry notice when the first load fails and shows groups when the retry succeeds", async () => {
    getGroups.mockRejectedValueOnce(new Error("Groups unavailable"));
    const wrapper = mountPage();
    await flushPromises();

    const notice = wrapper.get(LOAD_ERROR);

    expect(notice.attributes("role")).toBe("alert");
    expect(notice.text()).toContain("home-error-loading-groups");
    expect(wrapper.find(SKELETON).exists()).toBe(false);

    await notice.get("button").trigger("click");
    await flushPromises();

    expect(wrapper.find(LOAD_ERROR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
  });

  it("keeps the notice during a retry and restores the button if the retry fails", async () => {
    let rejectRetry!: (error: Error) => void;
    const retryRequest = new Promise<GroupDto[]>((_, reject) => {
      rejectRetry = reject;
    });
    getGroups.mockRejectedValueOnce(new Error("Groups unavailable")).mockReturnValueOnce(retryRequest);
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get(`${LOAD_ERROR} button`).trigger("click");

    expect(wrapper.get(`${LOAD_ERROR} button`).attributes("aria-busy")).toBe("true");
    expect(wrapper.text()).toContain("home-status-loading");

    rejectRetry(new Error("Groups still unavailable"));
    await flushPromises();

    expect(wrapper.get(`${LOAD_ERROR} button`).attributes("aria-busy")).toBeUndefined();
    expect(wrapper.findAll('[role="status"]').map((status) => status.text())).toContain("home-error-loading-groups");
  });

  it("keeps the old list and shows no notice when a refresh fails", async () => {
    const pinia = createPinia();
    const wrapper = mountPage(pinia);
    await flushPromises();
    getGroups.mockRejectedValueOnce(new Error("Groups unavailable"));

    await useQueryCache(pinia)
      .invalidateQueries({ key: ["getGroups"] })
      .catch(() => {});
    await flushPromises();

    expect(wrapper.find(LOAD_ERROR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
  });
});
