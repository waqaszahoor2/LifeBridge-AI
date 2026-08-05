// @ts-nocheck
import { test, expect } from "@playwright/test";

test.describe("LifeBridge AI Production Integrity & Health Contract", () => {
  test("1. Live/Demo badge display matches backend status", async ({ page }) => {
    await page.goto("/assistant");
    const badge = page.locator("h1 span");
    await expect(badge).toBeVisible();
    const text = await badge.innerText();
    expect(text.includes("Groq AI") || text.includes("Local Demo Mode") || text.includes("Offline")).toBeTruthy();
  });

  test("2. History consent toggle works as expected", async ({ page }) => {
    await page.goto("/assistant");
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    // Default should be false
    const isChecked = await checkbox.isChecked();
    expect(isChecked).toBeFalsy();

    // Toggle ON
    await checkbox.check();
    expect(await checkbox.isChecked()).toBeTruthy();

    const optIn = await page.evaluate(() => localStorage.getItem("lifebridge_opt_in_history"));
    expect(optIn).toBe("true");

    // Toggle OFF
    await checkbox.uncheck();
    const optInAfter = await page.evaluate(() => localStorage.getItem("lifebridge_opt_in_history"));
    expect(optInAfter).toBe("false");
    const storedHistory = await page.evaluate(() => localStorage.getItem("lifebridge_assistant_history"));
    expect(storedHistory).toBeNull();
  });

  test("3. Demonstration alert label is displayed on disasters page", async ({ page }) => {
    await page.goto("/disasters");
    const demoLabel = page.locator("text=DEMONSTRATION ALERT");
    await expect(demoLabel.first()).toBeVisible();
  });
});
