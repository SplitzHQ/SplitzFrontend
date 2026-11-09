import { defineStore } from "pinia";
import { ref } from "vue";
import { type RouteLocationRaw, useRouter } from "vue-router";

/** The page that a back or close action opens when the history has no earlier page of the app. */
const HOME_ROUTE: RouteLocationRaw = { name: "home" };

/** The fields that vue-router writes to the history state of each entry. */
interface RouterHistoryState {
  /** The URL of the earlier entry of the app. It is null on the first entry, for example after a link from an email. */
  back?: string | null;
  position?: number;
}

/** The options of a back or close action. */
interface BackOptions {
  /** The page to open when the history has no earlier page of the app. The default is the home page. */
  fallback?: RouteLocationRaw | undefined;
}

const getRouterState = () => (history.state ?? {}) as RouterHistoryState;

// vue-router set the position in the history state when navigating, but it doesn't provide a way to access it, so we have to do it ourselves
const getPosition = () => getRouterState().position ?? 0;

export const useRouterHistoryStore = defineStore("routing-history", () => {
  const router = useRouter();
  const snapshots = ref<number[]>([]);

  const takeSnapshot = () => {
    snapshots.value.push(getPosition());
  };

  /**
   * Opens the earlier page of the app. Without an earlier page, `router.back()` does nothing or leaves the app,
   * so this function replaces the entry with the `fallback` page.
   */
  const goBack = ({ fallback = HOME_ROUTE }: BackOptions = {}) => {
    if (getRouterState().back) {
      router.back();
      return;
    }
    void router.replace(fallback);
  };

  /**
   * Returns to the position of the last snapshot. The snapshots are in memory, so a reload or a link from outside the
   * app leaves none. This function then replaces the entry with the `fallback` page.
   */
  const restoreSnapshot = ({ fallback = HOME_ROUTE }: BackOptions = {}) => {
    const snapshotPosition = snapshots.value.pop();
    const stepsToGoBack = snapshotPosition === undefined ? 0 : getPosition() - snapshotPosition;
    if (stepsToGoBack > 0) {
      router.go(-stepsToGoBack);
      return;
    }
    void router.replace(fallback);
  };

  return {
    goBack,
    restoreSnapshot,
    takeSnapshot,
  };
});
