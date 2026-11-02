import { readFileSync } from "node:fs";
import path from "node:path";

import { FluentBundle, type FluentBundle as Bundle } from "@fluent/bundle";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ref, shallowRef } from "vue";

import { apiSimulation } from "../api-simulation";
import { REAL, type DebugGroup } from "../registry";
import { createDebugGroups, type DebugContext } from "../sections";

vi.mock("vue-sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const en = new FluentBundle("en");
const zh = new FluentBundle("zh-cn");

function setup() {
  const bundles = shallowRef<Iterable<Bundle>>([en, zh]);
  const push = vi.fn();
  const ctx = {
    bundles,
    queryCache: { getEntries: () => [], invalidateQueries: vi.fn() },
    router: { currentRoute: ref({ name: "home", path: "/" }), push },
    startBundles: [en, zh],
    t: (key: string) => key,
    tick: ref(0),
    userStore: { fetchUserInfo: vi.fn(), logout: vi.fn(), user: null },
  } as unknown as DebugContext;
  return { bundles, groups: createDebugGroups(ctx), push };
}

function row(groups: DebugGroup[], groupId: string, rowId: string) {
  const found = groups.find((g) => g.id === groupId)?.rows.find((r) => r.id === rowId);
  if (!found) throw new Error(`no row ${groupId}.${rowId}`);
  return found;
}

/** Every message key that the groups use. */
function usedKeys(groups: DebugGroup[]): string[] {
  return groups.flatMap((group) => [
    group.title,
    ...group.rows.flatMap((r) => {
      const items = r.kind === "state" ? r.choices : r.kind === "actions" ? r.actions : [];
      const sim = r.kind === "actions" ? [] : r.sim ? [r.sim] : [];
      return [r.label, r.tip, ...sim, ...items.flatMap((i) => [i.label, i.tip])];
    }),
  ]);
}

describe("createDebugGroups", () => {
  afterEach(() => {
    apiSimulation.value = "real";
  });

  it("uses only message keys that exist in the English strings", () => {
    const ftl = readFileSync(path.join(import.meta.dirname, "../../locales/en/debug/debug-panel.ftl"), "utf8");
    const ids = new Set([...ftl.matchAll(/^([a-z][\w-]*) =/gm)].map((m) => m[1]));
    const missing = usedKeys(setup().groups).filter((key) => !ids.has(key));
    expect(missing).toEqual([]);
  });

  it("switches the API simulation through the state row", () => {
    const api = row(setup().groups, "network", "api");
    if (api.kind !== "state") throw new Error("api is not a state row");
    api.choose("offline");
    expect(apiSimulation.value).toBe("offline");
    expect(api.chosen()).toBe("offline");
    api.choose(REAL);
    expect(apiSimulation.value).toBe("real");
    expect(api.chosen()).toBe(REAL);
  });

  it("switches the app language by reordering the bundles", () => {
    const { bundles, groups } = setup();
    const locale = row(groups, "language", "locale");
    if (locale.kind !== "state") throw new Error("locale is not a state row");
    expect(locale.choices.map((c) => c.id)).toEqual(["zh-cn"]);
    locale.choose("zh-cn");
    expect([...bundles.value]).toEqual([zh, en]);
    expect(locale.chosen()).toBe("zh-cn");
    locale.choose(REAL);
    expect([...bundles.value]).toEqual([en, zh]);
    expect(locale.chosen()).toBe(REAL);
  });

  it("navigates by route name", async () => {
    const { groups, push } = setup();
    const go = row(groups, "pages", "go");
    if (go.kind !== "actions") throw new Error("go is not an actions row");
    await go.actions.find((a) => a.id === "profile")!.run();
    expect(push).toHaveBeenCalledWith({ name: "profile" });
  });
});
