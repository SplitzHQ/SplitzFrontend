import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref, useTemplateRef } from "vue";

import { useLoadFeedback, type LoadPhase } from "../use-load-feedback";

const MESSAGES = {
  failed: () => "failed text",
  loaded: () => "loaded text",
  loading: () => "loading text",
};

const NO_RETRY = () => Promise.resolve();

/** Mounts a small page that uses the composable, with the phase given. */
function mountHost(initialPhase: LoadPhase) {
  const phase = ref<LoadPhase>(initialPhase);
  let retry: (refetch: () => Promise<unknown>) => Promise<void> = NO_RETRY;

  const wrapper = mount(
    defineComponent({
      setup() {
        const content = useTemplateRef<HTMLElement>("content");
        const feedback = useLoadFeedback({ content, messages: MESSAGES, phase });
        ({ retry } = feedback);
        return { announcement: feedback.announcement, phase };
      },
      template: `
        <div>
          <p role="status">{{ announcement }}</p>
          <button v-if="phase === 'failed'" type="button">Retry</button>
          <div ref="content" tabindex="-1" data-test="content" />
        </div>`,
    }),
    { attachTo: document.body }
  );

  return { phase, retry: (refetch: () => Promise<unknown>) => retry(refetch), wrapper };
}

describe("useLoadFeedback", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("reads the loading text after the mount, because a browser skips the first text of a new region", async () => {
    const { wrapper } = mountHost("loading");
    await nextTick();

    expect(wrapper.get('[role="status"]').text()).toBe("loading text");
  });

  it("reads nothing when the data is ready at the mount", () => {
    const { wrapper } = mountHost("ready");

    expect(wrapper.get('[role="status"]').text()).toBe("");
  });

  it("reads the loaded text when the loading ends", async () => {
    const { phase, wrapper } = mountHost("loading");

    phase.value = "ready";
    await nextTick();

    expect(wrapper.get('[role="status"]').text()).toBe("loaded text");
  });

  it("leaves the first failure to the Notice, and reads a failure after a retry", async () => {
    const { phase, wrapper } = mountHost("loading");

    phase.value = "failed";
    await nextTick();

    expect(wrapper.get('[role="status"]').text()).toBe("");

    phase.value = "loading";
    await nextTick();

    expect(wrapper.get('[role="status"]').text()).toBe("loading text");

    phase.value = "failed";
    await nextTick();

    expect(wrapper.get('[role="status"]').text()).toBe("failed text");
  });

  it("moves the focus to the content when a retry succeeds and removes the button", async () => {
    const { phase, retry, wrapper } = mountHost("failed");
    wrapper.get("button").element.focus();

    await retry(() => {
      phase.value = "ready";
      return Promise.resolve();
    });

    expect(document.activeElement).toBe(wrapper.get('[data-test="content"]').element);
  });

  it("keeps the focus on the button when the retry fails", async () => {
    const { retry, wrapper } = mountHost("failed");
    const button = wrapper.get("button").element;
    button.focus();

    await retry(vi.fn(() => Promise.resolve()));

    expect(document.activeElement).toBe(button);
  });

  it("does not move a focus that the user put on another element during the retry", async () => {
    const { phase, retry, wrapper } = mountHost("failed");
    const other = document.createElement("input");
    document.body.append(other);
    wrapper.get("button").element.focus();

    await retry(() => {
      other.focus();
      phase.value = "ready";
      return Promise.resolve();
    });

    expect(document.activeElement).toBe(other);
  });
});
