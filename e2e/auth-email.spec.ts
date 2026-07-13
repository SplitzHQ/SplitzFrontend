import { expect, test, type Page } from "@playwright/test";

async function mockSignedOutBootstrap(page: Page) {
  await page.route("**/account/info", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ detail: "Unauthorized" }),
      contentType: "application/json",
      status: 401,
    });
  });
}

async function mockEmailCapabilities(page: Page, passwordResetEnabled: boolean) {
  await page.route("**/account/email-capabilities", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ emailEnabled: passwordResetEnabled, passwordResetEnabled }),
      contentType: "application/json",
      status: 200,
    });
  });
}

test.describe("auth email flows", () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedOutBootstrap(page);
  });

  test("login rate limit shows a countdown and requires manual retry", async ({ page }) => {
    let loginRequests = 0;
    await mockEmailCapabilities(page, false);
    await page.route("**/account/login", async (route) => {
      loginRequests += 1;
      await route.fulfill({
        body: JSON.stringify({
          code: "rate_limit_exceeded",
          detail: "Too many requests were received. Please try again later.",
          status: 429,
          title: "Too Many Requests",
        }),
        contentType: "application/problem+json",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "Retry-After",
          "Retry-After": "2",
        },
        status: 429,
      });
    });

    await page.goto("/login");
    await page.getByLabel("Email address").fill("person@example.com");
    await page.getByLabel("Password").fill("WrongPassword123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("status")).toContainText("2");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();

    await page.getByRole("button", { name: "Sign in" }).click({ force: true });
    expect(loginRequests).toBe(1);

    await expect(page.getByRole("status")).toBeHidden({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(loginRequests).toBe(1);

    await page.getByRole("button", { name: "Sign in" }).click();
    await expect.poll(() => loginRequests).toBe(2);
  });

  test("forgot-password disables recovery when email is unavailable", async ({ page }) => {
    await mockEmailCapabilities(page, false);

    await page.goto("/forgot-password");

    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await expect(page.getByText("Password recovery is unavailable")).toBeVisible();
    await expect(page.getByPlaceholder("Email address")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Send reset email" })).toBeDisabled();
  });

  test("forgot-password shows generic success after a mocked request", async ({ page }) => {
    await mockEmailCapabilities(page, true);
    await page.route("**/account/recovery/request", async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.goto("/forgot-password");
    await page.getByPlaceholder("Email address").fill("person@example.com");
    await page.locator('[data-test="forgot-password-submit"]').dispatchEvent("click");

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(
      page.getByText("If an account exists for that email, a password reset message will be sent.").first()
    ).toBeVisible();
  });

  test("recovery rate limit stays on the form and requires manual retry", async ({ page }) => {
    let recoveryRequests = 0;
    await mockEmailCapabilities(page, true);
    await page.route("**/account/recovery/request", async (route) => {
      recoveryRequests += 1;
      await route.fulfill({
        body: JSON.stringify({
          code: "rate_limit_exceeded",
          detail: "Too many requests were received. Please try again later.",
          status: 429,
          title: "Too Many Requests",
        }),
        contentType: "application/problem+json",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "Retry-After",
          "Retry-After": "2",
        },
        status: 429,
      });
    });

    await page.goto("/forgot-password");
    await page.getByPlaceholder("Email address").fill("person@example.com");
    await page.locator('[data-test="forgot-password-submit"]').dispatchEvent("click");

    await expect(page.getByRole("status")).toContainText("2");
    await expect(page.getByPlaceholder("Email address")).toBeEnabled();
    await expect(page.getByRole("button", { name: "Send reset email" })).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();

    await page.locator('[data-test="forgot-password-submit"]').dispatchEvent("click");
    expect(recoveryRequests).toBe(1);

    await expect(page.getByRole("status")).toBeHidden({ timeout: 5000 });
    expect(recoveryRequests).toBe(1);

    await page.locator('[data-test="forgot-password-submit"]').dispatchEvent("click");
    await expect.poll(() => recoveryRequests).toBe(2);
  });

  test("reset-password validates passwords and routes to login after success", async ({ page }) => {
    await page.route("**/account/recovery/reset", async (route) => {
      expect(await route.request().postDataJSON()).toEqual({
        email: "person@example.com",
        newPassword: "Password1234",
        resetCode: "reset-code",
      });
      await route.fulfill({ status: 200 });
    });

    await page.goto("/reset-password?email=person%40example.com&resetCode=reset-code");
    await page.getByPlaceholder("New password").fill("Password1234");
    await page.getByPlaceholder("Confirm password").fill("Different1!");
    await page.getByRole("button", { name: "Reset password" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();

    await page.getByPlaceholder("Confirm password").clear();
    await page.getByPlaceholder("Confirm password").fill("short1");
    await page.getByPlaceholder("New password").fill("short1");
    await page.getByRole("button", { name: "Reset password" }).click();

    await expect(
      page.getByText("Password must be at least 12 characters and include a lowercase letter and a number.")
    ).toBeVisible();

    await page.getByPlaceholder("New password").fill("Password1234");
    await page.getByPlaceholder("Confirm password").fill("Password1234");
    await expect(page.getByText("Passwords do not match")).toBeHidden();
    await page.locator('[data-test="reset-password-submit"]').dispatchEvent("click");

    await expect(page).toHaveURL(/\/login\?passwordReset=success$/);
  });

  test("confirm-email shows a recoverable invalid-link state", async ({ page }) => {
    await page.goto("/confirm-email");

    await expect(page.getByRole("heading", { name: "This confirmation link is incomplete" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a new confirmation email" })).toBeVisible();
  });

  test("confirm-email shows success after a mocked backend confirmation", async ({ page }) => {
    await page.route("**/account/confirmEmail?**", async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.goto("/confirm-email?userId=user-1&code=confirm-code");

    await expect(page.getByRole("heading", { name: "Email confirmed" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go to sign in" })).toBeVisible();
  });

  test("confirm-email shows an expired-link state after backend failure", async ({ page }) => {
    await page.route("**/account/confirmEmail?**", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ detail: "Invalid token" }),
        contentType: "application/json",
        status: 400,
      });
    });

    await page.goto("/confirm-email?userId=user-1&code=expired-code");

    await expect(page.getByRole("heading", { name: "This confirmation link expired" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a new confirmation email" })).toBeVisible();
  });
});
