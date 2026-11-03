import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { activeSims, REAL, rowSearchKeys, type DebugGroup, type DebugRow } from "../registry";

const mode = ref(REAL);
const on = ref(false);
const choose = vi.fn((id: string) => (mode.value = id));
const set = vi.fn((value: boolean) => (on.value = value));

const stateRow: DebugRow = {
  choices: [{ id: "slow", label: "label-slow", tip: "tip-slow" }],
  choose,
  chosen: () => mode.value,
  id: "api",
  kind: "state",
  label: "label-api",
  sim: "sim-api",
  tip: "tip-api",
};
const simSwitch: DebugRow = {
  id: "storage",
  kind: "switch",
  label: "label-storage",
  on: () => on.value,
  set,
  sim: "sim-storage",
  tip: "t",
};
const plainSwitch: DebugRow = {
  id: "plain",
  kind: "switch",
  label: "label-plain",
  on: () => true,
  set: vi.fn(),
  tip: "t",
};
const actionsRow: DebugRow = {
  actions: [{ id: "go", label: "label-go", run: vi.fn(), tip: "tip-go" }],
  id: "go",
  kind: "actions",
  label: "label-actions",
  tip: "t",
};

const groups: DebugGroup[] = [{ id: "g", rows: [stateRow, simSwitch, plainSwitch, actionsRow], title: "title" }];

describe("activeSims", () => {
  it("is empty when every simulation is off", () => {
    mode.value = REAL;
    on.value = false;
    expect(activeSims(groups)).toEqual([]);
  });

  it("lists state choices and simulation switches in panel order, but not plain switches", () => {
    mode.value = "slow";
    on.value = true;
    const sims = activeSims(groups);
    expect(sims.map((s) => [s.key, s.label, s.choice])).toEqual([
      ["g.api", "sim-api", "label-slow"],
      ["g.storage", "sim-storage", undefined],
    ]);
  });

  it("undoes a simulation back to its real state", () => {
    mode.value = "slow";
    on.value = true;
    for (const sim of activeSims(groups)) sim.undo();
    expect(choose).toHaveBeenLastCalledWith(REAL);
    expect(set).toHaveBeenLastCalledWith(false);
    expect(activeSims(groups)).toEqual([]);
  });
});

describe("rowSearchKeys", () => {
  it("uses the row label and the labels of its choices or actions, not tips", () => {
    expect(rowSearchKeys(stateRow)).toEqual(["label-api", "label-slow"]);
    expect(rowSearchKeys(actionsRow)).toEqual(["label-actions", "label-go"]);
    expect(rowSearchKeys(simSwitch)).toEqual(["label-storage"]);
  });
});
