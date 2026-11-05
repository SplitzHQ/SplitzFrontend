import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

import ReloadPrompt from "../ReloadPrompt.vue";

const mocks = vi.hoisted(() => ({
  options: undefined as undefined | { onRegistered: (r?: { update: () => void }) => void },
  toast: { info: vi.fn(), success: vi.fn() },
  updateServiceWorker: vi.fn(),
}));

const needRefresh = ref(false);
const offlineReady = ref(false);

vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (key: string) => key }) }));
vi.mock("vue-sonner", () => ({ toast: mocks.toast }));
vi.mock("virtual:pwa-register/vue", () => ({
  useRegisterSW: (options: typeof mocks.options) => {
    mocks.options = options;
    return { needRefresh, offlineReady, updateServiceWorker: mocks.updateServiceWorker };
  },
}));

describe("ReloadPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    needRefresh.value = false;
    offlineReady.value = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders no element", () => {
    expect(mount(ReloadPrompt).find("*").exists()).toBe(false);
  });

  it("shows a translated toast with an update action for a new version", async () => {
    mount(ReloadPrompt);

    needRefresh.value = true;
    await nextTick();

    const [message, options] = mocks.toast.info.mock.calls[0] as [
      string,
      { action: { label: string; onClick: () => void }; closeButton: boolean; duration: number },
    ];
    expect(message).toBe("reload-prompt-new-version");
    expect(options.duration).toBe(Infinity);
    expect(options.closeButton).toBe(true);
    expect(options.action.label).toBe("reload-prompt-update");

    options.action.onClick();
    expect(mocks.updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("shows no toast when the app can work offline", async () => {
    mount(ReloadPrompt);

    offlineReady.value = true;
    await nextTick();

    expect(mocks.toast.success).not.toHaveBeenCalled();
  });

  it("checks for a new version each hour and stops after unmount", () => {
    const wrapper = mount(ReloadPrompt);
    const update = vi.fn();
    mocks.options?.onRegistered({ update });

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(update).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(update).toHaveBeenCalledTimes(1);
  });
});
