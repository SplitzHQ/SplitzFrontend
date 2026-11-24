import { PiniaColada, useQueryCache } from "@pinia/colada";
import { enableAutoUnmount, flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { createPinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import { GroupApi, type GroupBalanceDto, type GroupDto } from "@/backend";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import HomePage from "../HomePage.vue";

const getGroups = vi.spyOn(GroupApi.prototype, "getGroups");

beforeEach(() => {
  localStorage.clear();
  getGroups.mockReset().mockResolvedValue([makeGroup("Paris trip")]);
});
enableAutoUnmount(afterEach);

const NEW_USER_TITLE = "home-empty-state-title";
const NO_RESULTS_CLEAR = '[data-testid="home-no-results-clear"]';
const LOAD_ERROR = '[data-testid="home-load-error"]';
const SKELETON = '[data-testid="home-groups-skeleton"]';
const SORT_BUTTON = '[data-testid="home-sort"]';
const TOTAL_BALANCE = '[data-testid="home-total-balance"]';

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
  useStatusBarDim: vi.fn(),
  useStatusBarTopColor: vi.fn(),
}));

/** Makes one group that has the fields the home page reads. */
function makeGroup(name: string, hoursAgo = 0): GroupDto {
  return {
    balances: [],
    groupId: name,
    lastActivityTime: new Date(Date.UTC(2026, 0, 1) - hoursAgo * 3_600_000),
    members: [],
    membersIdHash: "",
    name,
    photo: null,
    transactionCount: 1,
  };
}

/** Makes a balance row of the user "me". */
const myBalance = (groupId: string, balance: string, currency: string): GroupBalanceDto => ({
  balance,
  currency,
  groupId,
  user: { id: "me", userName: "Me" },
});

/** Returns the names of the group rows, in the order of the page. */
function rowNames(wrapper: ReturnType<typeof mountPage>, names: string[]) {
  return wrapper
    .findAll("li")
    .map((row) => names.find((name) => row.text().includes(name)))
    .filter(Boolean);
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

describe("HomePage rows", () => {
  it("reloads the total balance when the groups refetch, and not on the first answer", async () => {
    const pinia = createPinia();
    const fetchUserInfo = vi.spyOn(useUserStore(pinia), "fetchUserInfo").mockResolvedValue(undefined);
    mountPage(pinia);
    await flushPromises();

    expect(fetchUserInfo).not.toHaveBeenCalled();

    getGroups.mockResolvedValueOnce([makeGroup("Updated trip")]);
    await useQueryCache(pinia).invalidateQueries({ key: ["getGroups"] });
    await flushPromises();

    expect(fetchUserInfo).toHaveBeenCalledOnce();
  });

  it("makes each group row a link to the group", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const row = wrapper.findAllComponents(RouterLinkStub).find((link) => link.text().includes("Paris trip"));

    expect(row?.props("to")).toEqual({ name: "groupDetail", params: { groupId: "Paris trip" } });
  });

  it("makes the Create group row a link that keeps the place to return to", async () => {
    const wrapper = mountPage();
    await flushPromises();
    const snapshot = vi.spyOn(useRouterHistoryStore(), "takeSnapshot").mockImplementation(() => undefined);

    const row = wrapper.get('[data-testid="home-create-group"]');
    await row.trigger("click");

    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links[links.length - 1]?.props("to")).toEqual({ name: "createGroup" });
    expect(snapshot).toHaveBeenCalledOnce();
  });

  it("puts the owed and the owing amounts of a group on two lines, each with its own label", async () => {
    const pinia = createPinia();
    const userStore = useUserStore(pinia);
    userStore.user = { id: "me" } as never;
    getGroups.mockResolvedValueOnce([
      {
        ...makeGroup("Ski trip"),
        balances: [
          myBalance("Ski trip", "1250", "USD"),
          myBalance("Ski trip", "-34000", "JPY"),
          myBalance("Ski trip", "-12", "EUR"),
        ],
      },
    ]);
    const wrapper = mountPage(pinia);
    await flushPromises();

    const row = wrapper.findAllComponents(RouterLinkStub).find((link) => link.text().includes("Ski trip"))!;
    const lines = row.findAll("p").filter((line) => /home-you-(lent|owe)/.test(line.text()));

    expect(lines.map((line) => line.findAll("span")[0]?.text())).toEqual(["home-you-lent", "home-you-owe"]);
    expect(lines[1]?.findAll("number-flow-vue")).toHaveLength(2);
  });

  it("says No expenses for a group with no expenses, and All settled up for a 0.00 balance", async () => {
    const pinia = createPinia();
    useUserStore(pinia).user = { id: "me" } as never;
    getGroups.mockResolvedValueOnce([
      { ...makeGroup("New flat"), transactionCount: 0 },
      { ...makeGroup("Book club", 1), balances: [myBalance("Book club", "0.00", "USD")] },
    ]);
    const wrapper = mountPage(pinia);
    await flushPromises();

    const rows = wrapper.findAllComponents(RouterLinkStub);
    expect(rows.find((row) => row.text().includes("New flat"))?.text()).toContain("home-no-expenses");
    expect(rows.find((row) => row.text().includes("Book club"))?.text()).toContain("home-all-settled-up");
  });

  it("shows the total in the most used currency with a sign, and opens the details only for two or more totals", async () => {
    const pinia = createPinia();
    const userStore = useUserStore(pinia);
    userStore.user = {
      balances: [
        { balance: "-900", currency: "JPY" },
        { balance: "20", currency: "EUR" },
      ],
      id: "me",
    } as never;
    getGroups.mockResolvedValueOnce([
      { ...makeGroup("Lisbon"), balances: [myBalance("Lisbon", "20", "EUR")] },
      { ...makeGroup("Tokyo", 1), balances: [myBalance("Tokyo", "-900", "JPY")] },
    ]);
    const wrapper = mountPage(pinia);
    await flushPromises();

    const total = wrapper.get(TOTAL_BALANCE);
    expect(total.element.tagName).toBe("BUTTON");
    expect(total.text()).toContain("+");

    userStore.user = { balances: [{ balance: "20", currency: "EUR" }], id: "me" } as never;
    await nextTick();
    expect(wrapper.get(TOTAL_BALANCE).element.tagName).toBe("DIV");
  });

  it("sorts the rows by the pick of the sort button", async () => {
    getGroups.mockResolvedValueOnce([makeGroup("Bali", 2), makeGroup("Aaron", 5), makeGroup("Camping", 1)]);
    const wrapper = mountPage();
    await flushPromises();
    const names = ["Aaron", "Bali", "Camping"];

    expect(rowNames(wrapper, names)).toEqual(["Camping", "Bali", "Aaron"]);

    await wrapper.get(SORT_BUTTON).trigger("click");
    await flushPromises();
    // The sheet renders in a portal on the body, so the option is outside the wrapper.
    document.querySelector<HTMLButtonElement>('[data-sort="name"]')!.click();
    await flushPromises();

    expect(rowNames(wrapper, names)).toEqual(["Aaron", "Bali", "Camping"]);
    expect(localStorage.getItem("home-group-sort")).toBe("name");
  });

  it.each([
    ["name", ["Aaron", "Bali"]],
    ["owed", ["Bali", "Aaron"]],
  ])("uses the stored sort %s or falls back to recent", async (storedSort, expected) => {
    getGroups.mockResolvedValueOnce([makeGroup("Bali", 2), makeGroup("Aaron", 5)]);
    localStorage.setItem("home-group-sort", storedSort);
    const wrapper = mountPage();
    await flushPromises();

    expect(rowNames(wrapper, ["Aaron", "Bali"])).toEqual(expected);
  });
});

describe("HomePage search states", () => {
  it("shows the no-result state, not the new-user state, when the search finds no group", async () => {
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get("input").setValue("  zzz ");

    expect(wrapper.get("h2").text()).toBe("home-no-results-title zzz");
    expect(wrapper.findAll('[role="status"]').map((status) => status.text())).toContain("home-no-results-title zzz");
    expect(wrapper.text()).not.toContain(NEW_USER_TITLE);
    expect(wrapper.find('[data-testid="home-create-group"]').exists()).toBe(true);
    expect(wrapper.find(SORT_BUTTON).exists()).toBe(false);
  });

  it("shows the group and no no-result state when the search finds a group", async () => {
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get("input").setValue("PARIS");

    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
    expect(wrapper.find(SORT_BUTTON).exists()).toBe(true);
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
