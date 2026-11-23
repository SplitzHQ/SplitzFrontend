import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref, shallowRef } from "vue";

import GroupDetailPage from "../GroupDetailPage.vue";

/** The query state exposed to the page during a load or refresh. */
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
  return { asyncStatus: shallowRef("idle"), state: ref(PENDING) };
}

const requests: Record<string, ReturnType<typeof makeRequest>> = vi.hoisted(() => ({}));
const invalidateQueries = vi.hoisted(() => vi.fn<() => Promise<void>>());

enableAutoUnmount(afterEach);

vi.mock("@pinia/colada", () => ({
  useQuery: ({ key }: { key: () => string[] }) => requests[key()[0] ?? ""],
  useQueryCache: () => ({ invalidateQueries }),
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
function mountPage(attachTo?: HTMLElement) {
  return mount(GroupDetailPage, {
    attachTo,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        BalanceCard: true,
        GroupSettingsSheet: true,
        HeaderMobileSecondary: true,
        InviteFriendsSheet: true,
        InvoiceList: true,
        Layout: { template: "<div><slot name='header' /><slot /></div>" },
        SSegmentControl: { template: "<div data-test='tabs' />" },
        TransactionList: { template: "<div data-test='transactions' />" },
      },
    },
  });
}

describe("GroupDetailPage load states", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    invalidateQueries.mockReset().mockResolvedValue(undefined);
    requests.getGroup = makeRequest();
    requests.getGroupTransactions = makeRequest();
    requests.getGroupInvoices = makeRequest();
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

  it("retries only the current group's failed queries that have no cached data", async () => {
    setStates(FAILED, FAILED, { data: SUCCESS_LIST.data, status: "error" });
    const wrapper = mountPage();

    await wrapper.get(`${LOAD_ERROR} button`).trigger("click");

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenCalledWith({ exact: true, key: ["getGroup", "group-1"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ exact: true, key: ["getGroupTransactions", "group-1"] });
  });

  it("announces another failure and makes Retry available again", async () => {
    setStates(SUCCESS_GROUP, SUCCESS_LIST, FAILED);
    const wrapper = mountPage();
    const status = wrapper.get('[role="status"]');
    const retryButton = wrapper.get(`${LOAD_ERROR} button`);
    const request = requests.getGroupInvoices;
    let finishRetry!: () => void;
    const retry = new Promise<void>((resolve) => {
      finishRetry = resolve;
    });
    invalidateQueries.mockImplementationOnce(() => {
      request.asyncStatus.value = "loading";
      return retry;
    });

    expect(status.text()).toBe("");
    await retryButton.trigger("click");

    expect(retryButton.attributes("aria-busy")).toBe("true");
    expect(status.text()).toBe("group-detail-status-loading");

    request.asyncStatus.value = "idle";
    finishRetry();
    await flushPromises();

    expect(wrapper.get(LOAD_ERROR).text()).toContain("group-detail-error-invoices");
    expect(retryButton.attributes("aria-busy")).toBeUndefined();
    expect(status.text()).toBe("group-detail-error-invoices");
  });

  it("restores focus to the recovered content after a successful retry", async () => {
    setStates(FAILED, SUCCESS_LIST, SUCCESS_LIST);
    const wrapper = mountPage(document.body);
    const retryButton = wrapper.get<HTMLButtonElement>(`${LOAD_ERROR} button`);
    invalidateQueries.mockImplementationOnce(() => {
      requests.getGroup.state.value = SUCCESS_GROUP;
      return Promise.resolve();
    });

    retryButton.element.focus();
    expect(document.activeElement).toBe(retryButton.element);
    await retryButton.trigger("click");
    await flushPromises();

    expect(wrapper.find(LOAD_ERROR).exists()).toBe(false);
    expect(wrapper.get('[role="status"]').text()).toBe("group-detail-status-loaded");
    const focused = document.activeElement;
    expect(focused).not.toBe(document.body);
    expect(focused?.contains(wrapper.get('[data-test="transactions"]').element)).toBe(true);
  });

  it("keeps the old data and shows no notice when a refresh fails", () => {
    setStates({ data: SUCCESS_GROUP.data, status: "error" }, { data: [], status: "error" }, SUCCESS_LIST);
    const wrapper = mountPage();

    expect(wrapper.find(LOAD_ERROR).exists()).toBe(false);
    expect(wrapper.find("balance-card-stub").exists()).toBe(true);
    expect(wrapper.find('[data-test="transactions"]').exists()).toBe(true);
  });
});
