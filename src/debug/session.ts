/**
 * Helpers for the debug panel's Session group. They read and change the tokens that `stores/user.ts` and
 * `backend/config.ts` keep in `localStorage`.
 */

const ACCESS_TOKEN_EXPIRATION_KEY = "accessTokenExpiration";

/** Returns the access token expiry (ms since epoch), or null when there is no valid value. */
export function readTokenExpiry(storage: Pick<Storage, "getItem">): number | null {
  const raw = storage.getItem(ACCESS_TOKEN_EXPIRATION_KEY);
  if (raw === null) return null;
  const expiry = Number.parseInt(raw, 10);
  return Number.isFinite(expiry) ? expiry : null;
}

/**
 * Sets the access token expiry to a time in the past. The next API call then refreshes the token with the refresh
 * token, so you can test the refresh path without a wait.
 *
 * @returns false when there is no access token to expire.
 */
export function expireAccessToken(storage: Pick<Storage, "getItem" | "setItem">, now = Date.now()): boolean {
  if (storage.getItem("accessToken") === null) return false;
  storage.setItem(ACCESS_TOKEN_EXPIRATION_KEY, String(now - 1000));
  return true;
}

/**
 * The token state that the Session row shows. `minutesLeft` is null for a token without an expiry:
 * backend/config.ts uses such a token as it is.
 */
export type TokenStatus = { kind: "none" } | { kind: "expired" } | { kind: "valid"; minutesLeft: number | null };

/** Turns the stored expiry into the state that the Session row shows. */
export function tokenStatus(storage: Pick<Storage, "getItem">, now = Date.now()): TokenStatus {
  if (storage.getItem("accessToken") === null) return { kind: "none" };
  const expiry = readTokenExpiry(storage);
  if (expiry === null) return { kind: "valid", minutesLeft: null };
  if (expiry <= now) return { kind: "expired" };
  return { kind: "valid", minutesLeft: Math.ceil((expiry - now) / 60_000) };
}

/**
 * Removes every key from `storage` except the keys in `keep`. The panel keeps its own layout so that it does not
 * close after the reload.
 */
export function clearStorageExcept(storage: Storage, keep: readonly string[]): void {
  const doomed: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key !== null && !keep.includes(key)) doomed.push(key);
  }
  for (const key of doomed) storage.removeItem(key);
}
