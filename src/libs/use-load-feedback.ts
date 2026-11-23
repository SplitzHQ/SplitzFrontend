import { nextTick, onMounted, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref, type ShallowRef } from "vue";

/**
 * Screen-reader feedback, focus recovery, and content transitions for pages that load data asynchronously.
 */

/**
 * Data-loading state of a page.
 * - `loading`: The initial load or a retry is in progress.
 * - `failed`: A request failed and the page has no data to display.
 * - `ready`: Data finished loading, or cached data remains on screen.
 */
export type LoadPhase = "failed" | "loading" | "ready";

/** Localized status messages announced to screen readers when `LoadPhase` changes. */
export interface LoadMessages {
  /** Announced when a retry fails while the error `Notice` is already on screen. */
  failed: () => string;
  /** Announced when loading finishes and the page enters the `ready` phase. */
  loaded: () => string;
  /** Announced when the initial load or a retry starts. */
  loading: () => string;
}

/** Options for `useLoadFeedback`. */
export interface UseLoadFeedbackOptions {
  /**
   * Container element that receives focus when a successful retry unmounts the retry button.
   * Must have `tabindex="-1"` so programmatic focus works without adding a tab stop.
   */
  content: Readonly<Ref<HTMLElement | null>>;
  /** Getters that return localized status messages for screen readers. */
  messages: LoadMessages;
  /** Current data-loading phase of the page. */
  phase: MaybeRefOrGetter<LoadPhase>;
}

/** Reactive state and actions returned by `useLoadFeedback`. */
export interface UseLoadFeedbackReturn {
  /**
   * Text for a persistent `role="status"` live region.
   * Keep that element mounted across all phases because browsers only announce text changes inside an existing live region.
   */
  announcement: Readonly<ShallowRef<string>>;
  /**
   * Runs `refetch` and moves focus to `content` if a successful retry unmounts the focused retry button.
   * Leaves focus untouched if the user moved focus elsewhere while waiting.
   */
  retry: (refetch: () => Promise<unknown>) => Promise<void>;
}

/**
 * Manages screen-reader status announcements and retry focus recovery for a page that loads data.
 *
 * The live region stays silent on the first failure because `<Notice announce>` mounts with `role="alert"` and
 * announces that error itself. Because the error `Notice` remains mounted during a retry, `announcement` takes over
 * for any subsequent failure.
 */
export function useLoadFeedback({ content, messages, phase }: UseLoadFeedbackOptions): UseLoadFeedbackReturn {
  const announcement = shallowRef("");
  let isErrorNoticeMounted = false;

  /** Updates the `role="status"` text to match `nextPhase`. */
  function updateAnnouncement(nextPhase: LoadPhase): void {
    switch (nextPhase) {
      case "loading":
        announcement.value = messages.loading();
        break;
      case "ready":
        isErrorNoticeMounted = false;
        announcement.value = messages.loaded();
        break;
      case "failed":
        announcement.value = isErrorNoticeMounted ? messages.failed() : "";
        isErrorNoticeMounted = true;
        break;
    }
  }

  // Set the initial loading message after mount. Browsers ignore the initial text of a new `role="status"` live
  // region and only announce later text changes.
  onMounted(() => {
    const initialPhase = toValue(phase);
    if (initialPhase === "loading") {
      updateAnnouncement("loading");
    } else if (initialPhase === "failed") {
      isErrorNoticeMounted = true;
    }
  });

  watch(() => toValue(phase), updateAnnouncement);

  async function retry(refetch: () => Promise<unknown>): Promise<void> {
    const focusedBeforeRetry = document.activeElement;
    await refetch();
    await nextTick();

    if (toValue(phase) !== "ready") return;

    // Unmounting the retry button resets focus to `<body>` (or leaves it on the button until its leave transition
    // ends). Move focus to `content` only in those two cases so user focus changes are preserved.
    const activeElement = document.activeElement;
    if (activeElement === focusedBeforeRetry || activeElement === document.body) {
      content.value?.focus({ preventScroll: true });
    }
  }

  return { announcement, retry };
}
