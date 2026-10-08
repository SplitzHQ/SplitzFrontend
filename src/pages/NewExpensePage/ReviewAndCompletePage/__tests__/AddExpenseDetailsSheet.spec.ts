import { flushPromises, shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseError } from "@/backend/openapi";
import { useTransactionStore } from "@/stores/transaction";

import AddExpenseDetailsSheet from "../AddExpenseDetailsSheet.vue";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
}));
const reportErrorMock = vi.hoisted(() => vi.fn());

vi.mock("@pinia/colada", () => ({
  useQueryCache: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/backend/config", () => ({ default: {} }));

vi.mock("@/libs/report-error", () => ({ default: reportErrorMock }));

vi.mock("vue-sonner", () => ({ toast: toastMock }));

vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: Record<string, unknown>) =>
      typeof args?.seconds === "number" ? `${key}:${args.seconds}` : key,
  }),
}));

describe("AddExpenseDetailsSheet receipt upload", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("retries the receipt upload after the cooldown ends", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(function (this: FileReader) {
      Object.defineProperty(this, "result", {
        configurable: true,
        value: "data:image/png;base64,cmVjZWlwdA==",
      });
      this.dispatchEvent(new ProgressEvent("load"));
    });
    const transactionStore = useTransactionStore();
    transactionStore.transaction = {
      amount: 10,
      currency: "USD",
      icon: "default",
      name: "Dinner",
      userId: "user-1",
    };
    const saveTransaction = vi.spyOn(transactionStore, "saveTransaction").mockResolvedValue({
      amount: "10.00",
      balances: [],
      createTime: new Date(),
      currency: "USD",
      groupId: "00000000-0000-0000-0000-000000000001",
      icon: "default",
      name: "Dinner",
      tags: [],
      transactionId: "00000000-0000-0000-0000-000000000002",
      transactionTime: new Date(),
    });
    const uploadReceipt = vi
      .spyOn(transactionStore, "uploadTransactionReceipt")
      .mockRejectedValueOnce(new ResponseError(new Response(null, { headers: { "Retry-After": "2" }, status: 429 })))
      .mockResolvedValueOnce(undefined);
    const wrapper = mountSheet();
    const galleryInput = wrapper.get('input[type="file"]:not([capture])');
    const receipt = new File(["receipt"], "receipt.png", { type: "image/png" });

    Object.defineProperty(galleryInput.element, "files", {
      configurable: true,
      value: [receipt],
    });
    await galleryInput.trigger("change");
    await flushPromises();
    await wrapper.get('[data-test="save-details"]').trigger("click");
    await flushPromises();

    expect(saveTransaction).toHaveBeenCalledTimes(1);
    expect(uploadReceipt).toHaveBeenCalledTimes(1);
    expect(uploadReceipt).toHaveBeenLastCalledWith(receipt);
    expect(wrapper.get('[data-test="receipt-rate-limit"]').text()).toContain("2");
    expect(wrapper.get('[data-test="save-details"]').attributes("disabled")).toBeDefined();
    expect(wrapper.get('input[type="file"][capture]').attributes("disabled")).toBeDefined();
    expect(wrapper.get('input[type="file"]:not([capture])').attributes("disabled")).toBeDefined();
    expect(wrapper.get('[aria-label="Remove receipt"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find('img[alt="Receipt preview"]').exists()).toBe(true);

    await wrapper.get('[data-test="save-details"]').trigger("click");
    expect(saveTransaction).toHaveBeenCalledTimes(1);
    expect(uploadReceipt).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();
    expect(wrapper.find('[data-test="receipt-rate-limit"]').exists()).toBe(false);

    await wrapper.get('[data-test="save-details"]').trigger("click");
    await flushPromises();

    // The retry saves the details again (create-or-update) so edits made during the cooldown are kept.
    expect(saveTransaction).toHaveBeenCalledTimes(2);
    expect(uploadReceipt).toHaveBeenCalledTimes(2);
    expect(uploadReceipt).toHaveBeenLastCalledWith(receipt);
    expect(wrapper.emitted("update:modelValue")).toContainEqual([false]);
    expect(toastMock.error).not.toHaveBeenCalled();
    expect(reportErrorMock).not.toHaveBeenCalled();
  });

  it("preserves generic reporting for transaction save failures", async () => {
    const transactionStore = useTransactionStore();
    transactionStore.transaction = {
      amount: 10,
      currency: "USD",
      icon: "default",
      name: "Dinner",
      userId: "user-1",
    };
    const error = new Error("save failed");
    vi.spyOn(transactionStore, "saveTransaction").mockRejectedValue(error);
    const uploadReceipt = vi.spyOn(transactionStore, "uploadTransactionReceipt");
    const wrapper = mountSheet();

    await wrapper.get('[data-test="save-details"]').trigger("click");
    await flushPromises();

    expect(uploadReceipt).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalledWith("new-expense-review-error-saving-transaction");
    expect(reportErrorMock).toHaveBeenCalledWith("saveTransaction", error);
    expect(wrapper.find('[data-test="receipt-rate-limit"]').exists()).toBe(false);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("preserves generic reporting for non-rate-limited receipt upload failures", async () => {
    const transactionStore = useTransactionStore();
    transactionStore.transaction = {
      amount: 10,
      currency: "USD",
      icon: "default",
      name: "Dinner",
      userId: "user-1",
    };
    const saveTransaction = vi.spyOn(transactionStore, "saveTransaction").mockResolvedValue({
      amount: "10.00",
      balances: [],
      createTime: new Date(),
      currency: "USD",
      groupId: "00000000-0000-0000-0000-000000000001",
      icon: "default",
      name: "Dinner",
      tags: [],
      transactionId: "00000000-0000-0000-0000-000000000002",
      transactionTime: new Date(),
    });
    const error = new Error("upload failed");
    const uploadReceipt = vi
      .spyOn(transactionStore, "uploadTransactionReceipt")
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    const wrapper = mountSheet();
    const galleryInput = wrapper.get('input[type="file"]:not([capture])');
    const receipt = new File(["receipt"], "receipt.png", { type: "image/png" });

    Object.defineProperty(galleryInput.element, "files", {
      configurable: true,
      value: [receipt],
    });
    await galleryInput.trigger("change");
    await wrapper.get('[data-test="save-details"]').trigger("click");
    await flushPromises();

    expect(saveTransaction).toHaveBeenCalledTimes(1);
    expect(uploadReceipt).toHaveBeenCalledTimes(1);
    expect(uploadReceipt).toHaveBeenCalledWith(receipt);
    expect(toastMock.error).toHaveBeenCalledWith("new-expense-review-error-saving-transaction");
    expect(reportErrorMock).toHaveBeenCalledWith("saveTransaction", error);
    expect(wrapper.find('[data-test="receipt-rate-limit"]').exists()).toBe(false);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    await wrapper.get('[data-test="save-details"]').trigger("click");
    await flushPromises();

    expect(saveTransaction).toHaveBeenCalledTimes(2);
    expect(uploadReceipt).toHaveBeenCalledTimes(2);
    expect(uploadReceipt).toHaveBeenLastCalledWith(receipt);
    expect(wrapper.emitted("update:modelValue")).toContainEqual([false]);
  });
});

function mountSheet() {
  return shallowMount(AddExpenseDetailsSheet, {
    global: {
      stubs: {
        CategoryIcon: true,
        RateLimitCountdown: false,
        SButton: {
          emits: ["click"],
          props: ["disabled", "loading"],
          template:
            '<button data-test="save-details" :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
        },
        SelectCategorySheet: true,
        Sheet: {
          props: ["modelValue"],
          template: "<div><slot /></div>",
        },
        TextInput: true,
      },
    },
    props: { modelValue: true },
  });
}
