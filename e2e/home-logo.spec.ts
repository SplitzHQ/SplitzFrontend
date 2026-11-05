/// <reference lib="dom" />
import { expect, test, type Page } from "@playwright/test";

/**
 * The logo of HomePage: the full-screen opening and the small motion after a tap. The API is mocked, so the test needs
 * no backend and no account.
 */
test.use({ hasTouch: true, viewport: { height: 812, width: 375 } });

const ME = { id: "me", photo: null, userName: "Ada" };

const OPENING = '[data-test="brand-opening"]';
const LOGO = '[data-test="brand-tap-logo"]';

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

  test("plays the small motion after a tap, and comes back to the word", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(OPENING)).toHaveCount(0, { timeout: 5000 });
    expect(await logoAnimations(page)).toBe(0);

    await page.locator(LOGO).click();
    expect(await logoAnimations(page)).toBeGreaterThan(0);

    await expect.poll(() => logoAnimations(page), { timeout: 5000 }).toBe(0);
    await expect(page.locator(`${LOGO} [data-part="mark"]`)).toHaveAttribute("opacity", "0");
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
