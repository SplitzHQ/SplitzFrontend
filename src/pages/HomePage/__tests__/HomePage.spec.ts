import { mount, RouterLinkStub } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import HomePage from "../HomePage.vue";

const groupsState = ref<{ data: unknown[] | undefined; status: string }>({ data: [], status: "success" });
const groupsAsyncStatus = ref("idle");
const refetchGroups = vi.fn(() => Promise.resolve());

const NEW_USER_TITLE = "home-empty-state-title";
const NO_RESULTS_CLEAR = '[data-testid="home-no-results-clear"]';

vi.mock("@pinia/colada", () => ({
  useQuery: () => ({ asyncStatus: groupsAsyncStatus, refetch: refetchGroups, state: groupsState }),
}));

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
function makeGroup(name: string) {
  return { balances: [], groupId: name, lastActivityTime: new Date(0), members: [], name, photo: null };
}

/** Mounts the page without the header parts, which need the backend. Each slot of Layout renders. */
function mountPage() {
  return mount(HomePage, {
    global: {
      stubs: {
        AvatarMenu: true,
        BrandOpening: true,
        BrandTapLogo: true,
        Layout: { template: "<div><slot name='header' /><slot /></div>" },
        NotificationBell: true,
        RouterLink: RouterLinkStub,
      },
    },
  });
}

describe("HomePage search states", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("shows the no-result state, not the new-user state, when the search finds no group", async () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const wrapper = mountPage();

    await wrapper.get("input").setValue("  zzz ");

    expect(wrapper.get("h2").text()).toBe("home-no-results-title zzz");
    expect(wrapper.get('[role="status"]').text()).toBe("home-no-results-title zzz");
    expect(wrapper.text()).not.toContain(NEW_USER_TITLE);
    expect(wrapper.find('[data-testid="home-create-group"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain("home-all-groups");
  });

  it("shows the group and no no-result state when the search finds a group", async () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const wrapper = mountPage();

    await wrapper.get("input").setValue("PARIS");

    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
    expect(wrapper.text()).toContain("home-all-groups");
  });

  it("treats a keyword of only spaces as no search", async () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const wrapper = mountPage();

    await wrapper.get("input").setValue("   ");

    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
  });

  it("returns to the list when the user taps the clear button of the no-result state", async () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const wrapper = mountPage();

    await wrapper.get("input").setValue("zzz");
    await wrapper.get(NO_RESULTS_CLEAR).trigger("click");

    expect(wrapper.get("input").element.value).toBe("");
    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
  });

  it("shows the new-user state when the user has no groups, also during a search", async () => {
    groupsState.value = { data: [], status: "success" };
    const wrapper = mountPage();

    expect(wrapper.text()).toContain(NEW_USER_TITLE);

    await wrapper.get("input").setValue("zzz");

    expect(wrapper.text()).toContain(NEW_USER_TITLE);
    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
  });
});
