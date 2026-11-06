import { flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import HomePage from "../HomePage.vue";

const groupsState = ref<{ data: unknown[] | undefined; status: string }>({ data: [], status: "success" });
const groupsAsyncStatus = ref("idle");
const refetchGroups = vi.fn(() => Promise.resolve());

const NEW_USER_TITLE = "home-empty-state-title";
const NO_RESULTS_CLEAR = '[data-testid="home-no-results-clear"]';
const LOAD_ERROR = '[data-testid="home-load-error"]';
const SKELETON = '[data-testid="home-groups-skeleton"]';
const SORT_BUTTON = '[data-testid="home-sort"]';
const TOTAL_BALANCE = '[data-testid="home-total-balance"]';

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
  useStatusBarDim: vi.fn(),
  useStatusBarTopColor: vi.fn(),
}));

/** Makes one group that has the fields the home page reads. */
function makeGroup(name: string, hoursAgo = 0) {
  return {
    balances: [] as { balance: string; currency: string; user: { id: string } }[],
    groupId: name,
    lastActivityTime: new Date(Date.UTC(2026, 0, 1) - hoursAgo * 3_600_000),
    members: [],
    name,
    photo: null,
    transactionCount: 1,
  };
}

/** Makes a balance row of the user "me". */
const myBalance = (amount: string, currency: string) => ({ balance: amount, currency, user: { id: "me" } });

/** Returns the names of the group rows, in the order of the page. */
function rowNames(wrapper: ReturnType<typeof mountPage>, names: string[]) {
  return wrapper
    .findAll("li")
    .map((row) => names.find((name) => row.text().includes(name)))
    .filter(Boolean);
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

describe("HomePage rows", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("reloads the total balance when the groups refetch, and not on the first answer", async () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const fetchUserInfo = vi.spyOn(useUserStore(), "fetchUserInfo").mockResolvedValue(undefined);
    mountPage();

    expect(fetchUserInfo).not.toHaveBeenCalled();

    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    await nextTick();

    expect(fetchUserInfo).toHaveBeenCalledOnce();
  });

  it("makes each group row a link to the group", () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const wrapper = mountPage();

    const row = wrapper.findAllComponents(RouterLinkStub).find((link) => link.text().includes("Paris trip"));

    expect(row?.props("to")).toEqual({ name: "groupDetail", params: { groupId: "Paris trip" } });
  });

  it("makes the Create group row a link that keeps the place to return to", async () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const wrapper = mountPage();
    const snapshot = vi.spyOn(useRouterHistoryStore(), "takeSnapshot").mockImplementation(() => undefined);

    const row = wrapper.get('[data-testid="home-create-group"]');
    await row.trigger("click");

    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links[links.length - 1]?.props("to")).toEqual({ name: "createGroup" });
    expect(snapshot).toHaveBeenCalledOnce();
  });

  it("puts the owed and the owing amounts of a group on two lines, each with its own label", () => {
    const userStore = useUserStore();
    userStore.user = { id: "me" } as never;
    groupsState.value = {
      data: [
        {
          ...makeGroup("Ski trip"),
          balances: [myBalance("1250", "USD"), myBalance("-34000", "JPY"), myBalance("-12", "EUR")],
        },
      ],
      status: "success",
    };
    const wrapper = mountPage();

    const row = wrapper.findAllComponents(RouterLinkStub).find((link) => link.text().includes("Ski trip"))!;
    const lines = row.findAll("p").filter((line) => /home-you-(lent|owe)/.test(line.text()));

    expect(lines.map((line) => line.findAll("span")[0]?.text())).toEqual(["home-you-lent", "home-you-owe"]);
    expect(lines[1]?.findAll(".text-base-text-error")).toHaveLength(2);
  });

  it("says No expenses for a group with no expenses, and All settled up for a 0.00 balance", () => {
    useUserStore().user = { id: "me" } as never;
    groupsState.value = {
      data: [
        { ...makeGroup("New flat"), transactionCount: 0 },
        { ...makeGroup("Book club", 1), balances: [myBalance("0.00", "USD")] },
      ],
      status: "success",
    };
    const wrapper = mountPage();

    const rows = wrapper.findAllComponents(RouterLinkStub);
    expect(rows.find((row) => row.text().includes("New flat"))?.text()).toContain("home-no-expenses");
    expect(rows.find((row) => row.text().includes("Book club"))?.text()).toContain("home-all-settled-up");
  });

  it("shows the total in the most used currency with a sign, and opens the details only for two or more totals", () => {
    const userStore = useUserStore();
    userStore.user = {
      balances: [
        { balance: "-900", currency: "JPY" },
        { balance: "20", currency: "EUR" },
      ],
      id: "me",
    } as never;
    groupsState.value = {
      data: [
        { ...makeGroup("Lisbon"), balances: [myBalance("20", "EUR")] },
        { ...makeGroup("Tokyo", 1), balances: [myBalance("-900", "JPY")] },
      ],
      status: "success",
    };
    const wrapper = mountPage();

    const total = wrapper.get(TOTAL_BALANCE);
    expect(total.element.tagName).toBe("BUTTON");
    expect(total.get(".text-base-text-success").text()).toMatch(/^\+/);

    userStore.user = { balances: [{ balance: "20", currency: "EUR" }], id: "me" } as never;
    return nextTick().then(() => expect(wrapper.get(TOTAL_BALANCE).element.tagName).toBe("DIV"));
  });

  it("sorts the rows by the pick of the sort button", async () => {
    groupsState.value = {
      data: [makeGroup("Bali", 2), makeGroup("Aaron", 5), makeGroup("Camping", 1)],
      status: "success",
    };
    const wrapper = mountPage();
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

  it("uses the sort that this device keeps, and ignores a value that is not a sort", () => {
    groupsState.value = { data: [makeGroup("Bali", 2), makeGroup("Aaron", 5)], status: "success" };
    localStorage.setItem("home-group-sort", "name");
    expect(rowNames(mountPage(), ["Aaron", "Bali"])).toEqual(["Aaron", "Bali"]);

    localStorage.setItem("home-group-sort", "owed");
    expect(rowNames(mountPage(), ["Aaron", "Bali"])).toEqual(["Bali", "Aaron"]);
  });
});

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
    expect(wrapper.find(SORT_BUTTON).exists()).toBe(false);
  });

  it("shows the group and no no-result state when the search finds a group", async () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "success" };
    const wrapper = mountPage();

    await wrapper.get("input").setValue("PARIS");

    expect(wrapper.find(NO_RESULTS_CLEAR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
    expect(wrapper.find(SORT_BUTTON).exists()).toBe(true);
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

describe("HomePage load states", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    groupsAsyncStatus.value = "idle";
    refetchGroups.mockClear();
  });

  it("shows a skeleton that a screen reader skips, and reads the loading text, during the first load", async () => {
    groupsState.value = { data: undefined, status: "pending" };
    const wrapper = mountPage();
    await nextTick();

    expect(wrapper.get(SKELETON).attributes("aria-hidden")).toBe("true");
    expect(wrapper.text()).toContain("home-status-loading");
  });

  it("shows a notice with a retry button when the first load fails", async () => {
    groupsState.value = { data: undefined, status: "error" };
    const wrapper = mountPage();

    const notice = wrapper.get(LOAD_ERROR);

    expect(notice.attributes("role")).toBe("alert");
    expect(notice.text()).toContain("home-error-loading-groups");
    expect(wrapper.find(SKELETON).exists()).toBe(false);

    await notice.get("button").trigger("click");

    expect(refetchGroups).toHaveBeenCalledOnce();
  });

  it("keeps the notice and shows the loading button during a retry", async () => {
    groupsState.value = { data: undefined, status: "error" };
    const wrapper = mountPage();

    groupsAsyncStatus.value = "loading";
    await nextTick();

    expect(wrapper.get(`${LOAD_ERROR} button`).attributes("aria-busy")).toBe("true");
    expect(wrapper.text()).toContain("home-status-loading");
  });

  it("keeps the old list and shows no notice when a refresh fails", () => {
    groupsState.value = { data: [makeGroup("Paris trip")], status: "error" };
    const wrapper = mountPage();

    expect(wrapper.find(LOAD_ERROR).exists()).toBe(false);
    expect(wrapper.text()).toContain("Paris trip");
  });
});
