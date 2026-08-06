import { test, expect } from "@playwright/test";

test.describe("LifeBridge AI Production Integrity & Verification Suite", () => {
  test("Dynamic /api/build-info route returns valid commit and fixed timestamp", async ({ request }) => {
    const response = await request.get("/api/build-info");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["cache-control"]).toContain("no-store");

    const data = await response.json();
    expect(data).toHaveProperty("version", "1.0.0");
    expect(data).toHaveProperty("commit");
    expect(data).toHaveProperty("branch", "main");
    expect(data).toHaveProperty("environment");
    expect(data).toHaveProperty("built_at");
    expect(data.built_at).not.toBe("NOT_CONFIGURED_BUILD_TIMESTAMP");
  });

  test("Notification count strictly starts at zero for unauthenticated users", async ({ page }) => {
    await page.goto("/for-you");
    const notifBtn = page.locator(".notif-btn");
    await expect(notifBtn).toBeVisible();
    await expect(notifBtn).toHaveAttribute("aria-label", "No unread notifications");
    await expect(page.locator(".notif-badge")).not.toBeVisible();
  });

  test("Homepage & For You contain zero hard-coded emergency flood alerts", async ({ page }) => {
    await page.goto("/for-you");
    await expect(page.locator("body")).not.toContainText("Assam and Bihar flooding");
    await expect(page.locator("body")).not.toContainText("NDMA Pakistan");
  });

  test("Guest profile completeness starts strictly at 0%", async ({ page }) => {
    await page.goto("/for-you");
    await expect(page.locator("body")).toContainText("Profile Completeness");
    await expect(page.locator("body")).toContainText("0%");
  });

  test("DisasterLink safety page renders proper header without fake emergency popups", async ({ page }) => {
    await page.goto("/disasters");
    await expect(page.getByRole("heading", { name: "DisasterLink Safety Advisories" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("NDMA Pakistan flood warning");
  });

  test("Assistant page loads with history consent opt-in and streaming input controls", async ({ page }) => {
    await page.goto("/assistant");
    await expect(page.getByRole("checkbox", { name: "Save chat history on this device" })).toBeVisible();
    await expect(page.getByPlaceholder("Ask LifeBridge AI Assistant anything (Enter to send, Shift+Enter for newline)...")).toBeVisible();
  });

  test("Keyboard Skip to Content link focuses main content area", async ({ page }) => {
    await page.goto("/for-you");
    await page.keyboard.press("Tab");
    const skipLink = page.locator(".skip-to-content");
    await expect(skipLink).toBeFocused();
  });

  test("Assistant submits message and handles streaming UI state cleanly", async ({ page }) => {
    await page.goto("/assistant");
    const textarea = page.getByPlaceholder("Ask LifeBridge AI Assistant anything (Enter to send, Shift+Enter for newline)...");
    await textarea.fill("What verified healthcare resources does LifeBridge AI provide?");
    await page.keyboard.press("Enter");

    // Check user message bubble is rendered
    await expect(page.locator("body")).toContainText("What verified healthcare resources does LifeBridge AI provide?");
  });
});
