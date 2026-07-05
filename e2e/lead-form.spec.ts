import { expect, test } from "@playwright/test";

test("homepage lead form submits successfully", async ({ page }) => {
  await page.goto("/mvp");
  await expect(page.getByRole("link", { name: /request strategic partnership/i })).toBeVisible();
  await page.getByPlaceholder("Name").fill("Ada Lovelace");
  await page.getByPlaceholder("Email").fill("ada@example.com");
  await page.getByPlaceholder("Company").fill("Analytical Engines");
  await page
    .getByPlaceholder("Tell me the opportunity")
    .fill("We would like to discuss a strategic collaboration across the GCC corridor.");
  await page.getByRole("button", { name: /send strategic request/i }).click();
  await expect(page.getByText(/your message is in/i)).toBeVisible();
});
