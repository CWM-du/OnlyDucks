import { expect, test } from '@playwright/test';

test('home page communicates the OnlyDucks concept', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /a clearer path from learning to opportunity/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /explore mentors/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /view opportunities/i })).toBeVisible();
});
