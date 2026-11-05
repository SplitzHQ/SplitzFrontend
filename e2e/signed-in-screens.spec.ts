/// <reference lib="dom" />
import { devices, expect, test, type Page } from "@playwright/test";

/**
 * A smoke test of the screens behind sign-in. The API is mocked, so the test needs no backend and no account.
 * Each screen must render on a phone with one main landmark and one h1, with no script error and no sideways scroll.
 */
test.use({ ...devices["iPhone 13 Mini"], defaultBrowserType: "chromium" });

const ME = { id: "me", photo: null, userName: "Ada" };
const FRIEND = { id: "friend", photo: null, userName: "Grace" };
const GROUP_ID = "group-1";
const TRANSACTION_ID = "transaction-1";
const INVOICE_ID = "invoice-1";
const TIME = "2026-11-01T10:00:00Z";

const TRANSACTION = {
  amount: "50.00",
  balances: [
    { balance: "25.00", transactionId: TRANSACTION_ID, user: ME, userId: ME.id },
    { balance: "-25.00", transactionId: TRANSACTION_ID, user: FRIEND, userId: FRIEND.id },
  ],
  createTime: TIME,
  currency: "USD",
  groupId: GROUP_ID,
  icon: "restaurant",
  name: "Dinner",
  tags: [],
  transactionId: TRANSACTION_ID,
  transactionTime: TIME,
};

const GROUP = {
  balanceSummaries: [],
  balances: [
    { balance: "25.00", currency: "USD", groupId: GROUP_ID, user: ME },
    { balance: "-25.00", currency: "USD", groupId: GROUP_ID, user: FRIEND },
  ],
  groupId: GROUP_ID,
  lastActivityTime: TIME,
  members: [ME, FRIEND],
  membersIdHash: "hash",
  name: "Trip to Kyoto",
  photo: null,
  transactionCount: 1,
};

const INVOICE = {
  createTime: TIME,
  createdBy: ME,
  currency: "USD",
  debts: [],
  groupId: GROUP_ID,
  invoiceId: INVOICE_ID,
  name: "Kyoto",
  settlements: [],
  status: "Open",
  transactions: [TRANSACTION],
};

/** The mocked answers, from the most specific path to the least specific path. An unknown path returns an empty list. */
const ANSWERS: [RegExp, unknown][] = [
  [/\/account$/, { ...ME, balances: [], email: "ada@example.com", friends: [], groups: [] }],
  [/\/account\/email-capabilities/, { emailEnabled: true, passwordResetEnabled: true }],
  [/\/account\/friend\/request/, { incoming: [], outgoing: [] }],
  [/\/notification\/summary/, { pendingRequests: 0, unreadActivity: 0, unreadRequests: 0 }],
  [
    /\/llmsettings/,
    {
      available: false,
      customProviderAllowed: true,
      customProviderEnabled: false,
      hasApiKey: false,
      serverProviderAvailable: false,
    },
  ],
  [/\/receiptrecognition\/capabilities|\/receipt\/capabilities/, { available: false }],
  [/\/group\/join\//, { groupId: GROUP_ID, memberCount: 2, name: "Trip to Kyoto", photo: null }],
  [/\/group\/[^/]+\/transactions/, [TRANSACTION]],
  [/\/group\/[^/]+\/invoices/, []],
  [/\/group\/[^/]+$/, GROUP],
  [/\/group$/, [GROUP]],
  [/\/invoice\/[^/]+$/, INVOICE],
  [/\/transaction\/[^/]+$/, TRANSACTION],
];

/** Signs in with a fake token and answers each API request from `ANSWERS`. */
async function mockSignedIn(page: Page) {
  await page.addInitScript(() => localStorage.setItem("accessToken", "test-token"));
  await page.route(
    (url) => url.port === "5119",
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      const answer = ANSWERS.find(([pattern]) => pattern.test(path))?.[1] ?? [];
      await route.fulfill({
        body: JSON.stringify(answer),
        contentType: "application/json",
        headers: { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*" },
        status: 200,
      });
    }
  );
}

const SCREENS = [
  ["group detail", `/group/${GROUP_ID}`],
  ["group notifications", `/group/${GROUP_ID}/notifications`],
  ["create group", "/group/create"],
  ["transaction detail", `/group/${GROUP_ID}/transaction/${TRANSACTION_ID}`],
  ["invoice detail", `/group/${GROUP_ID}/invoice/${INVOICE_ID}`],
  ["join group", "/group/join/link-1"],
  ["enter amount", "/new-expense/enter-amount"],
  ["select people", "/new-expense/select-people"],
  ["select split method", "/new-expense/select-split-method"],
  ["review and complete", "/new-expense/review-and-complete"],
  ["profile", "/profile"],
  ["notification settings", "/profile/notifications"],
  ["receipt recognition", "/profile/receipt-recognition"],
  ["two-factor setup", "/2fa-setup"],
  ["select transactions", `/group/${GROUP_ID}/settle-up/select-transactions`],
  ["confirm details", `/group/${GROUP_ID}/settle-up/confirm-details`],
  ["settle up done", `/group/${GROUP_ID}/settle-up/done`],
] as const;

test.describe("signed-in screens", () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedIn(page);
  });

  for (const [name, path] of SCREENS) {
    test(`${name} renders`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(errors).toEqual([]);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);
    });
  }

  test("the mocked data reaches the screens", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("main")).toContainText("ada@example.com");

    await page.goto(`/group/${GROUP_ID}`);
    await expect(page.locator("main")).toContainText("You paid");
    await expect(page.locator("h1")).toContainText("Trip to Kyoto");
  });

  test("the keyboard keys are real buttons with names", async ({ page }) => {
    await page.goto("/new-expense/enter-amount");

    const seven = page.getByRole("button", { exact: true, name: "7" });
    await seven.focus();
    await expect(seven).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("group")).toBeVisible();
    await expect(page.getByRole("button", { name: /backspace|delete/i })).toBeVisible();
  });

  test("the back button of a deep link stays in the app", async ({ page }) => {
    await page.goto(`/group/${GROUP_ID}/transaction/${TRANSACTION_ID}`);

    await page.getByRole("button", { name: "Back" }).click();

    await expect(page).toHaveURL(new RegExp(`/group/${GROUP_ID}$`));
  });

  test("a sheet is a named dialog that returns the focus", async ({ page }) => {
    await page.goto(`/group/${GROUP_ID}/transaction/${TRANSACTION_ID}`);

    const trigger = page.getByRole("button", { name: /delete/i }).first();
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/.+/);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("the group tabs are a radio group", async ({ page }) => {
    await page.goto(`/group/${GROUP_ID}`);

    const radios = page.getByRole("radiogroup").getByRole("radio");
    await expect(radios.first()).toBeChecked();
    await radios.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(radios.nth(1)).toBeChecked();
  });
});
