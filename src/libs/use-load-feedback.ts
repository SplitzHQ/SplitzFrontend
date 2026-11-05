import { nextTick, onMounted, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue";

/**
 * The state of the data that a page loads.
 * - `loading`: The first request, or a retry, is in progress.
 * - `failed`: A request failed and the page has no data to show for it.
 * - `ready`: The page shows its data.
 */
export type LoadPhase = "failed" | "loading" | "ready";

/** The texts that a screen reader reads for each change of phase. */
export interface LoadMessages {
  failed: () => string;
  loaded: () => string;
  loading: () => string;
}

/** The props of the `Transition` between a skeleton and the content. The skeleton goes at once, the content fades in. */
export const CONTENT_FADE_IN = {
  enterActiveClass: "transition-opacity duration-(--motion-duration-state) ease-(--motion-easing-enter)",
  enterFromClass: "opacity-0",
  leaveActiveClass: "hidden",
} as const;

/**
 * Gives a page that loads data the text for its `role="status"` region and the action for its retry button.
 * The page must keep the region in the DOM for all phases, because a browser reads only a change in an existing region.
 *
 * The text is empty for the first failure, because the Notice with `announce` reads that failure when it appears. The
 * Notice stays on the page during a retry and does not read again, so the region reads a second failure.
 */
export function useLoadFeedback(options: {
  /** The block that gets the focus when a retry succeeds and removes the retry button. It needs `tabindex="-1"`. */
  content: Ref<HTMLElement | null>;
  messages: LoadMessages;
  phase: MaybeRefOrGetter<LoadPhase>;
}) {
  const { content, messages, phase } = options;

  const announcement = shallowRef("");
  let noticeIsVisible = false;

  /** Sets the text of the region for the new phase. */
  function announce(next: LoadPhase) {
    if (next === "loading") {
      announcement.value = messages.loading();
    } else if (next === "ready") {
      noticeIsVisible = false;
      announcement.value = messages.loaded();
    } else {
      announcement.value = noticeIsVisible ? messages.failed() : "";
      noticeIsVisible = true;
    }
  }

  // The text changes after the mount, because a browser does not read the first text of a new region.
  onMounted(() => {
    const current = toValue(phase);
    if (current === "loading") announce(current);
    if (current === "failed") noticeIsVisible = true;
  });

  watch(
    () => toValue(phase),
    (next) => {
      announce(next);
    }
  );

  /**
   * Runs a retry. When the retry succeeds, the button goes away and the focus would go to the page body, so this
   * function moves the focus to the content. It does not move a focus that the user put on another element.
   */
  async function retry(refetch: () => Promise<unknown>) {
    const focused = document.activeElement;
    await refetch();
    await nextTick();
    const focusIsLost = document.activeElement === focused || document.activeElement === document.body;
    if (toValue(phase) === "ready" && focusIsLost) content.value?.focus({ preventScroll: true });
  }

  return { announcement, retry };
}
