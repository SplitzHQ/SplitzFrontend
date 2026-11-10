import { describe, expect, it, vi } from "vitest";

import { decimalStringMiddleware, identityAuthMiddleware } from "../middleware";
import { GroupApi } from "../openapi/apis/GroupApi";
import { SplitzBackendApi } from "../openapi/apis/SplitzBackendApi";
import { Configuration, type FetchAPI, type Middleware } from "../openapi/runtime";

const BASE_PATH = "https://api.example.test";

/** Returns a fetch that answers each request with this JSON text, and the mock to read the requests. */
function fakeFetch(body: string) {
  const fetchApi = vi.fn<FetchAPI>(
    async () => new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8" }, status: 200 })
  );
  return fetchApi;
}

function configuration(fetchApi: FetchAPI, middleware: Middleware[]) {
  return new Configuration({ basePath: BASE_PATH, fetchApi, middleware });
}

describe("decimalStringMiddleware", () => {
  // The backend writes decimals as JSON numbers, but the generated types say string (SPZ-123 page check).
  /** Returns the JSON text of a group with these balance summaries. */
  const groupWith = (balanceSummaries: unknown[]) =>
    JSON.stringify({ balanceSummaries, balances: [], id: "g1", members: [], transactionCount: 3 });
  const groupJson = groupWith([
    { currency: "USD", memberBalances: [{ amount: -12.5, userId: "u2" }], totalBalance: 40.25 },
  ]);

  it("gives each decimal field as a string", async () => {
    const api = new GroupApi(configuration(fakeFetch(groupJson), [decimalStringMiddleware]));

    const group = await api.getGroup({ groupId: "g1" });

    const summary = group.balanceSummaries![0];
    expect(typeof summary.totalBalance).toBe("string");
    expect(Number(summary.totalBalance)).toBe(40.25);
    expect(typeof summary.memberBalances[0].amount).toBe("string");
    expect(Number(summary.memberBalances[0].amount)).toBe(-12.5);
  });

  it("keeps the integer fields as numbers", async () => {
    const api = new GroupApi(configuration(fakeFetch(groupJson), [decimalStringMiddleware]));

    const group = await api.getGroup({ groupId: "g1" });

    expect(group.transactionCount).toBe(3);
  });

  it("keeps a decimal that is already a string", async () => {
    const body = groupWith([{ currency: "USD", memberBalances: [], totalBalance: "7.10" }]);
    const api = new GroupApi(configuration(fakeFetch(body), [decimalStringMiddleware]));

    const group = await api.getGroup({ groupId: "g1" });

    expect(group.balanceSummaries![0].totalBalance).toBe("7.10");
  });

  it("does not change a response that is not JSON", async () => {
    const response = new Response("amount: 5", { headers: { "Content-Type": "text/plain" } });

    const result = await decimalStringMiddleware.post!({
      fetch,
      init: {},
      response,
      url: `${BASE_PATH}/x`,
    });

    expect(result).toBeUndefined();
  });
});

describe("identityAuthMiddleware", () => {
  const twoFactorJson = JSON.stringify({
    isMachineRemembered: false,
    isTwoFactorEnabled: false,
    recoveryCodesLeft: 0,
    sharedKey: "KEY",
  });

  /** Returns the Authorization header of the first request of the mock. */
  const authorizationOf = (fetchApi: ReturnType<typeof fakeFetch>) =>
    new Headers(fetchApi.mock.calls[0][1]?.headers).get("Authorization");

  it("sends the bearer token to the 2FA endpoint", async () => {
    const fetchApi = fakeFetch(twoFactorJson);
    const api = new SplitzBackendApi(
      configuration(fetchApi, [identityAuthMiddleware(BASE_PATH, async () => "token-1")])
    );

    await api.accountManage2faPost({ twoFactorRequest: {} });

    expect(authorizationOf(fetchApi)).toBe("Bearer token-1");
  });

  it("does not send the token to a public Identity endpoint", async () => {
    const fetchApi = fakeFetch(JSON.stringify({ accessToken: "a", expiresIn: 1, refreshToken: "r" }));
    const accessToken = vi.fn(async () => "token-1");
    const api = new SplitzBackendApi(configuration(fetchApi, [identityAuthMiddleware(BASE_PATH, accessToken)]));

    await api.accountLoginPost({ loginRequest: { email: "a@example.test", password: "p" } });

    expect(authorizationOf(fetchApi)).toBeNull();
    expect(accessToken).not.toHaveBeenCalled();
  });

  it("does not add a header when the user has no token", async () => {
    const fetchApi = fakeFetch(twoFactorJson);
    const api = new SplitzBackendApi(configuration(fetchApi, [identityAuthMiddleware(BASE_PATH, async () => null)]));

    await api.accountManage2faPost({ twoFactorRequest: {} });

    expect(authorizationOf(fetchApi)).toBeNull();
  });
});
