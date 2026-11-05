import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { LLMSettingsApi, LLMSettingsDto } from "@/backend";
import { ResponseError } from "@/backend/openapi";

import ReceiptRecognitionSettingsPage from "../ReceiptRecognitionSettingsPage.vue";

const mocks = vi.hoisted(() => ({
  api: {
    clearLLMSettings: vi.fn<LLMSettingsApi["clearLLMSettings"]>(),
    getLLMSettings: vi.fn<LLMSettingsApi["getLLMSettings"]>(),
    updateLLMSettings: vi.fn<LLMSettingsApi["updateLLMSettings"]>(),
  },
  refetch: vi.fn(),
  reportError: vi.fn(),
  settings: { value: { data: undefined as LLMSettingsDto | undefined, status: "success" } },
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/backend", async () => {
  const { ResponseError: RealResponseError } = await import("@/backend/openapi");
  return {
    LLMSettingsApi: class {
      clearLLMSettings = mocks.api.clearLLMSettings;
      getLLMSettings = mocks.api.getLLMSettings;
      updateLLMSettings = mocks.api.updateLLMSettings;
    },
    ResponseError: RealResponseError,
  };
});
vi.mock("@/backend/config", () => ({ default: {} }));
vi.mock("@pinia/colada", () => ({
  useQuery: ({ query }: { query: () => Promise<LLMSettingsDto> }) => {
    void query();
    return { refetch: mocks.refetch, state: mocks.settings };
  },
}));
vi.mock("@/libs/report-error", () => ({ default: mocks.reportError }));
vi.mock("vue-sonner", () => ({ toast: mocks.toast }));
vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (key: string) => key }) }));

const storedSettings: LLMSettingsDto = {
  available: true,
  customProviderAllowed: true,
  customProviderEnabled: true,
  endpoint: "https://llm.example.com/v1",
  hasApiKey: true,
  model: "vision-1",
  serverProviderAvailable: false,
};

describe("ReceiptRecognitionSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refetch.mockResolvedValue(undefined);
    mocks.api.getLLMSettings.mockResolvedValue(storedSettings);
    mocks.settings = ref({ data: storedSettings, status: "success" });
  });

  it("saves the stored provider again without sending a key when the field is blank", async () => {
    mocks.api.updateLLMSettings.mockResolvedValue(storedSettings);
    const wrapper = mountPage();

    expect(mocks.api.getLLMSettings).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[data-test="custom-fields"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="overall-status"]').text()).toBe("receipt-recognition-status-ready");

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(mocks.api.updateLLMSettings).toHaveBeenCalledWith({
      lLMSettingsInputDto: {
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
    mocks.api.updateLLMSettings.mockRejectedValue(
      new ResponseError(new Response("Endpoint must be an absolute http or https URL.", { status: 400 }))
    );
    const wrapper = mountPage();

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(mocks.toast.error).not.toHaveBeenCalled();
    expect(wrapper.get("#receipt-endpoint").attributes("error")).toBe("receipt-recognition-error-endpoint");
    expect(wrapper.find('[data-test="save-settings-error"]').exists()).toBe(false);
    expect(mocks.refetch).not.toHaveBeenCalled();
  });

  it("removes the provider and hides the form when the server offers no custom providers", async () => {
    mocks.api.clearLLMSettings.mockResolvedValue(undefined);
    const wrapper = mountPage();

    await wrapper.get('[data-test="remove-settings"]').trigger("click");
    await flushPromises();

    expect(mocks.api.clearLLMSettings).not.toHaveBeenCalled();

    await wrapper.get('[data-test="remove-settings-confirm"]').trigger("click");
    await flushPromises();

    expect(mocks.api.clearLLMSettings).toHaveBeenCalledTimes(1);
    expect(mocks.toast.success).toHaveBeenCalledWith("receipt-recognition-removed");
    expect(wrapper.find('[data-test="remove-settings-confirm"]').exists()).toBe(false);

    mocks.settings = ref({
      data: { ...storedSettings, available: false, customProviderAllowed: false },
      status: "success",
    });
    const locked = mountPage();

    expect(locked.find("form").exists()).toBe(false);
    expect(locked.text()).toContain("receipt-recognition-custom-not-allowed");
    expect(locked.get('[data-test="overall-status"]').text()).toBe("receipt-recognition-status-off");
  });

  it("keeps the provider when the user cancels the confirm step", async () => {
    const wrapper = mountPage();

    await wrapper.get('[data-test="remove-settings"]').trigger("click");
    await wrapper.get('[data-test="remove-settings-cancel"]').trigger("click");
    await flushPromises();

    expect(mocks.api.clearLLMSettings).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test="remove-settings-confirm"]').exists()).toBe(false);
  });

  it("keeps the sheet open with an error when the removal fails, and clears the error on reopen", async () => {
    mocks.api.clearLLMSettings.mockRejectedValue(new Error("network"));
    const wrapper = mountPage();

    await wrapper.get('[data-test="remove-settings"]').trigger("click");
    await wrapper.get('[data-test="remove-settings-confirm"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="remove-settings-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="remove-settings-confirm"]').exists()).toBe(true);
    expect(mocks.toast.error).not.toHaveBeenCalled();
    expect(mocks.toast.success).not.toHaveBeenCalled();

    await wrapper.get('[data-test="remove-settings-cancel"]').trigger("click");
    await wrapper.get('[data-test="remove-settings"]').trigger("click");

    expect(wrapper.find('[data-test="remove-settings-error"]').exists()).toBe(false);
  });

  it("shows a toast when the removal fails after the sheet was closed", async () => {
    const wrapper = mountPage();
    mocks.api.clearLLMSettings.mockImplementation(async () => {
      await wrapper.get('[data-test="sheet-backdrop"]').trigger("click");
      throw new Error("network");
    });

    await wrapper.get('[data-test="remove-settings"]').trigger("click");
    await wrapper.get('[data-test="remove-settings-confirm"]').trigger("click");
    await flushPromises();

    expect(mocks.toast.error).toHaveBeenCalledWith("receipt-recognition-remove-error");
  });

  it("clears an old save error after the provider is removed", async () => {
    mocks.api.updateLLMSettings.mockRejectedValue(new Error("network"));
    mocks.api.clearLLMSettings.mockResolvedValue(undefined);
    const wrapper = mountPage();

    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(wrapper.find('[data-test="save-settings-error"]').exists()).toBe(true);

    await wrapper.get('[data-test="remove-settings"]').trigger("click");
    await wrapper.get('[data-test="remove-settings-confirm"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="save-settings-error"]').exists()).toBe(false);
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
        RemoveProviderSheet: false,
        SButton: {
          emits: ["click"],
          props: ["disabled", "loading", "type"],
          template:
            '<button :type="type ?? \'button\'" :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
        },
        SSwitch: true,
        // Shows the content only while the sheet is open, without the portal of the real sheet.
        Sheet: {
          emits: ["update:modelValue"],
          props: ["modelValue"],
          template: `<div v-if="modelValue">
            <button data-test="sheet-backdrop" @click="$emit('update:modelValue', false)" />
            <slot /><slot name="actions" />
          </div>`,
        },
        TextInput: true,
        Transition: false,
      },
    },
  });
}
