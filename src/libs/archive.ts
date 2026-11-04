/** An item that a group member can archive, such as a group, an invoice or an expense. */
export interface Archivable {
  isArchived: boolean;
}

/** Active and archived items from one list. */
export interface ArchivedPartition<T> {
  active: T[];
  archived: T[];
}

/**
 * Splits items into active and archived items. Both lists keep the input order.
 * Pages load archived items too, so they can show how many are hidden.
 */
export function partitionArchived<T extends Archivable>(items: readonly T[]): ArchivedPartition<T> {
  const active: T[] = [];
  const archived: T[] = [];
  for (const item of items) {
    (item.isArchived ? archived : active).push(item);
  }
  return { active, archived };
}
