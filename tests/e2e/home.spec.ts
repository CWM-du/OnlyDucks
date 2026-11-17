import { expect, test } from '@playwright/test';

test('home page communicates the OnlyDucks concept and links to the guided demo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /make your next move count/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /start product demo/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /browse opportunities/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /explore mentors/i })).toBeVisible();
});
