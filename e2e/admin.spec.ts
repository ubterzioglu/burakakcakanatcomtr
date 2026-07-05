import fs from "node:fs";

import { expect, test } from "@playwright/test";

function getEnvValue(key: string) {
  const file = fs.readFileSync(".env.local", "utf8");
  const line = file.split(/\r?\n/).find((entry) => entry.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1) : "";
}

test("admin login opens the protected dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: /admin surface for the premium narrative layer/i })).toBeVisible();
  await page.getByPlaceholder("Enter admin password").fill(getEnvValue("ADMIN_PASS"));
  await page.getByRole("button", { name: /open private studio/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /manage the premium narrative/i })).toBeVisible();
});
