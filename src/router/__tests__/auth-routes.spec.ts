import { afterEach, describe, expect, it } from "vitest";
import type { RouteLocationNormalized } from "vue-router";

import router, { publicRoutes, requireSignIn } from "../index";

describe("auth callback routes", () => {
  it("exposes confirm email as a public callback route", () => {
    const confirmEmailRoute = router.resolve("/confirm-email?userId=user-1&code=confirm-code");

    expect(confirmEmailRoute.name).toBe("confirmEmail");
    expect(publicRoutes).toContain("confirmEmail");
  });

  it("exposes forgot password as a public auth route", () => {
    const forgotPasswordRoute = router.resolve("/forgot-password");

    expect(forgotPasswordRoute.name).toBe("forgotPassword");
    expect(publicRoutes).toContain("forgotPassword");
  });

  it("exposes reset password as a public callback route", () => {
    const resetPasswordRoute = router.resolve("/reset-password?email=person@example.com&resetCode=reset-code");

    expect(resetPasswordRoute.name).toBe("resetPassword");
    expect(publicRoutes).toContain("resetPassword");
  });
});

/** Returns the route of a path. Each route of the app has a name, so the resolved route works as a guard target. */
const at = (path: string) => router.resolve(path) as RouteLocationNormalized;

describe("requireSignIn", () => {
  afterEach(() => localStorage.clear());

  it("sends a user without a token to the sign-in page", () => {
    expect(requireSignIn(at("/"))).toEqual({ name: "login" });
  });

  it("lets a user without a token open a public route", () => {
    expect(requireSignIn(at("/register"))).toBeUndefined();
  });

  it("lets a signed-in user open a route", () => {
    localStorage.setItem("accessToken", "token-1");

    expect(requireSignIn(at("/"))).toBeUndefined();
  });

  it("does not take the deprecated next callback", () => {
    // Vue Router calls a guard in the deprecated next() mode when the guard declares three parameters.
    expect(requireSignIn.length).toBeLessThan(3);
  });
});
