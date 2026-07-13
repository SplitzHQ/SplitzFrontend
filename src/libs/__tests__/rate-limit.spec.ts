import { describe, expect, it } from "vitest";

import { ResponseError } from "@/backend/openapi";
import { getRateLimitExpiry } from "@/libs/rate-limit";

describe("getRateLimitExpiry", () => {
  const now = Date.UTC(2026, 6, 12, 12, 0, 0);

  it("parses Retry-After delta seconds from a 429 response", () => {
    const error = new ResponseError(new Response(null, { headers: { "Retry-After": "12" }, status: 429 }));

    expect(getRateLimitExpiry(error, now)).toBe(now + 12_000);
  });

  it("parses Retry-After HTTP dates from a 429 response", () => {
    const retryAt = new Date(now + 30_000).toUTCString();
    const error = new ResponseError(new Response(null, { headers: { "Retry-After": retryAt }, status: 429 }));

    expect(getRateLimitExpiry(error, now)).toBe(Date.parse(retryAt));
  });

  it.each([
    undefined,
    "",
    "invalid",
    "0",
    "-1",
    "+2",
    "0.5",
    "1e2",
    "99999999999999999999",
    "+2099",
    "12/31/2099",
    "2099-12-31",
    new Date(now - 30_000).toUTCString(),
  ])("uses the fallback for an invalid Retry-After value %s", (value) => {
    const headers = value === undefined ? undefined : { "Retry-After": value };
    const error = new ResponseError(new Response(null, { headers, status: 429 }));

    expect(getRateLimitExpiry(error, now)).toBe(now + 60_000);
  });

  it("ignores non-429 generated errors", () => {
    const error = new ResponseError(new Response(null, { status: 401 }));

    expect(getRateLimitExpiry(error, now)).toBeNull();
  });
});
