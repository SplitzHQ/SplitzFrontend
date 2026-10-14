import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/libs/format-relative-time";

const now = new Date("2026-10-08T12:00:00Z");

describe("formatRelativeTime", () => {
  it("reads as now under a minute", () => {
    expect(formatRelativeTime(new Date("2026-10-08T11:59:30Z"), now, "en")).toBe("now");
  });

  it("picks the largest fitting unit", () => {
    expect(formatRelativeTime(new Date("2026-10-08T11:55:00Z"), now, "en")).toBe("5 minutes ago");
    expect(formatRelativeTime(new Date("2026-10-08T09:00:00Z"), now, "en")).toBe("3 hours ago");
    expect(formatRelativeTime(new Date("2026-10-07T12:00:00Z"), now, "en")).toBe("yesterday");
    expect(formatRelativeTime(new Date("2026-09-24T12:00:00Z"), now, "en")).toBe("2 weeks ago");
  });
});
