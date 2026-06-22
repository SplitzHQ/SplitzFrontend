import { describe, expect, it } from "vitest";

import router, { publicRoutes } from "../index";

describe("auth callback routes", () => {
  it("exposes confirm email as a public callback route", () => {
    const confirmEmailRoute = router.resolve("/confirm-email?userId=user-1&code=confirm-code");

    expect(confirmEmailRoute.name).toBe("confirmEmail");
    expect(publicRoutes).toContain("confirmEmail");
  });
});
