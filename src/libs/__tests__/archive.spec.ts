import { describe, expect, it } from "vitest";

import { partitionArchived } from "../archive";

describe("partitionArchived", () => {
  it("splits items and keeps their order", () => {
    const items = [
      { id: 1, isArchived: false },
      { id: 2, isArchived: true },
      { id: 3, isArchived: false },
      { id: 4, isArchived: true },
    ];

    const { active, archived } = partitionArchived(items);

    expect(active.map((item) => item.id)).toEqual([1, 3]);
    expect(archived.map((item) => item.id)).toEqual([2, 4]);
  });

  it("returns empty lists for no items", () => {
    expect(partitionArchived([])).toEqual({ active: [], archived: [] });
  });
});
