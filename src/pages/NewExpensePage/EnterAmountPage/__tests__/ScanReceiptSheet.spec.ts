import { flushPromises, shallowMount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { ReceiptRecognitionDto, ReceiptRecognitionSettingsDto, RecognizeReceiptRequest } from "@/backend";
import { ResponseError } from "@/backend/openapi";

import ScanReceiptSheet from "../ScanReceiptSheet.vue";

const mocks = vi.hoisted(() => ({
  api: {
    getReceiptRecognitionSettings: vi.fn(),
    recognizeReceipt: vi.fn<(request: RecognizeReceiptRequest) => Promise<ReceiptRecognitionDto>>(),
  },
  push: vi.fn(),
  reportError: vi.fn(),
  settings: { value: { data: undefined as ReceiptRecognitionSettingsDto | undefined, status: "success" } },
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/backend", () => ({
  ReceiptRecognitionApi: class {
    getReceiptRecognitionSettings = mocks.api.getReceiptRecognitionSettings;
    recognizeReceipt = mocks.api.recognizeReceipt;
  },
  ReceiptRecognitionStatus: { Failed: "Failed", Pending: "Pending", Succeeded: "Succeeded" },
}));
vi.mock("@/backend/config", () => ({ default: {} }));
vi.mock("@pinia/colada", () => ({
  useQuery: () => ({ refetch: vi.fn(), state: mocks.settings }),
}));
vi.mock("@/libs/report-error", () => ({ default: mocks.reportError }));
vi.mock("vue-router", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("vue-sonner", () => ({ toast: mocks.toast }));
vi.mock("fluent-vue", () => ({
  useFluent: () => ({
    $t: (key: string, args?: Record<string, unknown>) =>
      typeof args?.seconds === "number" ? `${key}:${args.seconds}` : key,
  }),
}));

const availableSettings: ReceiptRecognitionSettingsDto = {
  available: true,
  customProviderAllowed: true,
  customProviderEnabled: true,
  hasApiKey: true,
  maxImages: 2,
  serverProviderAvailable: false,
};

const succeeded: ReceiptRecognitionDto = {
  amount: "12.50",
  createTime: new Date(),
  currency: "USD",
  images: ["receipts/u1/r1/1.webp"],
  model: "vision-1",
  name: "Blue Bottle",
  receiptRecognitionId: "r1",
  status: "Succeeded",
  usedCustomProvider: true,
};

describe("ScanReceiptSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.settings = ref({ data: availableSettings, status: "success" }) as typeof mocks.settings;
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:preview") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends every picked image with the category keys and emits the result", async () => {
    mocks.api.recognizeReceipt.mockResolvedValue(succeeded);
    const wrapper = mountSheet();
    const first = new File(["a"], "a.png", { type: "image/png" });
    const second = new File(["b"], "b.png", { type: "image/png" });

    await pickFiles(wrapper, [first, second]);

    expect(wrapper.findAll('[data-test="scan-image"]')).toHaveLength(2);
    expect(wrapper.text()).toContain("new-expense-scan-count");

    await wrapper.get('[data-test="scan-recognize"]').trigger("click");
    await flushPromises();

    expect(mocks.api.recognizeReceipt).toHaveBeenCalledTimes(1);
    const request = mocks.api.recognizeReceipt.mock.calls[0]![0];
    expect(request.files).toEqual([first, second]);
    expect(request.categories).toContain("dining_out");
    expect(wrapper.emitted("recognized")).toEqual([[succeeded]]);
    expect(wrapper.emitted("update:modelValue")).toContainEqual([false]);
    expect(mocks.toast.error).not.toHaveBeenCalled();
  });

  it("rejects files that are not images and more files than the limit", async () => {
    const wrapper = mountSheet();

    await pickFiles(wrapper, [
      new File(["x"], "notes.txt", { type: "text/plain" }),
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.png", { type: "image/png" }),
      new File(["c"], "c.png", { type: "image/png" }),
    ]);

    expect(wrapper.findAll('[data-test="scan-image"]')).toHaveLength(2);
    expect(mocks.toast.error).toHaveBeenCalledWith("new-expense-review-error-receipt-not-image");
    expect(mocks.toast.error).toHaveBeenCalledWith("new-expense-scan-too-many");
  });

  it("reports a reply the model could not read without closing", async () => {
    mocks.api.recognizeReceipt.mockResolvedValue({ ...succeeded, error: "not JSON", status: "Failed" });
    const wrapper = mountSheet();

    await pickFiles(wrapper, [new File(["a"], "a.png", { type: "image/png" })]);
    await wrapper.get('[data-test="scan-recognize"]').trigger("click");
    await flushPromises();

    expect(mocks.toast.error).toHaveBeenCalledWith("new-expense-scan-failed");
    expect(mocks.reportError).toHaveBeenCalledWith("recognizeReceipt", "not JSON");
    expect(wrapper.emitted("recognized")).toBeUndefined();
    expect(wrapper.findAll('[data-test="scan-image"]')).toHaveLength(1);
  });

  it("shows the cooldown after a rate limit and blocks new scans until it ends", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));
    mocks.api.recognizeReceipt.mockRejectedValue(
      new ResponseError(new Response(null, { headers: { "Retry-After": "3" }, status: 429 }))
    );
    const wrapper = mountSheet();

    await pickFiles(wrapper, [new File(["a"], "a.png", { type: "image/png" })]);
    await wrapper.get('[data-test="scan-recognize"]').trigger("click");
    await flushPromises();

    expect(wrapper.get('[data-test="scan-rate-limit"]').text()).toContain("3");
    expect(wrapper.get('[data-test="scan-recognize"]').attributes("disabled")).toBeDefined();
    expect(mocks.toast.error).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(3000);
    await flushPromises();

    expect(wrapper.find('[data-test="scan-rate-limit"]').exists()).toBe(false);
    expect(wrapper.get('[data-test="scan-recognize"]').attributes("disabled")).toBeUndefined();
  });

  it("points to the provider settings when recognition is not available", async () => {
    mocks.settings = ref({
      data: { ...availableSettings, available: false, customProviderEnabled: false, hasApiKey: false },
      status: "success",
    }) as typeof mocks.settings;
    const wrapper = mountSheet();

    expect(wrapper.find('[data-test="scan-unavailable"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="scan-recognize"]').exists()).toBe(false);

    await wrapper.get('[data-test="scan-open-settings"]').trigger("click");

    expect(mocks.push).toHaveBeenCalledWith({ name: "receiptRecognitionSettings" });
    expect(wrapper.emitted("update:modelValue")).toContainEqual([false]);
  });
});

async function pickFiles(wrapper: ReturnType<typeof mountSheet>, files: File[]) {
  const galleryInput = wrapper.get('input[type="file"][multiple]');
  Object.defineProperty(galleryInput.element, "files", { configurable: true, value: files });
  await galleryInput.trigger("change");
  await flushPromises();
}

function mountSheet() {
  return shallowMount(ScanReceiptSheet, {
    global: {
      stubs: {
        RateLimitCountdown: false,
        SButton: {
          emits: ["click"],
          props: ["disabled", "loading"],
          template: '<button :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
        },
        Sheet: {
          props: ["modelValue"],
          template: "<div><slot /></div>",
        },
        TransitionGroup: false,
      },
    },
    props: { modelValue: true },
  });
}
