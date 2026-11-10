import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref, shallowRef } from "vue";

import type { InvoiceDto } from "@/backend";
import { useUserStore } from "@/stores/user";

import SettleUpRoundPage from "../SettleUpRoundPage.vue";

const ME = { id: "me", userName: "You" };
const MIA = { id: "mia", userName: "Mia" };
const BEN = { id: "ben", userName: "Ben" };

const api = vi.hoisted(() => ({
  addSettlement: vi.fn(() => Promise.resolve({})),
  confirmSettlement: vi.fn(() => Promise.resolve({})),
  deleteInvoice: vi.fn(() => Promise.resolve()),
  rejectSettlement: vi.fn(() => Promise.resolve()),
}));
const roundState = vi.hoisted(() => ({ value: null as unknown }));
const replace = vi.hoisted(() => vi.fn());

vi.mock("@/backend", async (importOriginal) => ({
  ...(await importOriginal()),
  // A normal function, because the page calls `new InvoiceApi()`. An object that a constructor returns is the result.
  InvoiceApi: vi.fn(function invoiceApi() {
    return api;
  }),
}));

vi.mock("@pinia/colada", () => ({
  useQuery: () => ({
    asyncStatus: shallowRef("idle"),
    refetch: vi.fn(),
    state: ref({ data: roundState.value, status: "success" }),
  }),
  useQueryCache: () => ({ invalidateQueries: vi.fn(() => Promise.resolve()) }),
}));

vi.mock(import("vue-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useRoute: () => ({ params: { groupId: "group", invoiceId: "round" } }) as never,
  useRouter: () => ({ replace }) as never,
}));

vi.mock("fluent-vue", () => ({
  useFluent: () => ({ $t: (key: string) => key }),
}));

/** A running round: you owe Mia, Ben marked his payment to you, and nobody confirmed a payment yet. */
function openRound(): InvoiceDto {
  return {
    createTime: new Date(2026, 10, 9),
    createdBy: ME,
    currency: "USD",
    debts: [
      { amount: "42.50", fromUser: ME, invoiceId: "round", paid: "0", remaining: "42.50", toUser: MIA },
      { amount: "30.00", fromUser: BEN, invoiceId: "round", paid: "0", remaining: "30.00", toUser: ME },
    ],
    groupId: "group",
    invoiceId: "round",
    settlements: [
      {
        amount: "30.00",
        fromUser: BEN,
        invoiceId: "round",
        invoiceSettlementId: "ben-paid",
        isConfirmed: false,
        recordedBy: BEN,
        recordedTime: new Date(2026, 10, 9),
        toUser: ME,
      },
    ],
    status: "Open",
    transactions: [],
  };
}

/** Mounts the page. The sheet stub shows its slots while it is open, so the test can press the buttons in it. */
function mountPage() {
  return mount(SettleUpRoundPage, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        HeaderMobileSecondary: true,
        Layout: { template: "<div><slot name='header' /><slot /></div>" },
        Sheet: {
          props: ["modelValue", "title"],
          template:
            "<section v-if='modelValue' data-test='sheet' :data-title='title'><slot /><slot name='actions' /></section>",
        },
        TransactionItem: true,
        Transition: false,
        i18n: { props: ["path"], template: "<span>{{ path }}</span>" },
      },
    },
  });
}

describe("SettleUpRoundPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().user = { id: ME.id } as never;
    roundState.value = openRound();
    vi.clearAllMocks();
  });

  it("marks the rest of the user's transfer as paid after the confirm step", async () => {
    const wrapper = mountPage();

    await wrapper.get('[data-test="transfer-markPaid"]').trigger("click");
    expect(wrapper.get('[data-test="sheet"]').attributes("data-title")).toBe("settle-up-mark-paid-title");
    await wrapper.get('[data-test="settle-up-mark-paid-submit"]').trigger("click");
    await flushPromises();

    expect(api.addSettlement).toHaveBeenCalledWith({
      id: "round",
      invoiceSettlementInputDto: { amount: "42.50", fromUserId: ME.id, toUserId: MIA.id },
    });
  });

  it("confirms the payment that waits for the user", async () => {
    const wrapper = mountPage();

    await wrapper.get('[data-test="transfer-confirm"]').trigger("click");
    await wrapper.get('[data-test="settle-up-confirm-submit"]').trigger("click");
    await flushPromises();

    expect(api.confirmSettlement).toHaveBeenCalledWith({ id: "round", settlementId: "ben-paid" });
    expect(api.rejectSettlement).not.toHaveBeenCalled();
  });

  it("lets the starter cancel a round with no confirmed payment, then goes back to the group", async () => {
    const wrapper = mountPage();

    await wrapper.get('[data-test="settle-up-cancel"]').trigger("click");
    await wrapper.get('[data-test="settle-up-cancel-submit"]').trigger("click");
    await flushPromises();

    expect(api.deleteInvoice).toHaveBeenCalledWith({ id: "round" });
    expect(replace).toHaveBeenCalledWith({ name: "groupDetail", params: { groupId: "group" } });
  });

  it("hides the cancel button from a member who did not start the round", () => {
    useUserStore().user = { id: MIA.id } as never;

    expect(mountPage().find('[data-test="settle-up-cancel"]').exists()).toBe(false);
  });
});
