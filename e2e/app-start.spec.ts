/// <reference lib="dom" />
import { expect, test } from "@playwright/test";

/**
 * A cold start of the app on a page that is not HomePage. A signed-out person opens `/`, and the router sends them to
 * the sign-in page. The test needs no backend, because the sign-in page loads no data.
 */
test.use({ hasTouch: true, viewport: { height: 812, width: 375 } });

const OPENING = '[data-test="brand-opening"]';

test.describe("app start", () => {
  test("plays the opening over the sign-in page", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator(OPENING)).toBeVisible();
    await expect(page.locator(OPENING)).toHaveCount(0, { timeout: 5000 });
  });

  test("shows the first page without a page change", async ({ page }) => {
    // The observer starts before the app runs, so it sees each class that the page change adds.
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { pageChanges: string[] }).pageChanges = seen;
      new MutationObserver((records) => {
        for (const record of records) {
          const element = record.target as Element;
          const names = element.getAttribute("class") ?? "";
          if (names.includes("page-forward")) seen.push(names);
        }
      }).observe(document, { attributeFilter: ["class"], attributes: true, subtree: true });
    });

    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    // The opening lasts longer than a page change, so a page change has ended when the opening is gone.
    await expect(page.locator(OPENING)).toHaveCount(0, { timeout: 5000 });

    const changes = await page.evaluate(() => (window as unknown as { pageChanges: string[] }).pageChanges);
    expect(changes).toEqual([]);
  });
});
