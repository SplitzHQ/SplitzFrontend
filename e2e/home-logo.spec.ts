/// <reference lib="dom" />
import { expect, test, type Page } from "@playwright/test";

/**
 * E2E tests for the `HomePage` brand elements (`BrandOpeningOverlay` and `BrandTapWordmark`).
 * API requests are mocked so these tests run without a backend or user account.
 */
test.use({ hasTouch: true, viewport: { height: 812, width: 375 } });

const ME = { id: "me", photo: null, userName: "Ada" };

const OPENING = '[data-test="brand-opening"]';
const LOGO = '[data-test="brand-tap-wordmark"]';

async function mockSignedIn(page: Page) {
  await page.addInitScript(() => localStorage.setItem("accessToken", "test-token"));
  await page.route(
    (url) => url.port === "5119",
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      await route.fulfill({
        body: JSON.stringify(path.endsWith("/account/info") ? ME : []),
        contentType: "application/json",
        headers: { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*" },
        status: 200,
      });
    }
  );
}

/** Returns the number of animations on the logo. */
const logoAnimations = (page: Page) =>
  page.locator(LOGO).evaluate((element) => element.getAnimations({ subtree: true }).length);

test.describe("home logo", () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedIn(page);
  });

  test("plays the opening over the page, and removes it", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(OPENING)).toBeVisible();
    await expect(page.locator(OPENING)).toHaveCSS("pointer-events", "none");
    await expect(page.locator(`h1 ${LOGO}`)).toBeVisible();
    await expect(page.locator(OPENING)).toHaveCount(0, { timeout: 5000 });
    await expect(page.getByRole("img", { name: "Splitz" })).toBeVisible();
  });

  test("plays the tap animation and returns to the wordmark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(OPENING)).toHaveCount(0, { timeout: 5000 });
    expect(await logoAnimations(page)).toBe(0);

    await page.locator(LOGO).click();
    expect(await logoAnimations(page)).toBeGreaterThan(0);

    await expect.poll(() => logoAnimations(page), { timeout: 5000 }).toBe(0);
    await expect(page.locator(`${LOGO} [data-part="glyph"]`)).toHaveAttribute("opacity", "0");
  });

  test("shows no opening and no motion under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.locator(LOGO)).toBeVisible();
    await expect(page.locator(OPENING)).toHaveCount(0);

    await page.locator(LOGO).click();
    expect(await logoAnimations(page)).toBe(0);
  });
});
