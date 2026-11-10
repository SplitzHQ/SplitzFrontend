import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref, shallowRef } from "vue";

import GroupDetailPage from "../GroupDetailPage.vue";

interface QueryState {
  data: unknown;
  status: string;
}

const LOAD_ERROR = '[data-test="group-detail-load-error"]';
const BALANCE_SKELETON = '[data-test="balance-card-skeleton"]';
const LIST_SKELETON = '[data-test="transaction-list-skeleton"]';

const SUCCESS_GROUP: QueryState = { data: { balanceSummaries: [], members: [], name: "Paris" }, status: "success" };
const SUCCESS_LIST: QueryState = { data: [], status: "success" };
const FAILED: QueryState = { data: undefined, status: "error" };
const PENDING: QueryState = { data: undefined, status: "pending" };

/** Makes the parts of a query result that the page reads. */
function makeRequest() {
  return { asyncStatus: shallowRef("idle"), refetch: vi.fn(() => Promise.resolve()), state: ref(PENDING) };
}

const requests: Record<string, ReturnType<typeof makeRequest>> = vi.hoisted(() => ({}));

vi.mock("@pinia/colada", () => ({
  useQuery: ({ key }: { key: () => string[] }) => requests[key()[0] ?? ""],
  useQueryCache: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("fluent-vue", () => ({
  useFluent: () => ({ $t: (key: string) => key }),
}));

vi.mock(import("vue-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useRoute: () => ({ params: { groupId: "group-1" } }) as never,
  useRouter: () => ({ push: vi.fn() }) as never,
}));

/** Sets the state of the three requests. */
function setStates(group: QueryState, transactions: QueryState, invoices: QueryState) {
  requests.getGroup.state.value = group;
  requests.getGroupTransactions.state.value = transactions;
  requests.getGroupInvoices.state.value = invoices;
}

/** Mounts the page without the parts that need the backend. Each slot of Layout renders. */
function mountPage() {
  return mount(GroupDetailPage, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        BalanceCard: true,
        GroupSettingsSheet: true,
        HeaderMobileSecondary: true,
        InviteFriendsSheet: true,
        Layout: { template: "<div><slot name='header' /><slot /></div>" },
        RoundBar: true,
        SSegmentControl: { template: "<div data-test='tabs' />" },
        StartSettleUpSheet: true,
        TransactionList: { template: "<div data-test='transactions' />" },
      },
    },
  });
}

describe("GroupDetailPage load states", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    requests.getGroup = makeRequest();
    requests.getGroupTransactions = makeRequest();
    requests.getGroupInvoices = makeRequest();
    requests.getGroupRounds = makeRequest();
  });

  it("shows the skeletons and the real tabs during the first load", async () => {
    setStates(PENDING, PENDING, PENDING);
    const wrapper = mountPage();
    await nextTick();

    expect(wrapper.get(BALANCE_SKELETON).attributes("aria-hidden")).toBe("true");
    expect(wrapper.get(LIST_SKELETON).attributes("aria-hidden")).toBe("true");
    expect(wrapper.find('[data-test="tabs"]').exists()).toBe(true);
    expect(wrapper.get('[role="status"]').text()).toBe("group-detail-status-loading");
  });

  it("shows only the notice when the group request fails", () => {
    setStates(FAILED, SUCCESS_LIST, SUCCESS_LIST);
    const wrapper = mountPage();

    const notice = wrapper.get(LOAD_ERROR);

    expect(notice.attributes("role")).toBe("alert");
    expect(notice.text()).toContain("group-detail-error");
    expect(wrapper.find('[data-test="tabs"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="transactions"]').exists()).toBe(false);
  });

  it.each([
    ["group-detail-error-transactions", FAILED, SUCCESS_LIST],
    ["group-detail-error-invoices", SUCCESS_LIST, FAILED],
    ["group-detail-error-lists", FAILED, FAILED],
  ])("keeps the balance and the tabs and shows %s when a list fails", (message, transactions, invoices) => {
    setStates(SUCCESS_GROUP, transactions, invoices);
    const wrapper = mountPage();

    expect(wrapper.get(LOAD_ERROR).text()).toContain(message);
    expect(wrapper.find('[data-test="tabs"]').exists()).toBe(true);
    expect(wrapper.find("balance-card-stub").exists()).toBe(true);
  });

  it("requests again only what failed", async () => {
    setStates(SUCCESS_GROUP, FAILED, SUCCESS_LIST);
    const wrapper = mountPage();

    await wrapper.get(`${LOAD_ERROR} button`).trigger("click");

    expect(requests.getGroupTransactions.refetch).toHaveBeenCalledOnce();
    expect(requests.getGroup.refetch).not.toHaveBeenCalled();
    expect(requests.getGroupInvoices.refetch).not.toHaveBeenCalled();
  });

  it("keeps the notice and shows the loading button during a retry", async () => {
    setStates(FAILED, SUCCESS_LIST, SUCCESS_LIST);
    const wrapper = mountPage();

    requests.getGroup.asyncStatus.value = "loading";
    await nextTick();

    expect(wrapper.get(`${LOAD_ERROR} button`).attributes("aria-busy")).toBe("true");
    expect(wrapper.get('[role="status"]').text()).toBe("group-detail-status-loading");
  });

  it("keeps the old data and shows no notice when a refresh fails", () => {
    setStates({ data: SUCCESS_GROUP.data, status: "error" }, { data: [], status: "error" }, SUCCESS_LIST);
    const wrapper = mountPage();

    expect(wrapper.find(LOAD_ERROR).exists()).toBe(false);
    expect(wrapper.find("balance-card-stub").exists()).toBe(true);
    expect(wrapper.find('[data-test="transactions"]').exists()).toBe(true);
  });
});

describe("GroupDetailPage settle-up round", () => {
  const ME = { id: "me", userName: "You" };
  const BEN = { id: "ben", userName: "Ben" };
  const OPEN_ROUND = { createTime: new Date(2026, 10, 9), invoiceId: "round-1", status: "Open" };

  beforeEach(() => {
    setActivePinia(createPinia());
    requests.getGroup = makeRequest();
    requests.getGroupTransactions = makeRequest();
    requests.getGroupInvoices = makeRequest();
    requests.getGroupRounds = makeRequest();
  });

  it("shows no round line and keeps the Settle up button without a running round", () => {
    setStates(SUCCESS_GROUP, SUCCESS_LIST, SUCCESS_LIST);
    const wrapper = mountPage();

    expect(wrapper.find("round-bar-stub").exists()).toBe(false);
    expect(wrapper.getComponent({ name: "BalanceCard" }).props("canSettle")).toBe(true);
  });

  it("shows the round line and hides the Settle up button while a round runs", () => {
    setStates(SUCCESS_GROUP, SUCCESS_LIST, { data: [OPEN_ROUND], status: "success" });
    requests.getGroupRounds.state.value = {
      data: [
        {
          ...OPEN_ROUND,
          currency: "USD",
          debts: [{ amount: "30.00", fromUser: BEN, invoiceId: "round-1", paid: "0", remaining: "30.00", toUser: ME }],
          settlements: [],
        },
      ],
      status: "success",
    };
    const wrapper = mountPage();

    expect(wrapper.find("round-bar-stub").exists()).toBe(true);
    expect(wrapper.getComponent({ name: "BalanceCard" }).props("canSettle")).toBe(false);
  });
});
