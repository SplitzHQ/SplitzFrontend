import type { FluentBundle } from "@fluent/bundle";
import type { useQueryCache } from "@pinia/colada";
import type { Ref } from "vue";
import type { Router } from "vue-router";
import { toast } from "vue-sonner";

import { copyToClipboard } from "@/libs/copy-to-clipboard";
import type { useUserStore } from "@/stores/user";

import { API_SIMULATIONS, apiSimulation } from "./api-simulation";
import { browserFailures, setClipboardBroken, setStorageBroken } from "./browser-failures";
import { bundleLocale, bundlesWithFirst } from "./locale";
import { PANEL_PREFS_KEY } from "./panel-prefs";
import { REAL, type DebugGroup } from "./registry";
import { clearStorageExcept, expireAccessToken, tokenStatus } from "./session";

/** What the groups need from the running app. `DebugPanel.vue` gives it from its setup. */
export interface DebugContext {
  router: Router;
  userStore: ReturnType<typeof useUserStore>;
  queryCache: ReturnType<typeof useQueryCache>;
  /** fluent-vue's root bundle list. Set it to change the app language. */
  bundles: Ref<Iterable<FluentBundle>>;
  /** The bundle order at start-up, which is the "Real" language. */
  startBundles: readonly FluentBundle[];
  /** Formats a message key in the current language. */
  t: (key: string, args?: Record<string, string | number>) => string;
  /**
   * Changes on a timer and after each action. Read-outs that come from `localStorage` (not reactive) read it, so
   * they update.
   */
  tick: Ref<number>;
}

/** Makes the panel groups, in panel order. */
export function createDebugGroups(ctx: DebugContext): DebugGroup[] {
  const { router, userStore, queryCache, t, tick } = ctx;
  const bump = () => tick.value++;
  /** Reads the token state from `localStorage`; reading `tick` first makes computeds run again on each tick. */
  const readTokenStatus = () => {
    void tick.value;
    return tokenStatus(localStorage);
  };

  const go = (name: string) => () => router.push({ name });

  // TODO(prototypes): when src/prototypes lands, add an action here that opens the prototype index in a new tab.
  const pages: DebugGroup = {
    id: "pages",
    rows: [
      {
        actions: [
          { id: "home", label: "debug-panel-page-home", run: go("home"), tip: "debug-panel-page-home-tip" },
          { id: "profile", label: "debug-panel-page-profile", run: go("profile"), tip: "debug-panel-page-profile-tip" },
          {
            id: "notifications",
            label: "debug-panel-page-notifications",
            run: go("notificationSettings"),
            tip: "debug-panel-page-notifications-tip",
          },
          {
            id: "receipt",
            label: "debug-panel-page-receipt",
            run: go("receiptRecognitionSettings"),
            tip: "debug-panel-page-receipt-tip",
          },
          { id: "2fa", label: "debug-panel-page-2fa", run: go("2faSetup"), tip: "debug-panel-page-2fa-tip" },
          { id: "login", label: "debug-panel-page-login", run: go("login"), tip: "debug-panel-page-login-tip" },
        ],
        id: "go",
        kind: "actions",
        label: "debug-panel-pages-go",
        tip: "debug-panel-pages-go-tip",
        value: () => String(router.currentRoute.value.name ?? router.currentRoute.value.path),
      },
    ],
    title: "debug-panel-pages",
  };

  const session: DebugGroup = {
    id: "session",
    rows: [
      {
        actions: [
          {
            disabled: () => !userStore.user,
            id: "copy-id",
            label: "debug-panel-user-copy-id",
            run: async () => {
              if (!userStore.user) return;
              const copied = await copyToClipboard(userStore.user.id);
              if (copied) toast.success(t("debug-panel-copied"));
              else toast.error(t("debug-panel-copy-failed"));
            },
            tip: "debug-panel-user-copy-id-tip",
          },
          {
            id: "reload",
            label: "debug-panel-user-reload",
            run: () => userStore.fetchUserInfo(),
            tip: "debug-panel-user-reload-tip",
          },
        ],
        id: "user",
        kind: "actions",
        label: "debug-panel-user",
        tip: "debug-panel-user-tip",
        value: () => userStore.user?.userName ?? t("debug-panel-user-none"),
      },
      {
        actions: [
          {
            change: true,
            disabled: () => readTokenStatus().kind === "none",
            id: "expire",
            label: "debug-panel-token-expire",
            run: () => {
              expireAccessToken(localStorage);
              bump();
            },
            tip: "debug-panel-token-expire-tip",
          },
          {
            change: true,
            id: "sign-out",
            label: "debug-panel-token-sign-out",
            run: async () => {
              userStore.logout();
              bump();
              await router.push({ name: "login" });
            },
            tip: "debug-panel-token-sign-out-tip",
          },
        ],
        id: "token",
        kind: "actions",
        label: "debug-panel-token",
        tip: "debug-panel-token-tip",
        value: () => {
          const status = readTokenStatus();
          if (status.kind === "none") return t("debug-panel-token-none");
          if (status.kind === "expired") return t("debug-panel-token-expired");
          if (status.minutesLeft === null) return t("debug-panel-token-no-expiry");
          return t("debug-panel-token-minutes-left", { count: status.minutesLeft });
        },
      },
    ],
    title: "debug-panel-session",
  };

  const network: DebugGroup = {
    id: "network",
    rows: [
      {
        choices: API_SIMULATIONS.map((id) => ({
          id,
          label: `debug-panel-api-${id}`,
          tip: `debug-panel-api-${id}-tip`,
        })),
        choose: (id) => {
          apiSimulation.value = id === REAL ? "real" : (id as (typeof API_SIMULATIONS)[number]);
        },
        chosen: () => (apiSimulation.value === "real" ? REAL : apiSimulation.value),
        id: "api",
        kind: "state",
        label: "debug-panel-api",
        sim: "debug-panel-api",
        tip: "debug-panel-api-tip",
      },
      {
        actions: [
          {
            id: "refetch",
            label: "debug-panel-cache-refetch",
            run: () => queryCache.invalidateQueries(),
            tip: "debug-panel-cache-refetch-tip",
          },
        ],
        id: "cache",
        kind: "actions",
        label: "debug-panel-cache",
        tip: "debug-panel-cache-tip",
        value: () => t("debug-panel-cache-count", { count: queryCache.getEntries().length }),
      },
    ],
    title: "debug-panel-network",
  };

  const realLocale = bundleLocale(ctx.startBundles[0]);
  const language: DebugGroup = {
    id: "language",
    rows: [
      {
        choices: ctx.startBundles
          .map(bundleLocale)
          .filter((locale) => locale !== realLocale)
          .map((locale) => ({
            id: locale,
            label: `debug-panel-locale-${locale}`,
            tip: "debug-panel-locale-choice-tip",
          })),
        choose: (id) => {
          ctx.bundles.value = id === REAL ? [...ctx.startBundles] : bundlesWithFirst(ctx.startBundles, id);
        },
        chosen: () => {
          const first = [...ctx.bundles.value][0];
          return first && bundleLocale(first) !== realLocale ? bundleLocale(first) : REAL;
        },
        id: "locale",
        kind: "state",
        label: "debug-panel-locale",
        sim: "debug-panel-locale",
        tip: "debug-panel-locale-tip",
      },
    ],
    title: "debug-panel-language",
  };

  const failures: DebugGroup = {
    id: "failures",
    rows: [
      {
        id: "storage",
        kind: "switch",
        label: "debug-panel-storage-full",
        on: () => browserFailures.storage,
        set: setStorageBroken,
        sim: "debug-panel-storage-full",
        tip: "debug-panel-storage-full-tip",
      },
      {
        id: "clipboard",
        kind: "switch",
        label: "debug-panel-clipboard-denied",
        on: () => browserFailures.clipboard,
        set: setClipboardBroken,
        sim: "debug-panel-clipboard-denied",
        tip: "debug-panel-clipboard-denied-tip",
      },
    ],
    title: "debug-panel-failures",
  };

  const data: DebugGroup = {
    id: "data",
    rows: [
      {
        actions: [
          {
            change: true,
            id: "clear",
            label: "debug-panel-data-clear",
            reload: true,
            run: () => {
              clearStorageExcept(localStorage, [PANEL_PREFS_KEY]);
              sessionStorage.clear();
              location.reload();
            },
            tip: "debug-panel-data-clear-tip",
          },
        ],
        id: "local",
        kind: "actions",
        label: "debug-panel-data-local",
        tip: "debug-panel-data-local-tip",
      },
    ],
    title: "debug-panel-data",
  };

  return [pages, session, network, language, failures, data];
}
