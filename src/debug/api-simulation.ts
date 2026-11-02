import { ref } from "vue";

/**
 * Fake API conditions for the debug panel. Only requests to the Splitz API change; other requests (fonts, assets)
 * stay real.
 *
 * - `real`: no change.
 * - `slow`: each request waits `SLOW_API_DELAY_MS`, then goes to the server.
 * - `offline`: each request fails as a network error, as `fetch` does without a connection.
 * - `server-error`: each request gets a 500 response.
 * - `rate-limit`: each request gets a 429 response with `Retry-After`.
 */
export type ApiSimulation = "real" | "slow" | "offline" | "server-error" | "rate-limit";

/** The simulations in panel order, without `real`. */
export const API_SIMULATIONS = ["slow", "offline", "server-error", "rate-limit"] as const satisfies ApiSimulation[];

export const SLOW_API_DELAY_MS = 2000;
export const RATE_LIMIT_RETRY_AFTER_SECONDS = 30;

/** The simulation that is on now. The panel writes it; the patched `fetch` reads it on each request. */
export const apiSimulation = ref<ApiSimulation>("real");

/** Returns the URL of any `fetch` input as a string. */
function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** A JSON problem response, in the shape that the backend sends. */
function problemResponse(status: number, title: string, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ detail: "Simulated by the Splitz debug panel.", status, title }), {
    headers: { "Content-Type": "application/problem+json", ...headers },
    status,
  });
}

/**
 * Wraps `realFetch` so that requests to `apiBase` follow the current simulation.
 *
 * @param realFetch - The `fetch` to call for real requests.
 * @param getMode - Returns the simulation to use for a request.
 * @param apiBase - Only URLs that start with this value change.
 * @param delay - Waits for a number of milliseconds. Tests give a fake one.
 */
export function createSimulatedFetch(
  realFetch: typeof fetch,
  getMode: () => ApiSimulation,
  apiBase: string,
  delay: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
): typeof fetch {
  return async (input, init) => {
    const mode = getMode();
    if (mode === "real" || !requestUrl(input).startsWith(apiBase)) return realFetch(input, init);

    switch (mode) {
      case "slow":
        await delay(SLOW_API_DELAY_MS);
        return realFetch(input, init);
      case "offline":
        // The same error type and message that Chrome gives when there is no network.
        throw new TypeError("Failed to fetch");
      case "server-error":
        return problemResponse(500, "Internal Server Error");
      case "rate-limit":
        return problemResponse(429, "Too Many Requests", {
          "Retry-After": String(RATE_LIMIT_RETRY_AFTER_SECONDS),
        });
    }
  };
}

let installed = false;

/**
 * Replaces `globalThis.fetch` once with a wrapper that reads `apiSimulation`. The generated API client looks up
 * `fetch` on each call, so it uses the wrapper. While the mode is `real`, the wrapper calls the real `fetch`.
 */
export function installApiSimulation(apiBase: string): void {
  if (installed) return;
  installed = true;
  globalThis.fetch = createSimulatedFetch(globalThis.fetch.bind(globalThis), () => apiSimulation.value, apiBase);
}
