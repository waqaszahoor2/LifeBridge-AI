import { test, expect } from "@playwright/test";

test.describe("LifeBridge AI Production Integrity Verification", () => {
  test("Dynamic /api/build-info route returns valid commit and headers", async ({ request }) => {
    const response = await request.get("/api/build-info");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["cache-control"]).toContain("no-store");

    const data = await response.json();
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("commit");
    expect(data).toHaveProperty("branch");
    expect(data).toHaveProperty("environment");
    expect(data).toHaveProperty("built_at");
    expect(data.commit).not.toBe("a45bcda");
    expect(data.commit).not.toBe("acec205");
  });

  test("Homepage loads with Guest state and no hardcoded Aarav username", async ({ page }) => {
    await page.goto("/for-you");
    await expect(page.locator("body")).not.toContainText("Hello, Aarav");
    await expect(page.locator("body")).toContainText("Guest");
  });

  test("LeftSidebar profile completeness starts at 0% for unauthenticated user", async ({ page }) => {
    await page.goto("/for-you");
    await expect(page.locator("body")).toContainText("Profile Completeness");
    await expect(page.locator("body")).toContainText("0%");
  });

  test("DisasterLink displays proper warning or live feed", async ({ page }) => {
    await page.goto("/disasters");
    await expect(page.getByRole("heading", { name: "DisasterLink Safety Advisories" })).toBeVisible();
  });

  test("Assistant page loads without duplicate controls", async ({ page }) => {
    await page.goto("/assistant");
    await expect(page.getByRole("checkbox", { name: "Save chat history on this device" })).toBeVisible();
  });
});
