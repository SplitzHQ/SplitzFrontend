import { describe, expect, it, vi } from "vitest";

import {
  createSimulatedFetch,
  RATE_LIMIT_RETRY_AFTER_SECONDS,
  SLOW_API_DELAY_MS,
  type ApiSimulation,
} from "../api-simulation";

const API = "https://api.splitz.test";

function setup(mode: ApiSimulation) {
  const realFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response("real", { status: 200 }));
  const delay = vi.fn<(ms: number) => Promise<void>>().mockResolvedValue(undefined);
  const simulated = createSimulatedFetch(realFetch, () => mode, API, delay);
  return { delay, realFetch, simulated };
}

describe("createSimulatedFetch", () => {
  it("passes every request through while the mode is real", async () => {
    const { realFetch, simulated } = setup("real");
    const response = await simulated(`${API}/group`, { method: "GET" });
    expect(await response.text()).toBe("real");
    expect(realFetch).toHaveBeenCalledWith(`${API}/group`, { method: "GET" });
  });

  it("leaves requests outside the API untouched", async () => {
    const { realFetch, simulated } = setup("offline");
    await expect(simulated("https://fonts.googleapis.com/css")).resolves.toBeInstanceOf(Response);
    expect(realFetch).toHaveBeenCalledTimes(1);
  });

  it("reads the URL from URL and Request inputs", async () => {
    const { realFetch, simulated } = setup("server-error");
    expect((await simulated(new URL(`${API}/a`))).status).toBe(500);
    expect((await simulated(new Request(`${API}/b`))).status).toBe(500);
    expect(realFetch).not.toHaveBeenCalled();
  });

  it("waits before a real request in slow mode", async () => {
    const { delay, realFetch, simulated } = setup("slow");
    await simulated(`${API}/group`);
    expect(delay).toHaveBeenCalledWith(SLOW_API_DELAY_MS);
    expect(realFetch).toHaveBeenCalledTimes(1);
  });

  it("throws a network error in offline mode", async () => {
    const { realFetch, simulated } = setup("offline");
    await expect(simulated(`${API}/group`)).rejects.toThrow(TypeError);
    expect(realFetch).not.toHaveBeenCalled();
  });

  it("answers with a 500 problem response in server-error mode", async () => {
    const { simulated } = setup("server-error");
    const response = await simulated(`${API}/group`);
    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Type")).toBe("application/problem+json");
    expect(await response.json()).toMatchObject({ status: 500 });
  });

  it("answers with a 429 and Retry-After in rate-limit mode", async () => {
    const { simulated } = setup("rate-limit");
    const response = await simulated(`${API}/group`);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe(String(RATE_LIMIT_RETRY_AFTER_SECONDS));
  });

  it("reads the mode on each request", async () => {
    let mode: ApiSimulation = "server-error";
    const realFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response("real"));
    const simulated = createSimulatedFetch(realFetch, () => mode, API);
    expect((await simulated(`${API}/a`)).status).toBe(500);
    mode = "real";
    expect(await (await simulated(`${API}/a`)).text()).toBe("real");
  });
});
