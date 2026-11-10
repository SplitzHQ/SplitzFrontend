import type { Middleware } from "./openapi/runtime";

/**
 * The JSON keys of the decimal fields that the backend sends. The OpenAPI document gives these fields the type string,
 * so the generated client types say `string`. But the backend writes them as JSON numbers. Add a key here when the
 * backend adds a decimal field with a new name.
 */
export const DECIMAL_FIELDS: ReadonlySet<string> = new Set(["amount", "balance", "paid", "remaining", "totalBalance"]);

/** The third argument of a `JSON.parse` reviver. Browsers with JSON source text access give the source of the value. */
interface ReviverContext {
  source?: string;
}

/**
 * Returns a decimal number as a string. It uses the source text when the browser gives it, so "12.50" stays "12.50" and a
 * long value keeps all of its digits.
 */
function reviveDecimal(this: unknown, key: string, value: unknown, context?: ReviverContext): unknown {
  if (typeof value !== "number" || !DECIMAL_FIELDS.has(key)) return value;
  return context?.source ?? String(value);
}

/**
 * Changes each decimal field of a JSON response from a number to a string, so the data agrees with the generated types.
 * Vue then gets a string for each `string` prop of an amount. Other responses do not change.
 */
export const decimalStringMiddleware: Middleware = {
  post: async ({ response }) => {
    if (!response.headers.get("content-type")?.includes("json")) return;

    const text = await response.text();
    if (!text) return;
    let data: unknown;
    try {
      data = JSON.parse(text, reviveDecimal as (this: unknown, key: string, value: unknown) => unknown);
    } catch {
      // The generated client reports the JSON error when it reads the body.
      return;
    }
    const { headers, status, statusText } = response;
    return new Response(JSON.stringify(data), { headers, status, statusText });
  },
};

/**
 * The path prefix of the ASP.NET Core Identity endpoints that need a signed-in user (`/manage/info` and `/manage/2fa`).
 * The OpenAPI document gives these endpoints no security, so the generated client sends them without the Authorization
 * header.
 */
const SIGNED_IN_IDENTITY_PATH = "/account/manage/";

/**
 * Adds the bearer token to each request to an Identity endpoint that needs a signed-in user. A request that has an
 * Authorization header or a request without a token does not change.
 */
export function identityAuthMiddleware(
  basePath: string,
  accessToken: () => Promise<string | null | undefined>
): Middleware {
  return {
    pre: async ({ url, init }) => {
      if (!url.startsWith(`${basePath}${SIGNED_IN_IDENTITY_PATH}`)) return;

      const headers = new Headers(init.headers);
      if (headers.has("Authorization")) return;
      const token = await accessToken();
      if (!token) return;

      headers.set("Authorization", `Bearer ${token}`);
      return { url, init: { ...init, headers } };
    },
  };
}
