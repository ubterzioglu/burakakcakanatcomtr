import { expect, test } from "@playwright/test";

test("admin login opens the protected dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: /private studio/i })).toBeVisible();
  await page.getByLabel(/password/i).fill(process.env.ADMIN_PASS ?? "");
  await page.getByRole("button", { name: /open private studio/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /manage the premium narrative/i })).toBeVisible();
});
