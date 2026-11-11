import { expect, test } from '@playwright/test';

test('guided product tour links to each preview area and tracks progress', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: /guided product tour/i })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: /demo walkthrough progress/i })).toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('link', { name: /open agent workspace/i }).first().click();
  await expect(page).toHaveURL(/\/agent$/);
  await expect(page.getByRole('heading', { name: /make a plan/i })).toBeVisible();
  await page.goto('/demo');
  await page.getByLabel('Explored').first().check();
  await expect(page.getByRole('progressbar', { name: /demo walkthrough progress/i })).toHaveAttribute('aria-valuenow', '20');
  await expect(page.getByText('1 of 5 explored')).toBeVisible();
});

test('agent creates, refines, approves, and resets a local blueprint', async ({ page }) => {
  await page.goto('/agent');
  await page.getByLabel('What would you like to achieve?').fill('Build a React portfolio project');
  await page.getByRole('button', { name: /create blueprint/i }).click();
  await expect(page.getByRole('heading', { name: 'Your learning blueprint' })).toBeVisible();
  await page.getByLabel('Refine the blueprint').fill('Add a hands-on milestone');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByRole('heading', { name: 'Refined learning blueprint' })).toBeVisible();
  await page.getByRole('button', { name: /approve preview/i }).click();
  await expect(page.getByText('Preview approved')).toBeVisible();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByText('Your plan will appear here')).toBeVisible();
});
