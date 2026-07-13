import { ResponseError } from "@/backend/openapi";

const fallbackRetryAfterMilliseconds = 60_000;

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

    const retryAt = Date.parse(retryAfter);
    if (Number.isFinite(retryAt) && new Date(retryAt).toUTCString() === retryAfter && retryAt > now) {
      return retryAt;
    }
  }

  return now + fallbackRetryAfterMilliseconds;
}
