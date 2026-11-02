/*
 * The shape of the debug panel content. `sections.ts` makes the groups; `DebugPanel.vue` draws them.
 *
 * Put every new debug control here as a row in a group, not as a page or a menu item in the app. A row is one of
 * three kinds, and each kind has one look:
 *   state:   one choice from a list. The first choice is always "Real" (no simulation). Any other choice is a
 *            simulation, and the strip at the top of the screen shows it with an undo button.
 *   actions: buttons that do something one time. A `change` action changes what this browser keeps; a `reload`
 *            action reloads the page.
 *   switch:  on or off. A switch with `sim` is a simulation, and the strip shows it.
 *
 * All labels and tips are Fluent message keys (src/locales/<locale>/debug-panel.ftl), so search can match each
 * locale.
 */

/** The ID of the "Real" choice that every state row starts with. */
export const REAL = "real";

/** One choice of a state row. */
export interface DebugChoice {
  id: string;
  /** Message key. */
  label: string;
  /** Message key for the hover text: what the choice changes and where to look. */
  tip: string;
}

/** One button of an actions row. */
export interface DebugAction {
  id: string;
  label: string;
  tip: string;
  /** Changes what this browser keeps (shown in the error color). */
  change?: boolean;
  /** Reloads the page. */
  reload?: boolean;
  run: () => unknown;
  disabled?: () => boolean;
}

interface DebugRowBase {
  id: string;
  label: string;
  tip: string;
  /** A short read-out after the label, already formatted. Read in a computed, so it updates. */
  value?: () => string | undefined;
}

export type DebugRow = DebugRowBase &
  (
    | {
        kind: "state";
        /** The choices after "Real". */
        choices: DebugChoice[];
        /** The ID of the choice that is on now, or `REAL`. */
        chosen: () => string;
        choose: (id: string) => void;
        /** Message key: the name of this simulation in the strip. */
        sim: string;
      }
    | { kind: "actions"; actions: DebugAction[] }
    | {
        kind: "switch";
        on: () => boolean;
        set: (on: boolean) => void;
        /** Message key: the name of this simulation in the strip. Leave it out for a switch that is not a simulation. */
        sim?: string;
      }
  );

export interface DebugGroup {
  id: string;
  /** Message key. */
  title: string;
  rows: DebugRow[];
}

/** A simulation that is on now, as the strip shows it. */
export interface ActiveSim {
  /** "<group>.<row>" */
  key: string;
  /** Message key of the simulation name. */
  label: string;
  /** Message key of the chosen state, for state rows. */
  choice?: string;
  undo: () => void;
}

/** Lists every simulation that is on now, in panel order. Call it in a computed so that it updates. */
export function activeSims(groups: readonly DebugGroup[]): ActiveSim[] {
  const active: ActiveSim[] = [];
  for (const group of groups) {
    for (const row of group.rows) {
      const key = `${group.id}.${row.id}`;
      if (row.kind === "state") {
        const choice = row.choices.find((c) => c.id === row.chosen());
        if (choice) active.push({ choice: choice.label, key, label: row.sim, undo: () => row.choose(REAL) });
      } else if (row.kind === "switch" && row.sim && row.on()) {
        active.push({ key, label: row.sim, undo: () => row.set(false) });
      }
    }
  }
  return active;
}

/**
 * Returns the message keys that search uses to find a row: its label and the labels of its choices and actions.
 * Tips are left out, because their long sentences match by chance.
 */
export function rowSearchKeys(row: DebugRow): string[] {
  const items = row.kind === "state" ? row.choices : row.kind === "actions" ? row.actions : [];
  return [row.label, ...items.map((item) => item.label)];
}
