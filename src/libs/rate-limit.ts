import { ResponseError } from "@/backend/openapi";

const fallbackRetryAfterMilliseconds = 60_000;

/**
 * Returns the absolute time (ms since epoch) at which a rate-limited request may be retried, or
 * null when `error` is not a 429 response. A 429 without a usable Retry-After header falls back
 * to one minute.
 */
export function getRateLimitExpiry(error: unknown, now = Date.now()): number | null {
  if (!(error instanceof ResponseError) || error.response.status !== 429) {
    return null;
  }

  const retryAfter = error.response.headers.get("Retry-After")?.trim();
  if (retryAfter) {
    if (/^\d+$/.test(retryAfter)) {
      const deltaSeconds = Number.parseInt(retryAfter, 10);
      const retryAt = now + deltaSeconds * 1000;
      if (Number.isSafeInteger(deltaSeconds) && deltaSeconds > 0 && Number.isFinite(retryAt)) {
        return retryAt;
      }
    }

    // Only the IMF-fixdate form ("Sun, 06 Nov 1994 08:49:37 GMT") is accepted. Round-tripping through
    // toUTCString() guards against Date.parse() leniently accepting strings that are not HTTP dates.
    const retryAt = Date.parse(retryAfter);
    if (Number.isFinite(retryAt) && new Date(retryAt).toUTCString() === retryAfter && retryAt > now) {
      return retryAt;
    }
  }

  return now + fallbackRetryAfterMilliseconds;
}
