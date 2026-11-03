import { afterEach, describe, expect, it, vi } from "vitest";

/** Loads gate.ts again with the env values that the test stubbed. */
async function loadGate() {
  vi.resetModules();
  return import("../gate");
}

describe("debug tools gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes the panel on the dev server", async () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_SPLITZ_DEBUG_TOOLS", undefined);
    const gate = await loadGate();
    expect(gate.debugTools).toBe(true);
    expect(gate.DebugPanel).not.toBeNull();
  });

  it("leaves the panel out of a production build without the flag", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_SPLITZ_DEBUG_TOOLS", undefined);
    const gate = await loadGate();
    expect(gate.debugTools).toBe(false);
    expect(gate.DebugPanel).toBeNull();
  });

  it("includes the panel in a production build when the flag is exactly 'true'", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_SPLITZ_DEBUG_TOOLS", "true");
    const gate = await loadGate();
    expect(gate.debugTools).toBe(true);
    expect(gate.DebugPanel).not.toBeNull();
  });

  it.each(["1", "yes", "TRUE", "false", ""])("ignores the flag value %j in a production build", async (flag) => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_SPLITZ_DEBUG_TOOLS", flag);
    const gate = await loadGate();
    expect(gate.debugTools).toBe(false);
  });
});
