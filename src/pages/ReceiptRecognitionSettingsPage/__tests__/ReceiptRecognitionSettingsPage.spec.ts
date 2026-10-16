import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { ReceiptRecognitionSettingsDto } from "@/backend";
import { ResponseError } from "@/backend/openapi";

import ReceiptRecognitionSettingsPage from "../ReceiptRecognitionSettingsPage.vue";

const mocks = vi.hoisted(() => ({
  api: {
    clearReceiptRecognitionSettings: vi.fn(),
    getReceiptRecognitionSettings: vi.fn(),
    updateReceiptRecognitionSettings: vi.fn(),
  },
  refetch: vi.fn(),
  reportError: vi.fn(),
  settings: { value: { data: undefined as ReceiptRecognitionSettingsDto | undefined, status: "success" } },
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/backend", async () => {
  const { ResponseError: RealResponseError } = await import("@/backend/openapi");
  return {
    ReceiptRecognitionApi: class {
      clearReceiptRecognitionSettings = mocks.api.clearReceiptRecognitionSettings;
      getReceiptRecognitionSettings = mocks.api.getReceiptRecognitionSettings;
      updateReceiptRecognitionSettings = mocks.api.updateReceiptRecognitionSettings;
    },
    ResponseError: RealResponseError,
  };
});
vi.mock("@/backend/config", () => ({ default: {} }));
vi.mock("@pinia/colada", () => ({
  useQuery: () => ({ refetch: mocks.refetch, state: mocks.settings }),
}));
vi.mock("@/libs/report-error", () => ({ default: mocks.reportError }));
vi.mock("vue-sonner", () => ({ toast: mocks.toast }));
vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (key: string) => key }) }));

const storedSettings: ReceiptRecognitionSettingsDto = {
  available: true,
  customProviderAllowed: true,
  customProviderEnabled: true,
  endpoint: "https://llm.example.com/v1",
  hasApiKey: true,
  maxImages: 6,
  model: "vision-1",
  serverProviderAvailable: false,
};

describe("ReceiptRecognitionSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refetch.mockResolvedValue(undefined);
    mocks.settings = ref({ data: storedSettings, status: "success" }) as typeof mocks.settings;
  });

  it("saves the stored provider again without sending a key when the field is blank", async () => {
    mocks.api.updateReceiptRecognitionSettings.mockResolvedValue(storedSettings);
    const wrapper = mountPage();

    expect(wrapper.find('[data-test="custom-fields"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="overall-status"]').text()).toBe("receipt-recognition-status-ready");

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(mocks.api.updateReceiptRecognitionSettings).toHaveBeenCalledWith({
      receiptRecognitionSettingsInputDto: {
        apiKey: null,
        enabled: true,
        endpoint: "https://llm.example.com/v1",
        model: "vision-1",
      },
    });
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
    expect(mocks.toast.success).toHaveBeenCalledWith("receipt-recognition-saved");
  });

  it("explains which field the backend rejected", async () => {
    mocks.api.updateReceiptRecognitionSettings.mockRejectedValue(
      new ResponseError(new Response("Endpoint must be an absolute http or https URL.", { status: 400 }))
    );
    const wrapper = mountPage();

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(mocks.toast.error).toHaveBeenCalledWith("receipt-recognition-error-endpoint");
    expect(mocks.refetch).not.toHaveBeenCalled();
  });

  it("removes the provider and hides the form when the server offers no custom providers", async () => {
    mocks.api.clearReceiptRecognitionSettings.mockResolvedValue(undefined);
    const wrapper = mountPage();

    await wrapper.get('[data-test="remove-settings"]').trigger("click");
    await flushPromises();

    expect(mocks.api.clearReceiptRecognitionSettings).toHaveBeenCalledTimes(1);
    expect(mocks.toast.success).toHaveBeenCalledWith("receipt-recognition-removed");

    mocks.settings = ref({
      data: { ...storedSettings, available: false, customProviderAllowed: false },
      status: "success",
    }) as typeof mocks.settings;
    const locked = mountPage();

    expect(locked.find("form").exists()).toBe(false);
    expect(locked.text()).toContain("receipt-recognition-custom-not-allowed");
    expect(locked.get('[data-test="overall-status"]').text()).toBe("receipt-recognition-status-off");
  });
});

function mountPage() {
  return shallowMount(ReceiptRecognitionSettingsPage, {
    global: {
      stubs: {
        HeaderMobileSecondary: true,
        Layout: {
          template: '<div><slot name="header" /><slot /></div>',
        },
        SButton: {
          emits: ["click"],
          props: ["disabled", "loading", "type"],
          template:
            '<button :type="type ?? \'button\'" :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
        },
        SSwitch: true,
        TextInput: true,
        Transition: false,
      },
    },
  });
}
