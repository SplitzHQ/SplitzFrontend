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
    await page.route("**/account/forgotPassword", async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.goto("/forgot-password");
    await page.getByPlaceholder("Email address").fill("person@example.com");
    await page.getByRole("button", { name: "Send reset email" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(
      page.getByText("If an account exists for that email, a password reset message will be sent.").first()
    ).toBeVisible();
  });

  test("reset-password validates passwords and routes to login after success", async ({ page }) => {
    await page.route("**/account/resetPassword", async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.goto("/reset-password?email=person%40example.com&resetCode=reset-code");
    await page.getByPlaceholder("New password").fill("Passw0rd!");
    await page.getByPlaceholder("Confirm password").fill("Different1!");
    await page.getByRole("button", { name: "Reset password" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();

    await page.getByPlaceholder("Confirm password").clear();
    await page.getByPlaceholder("Confirm password").fill("Passw0rd!");
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
