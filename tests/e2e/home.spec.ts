import { expect, test } from '@playwright/test';

test('homepage presents the three-column professional feed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tu feed profesional' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Secciones' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Información complementaria' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tu perfil' })).toBeVisible();
});

test('theme preference is shared across routes and persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cambiar al tema oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'Tu perfil' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to marine blue light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('profile avatar can be uploaded, previewed and saved locally', async ({ page }) => {
  await page.goto('/profile');
  await page.locator('#avatarUpload').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pXcAAAAASUVORK5CYII=', 'base64'),
  });
  await expect(page.locator('.profile-preview .profile-avatar img')).toBeVisible();
  await page.getByRole('button', { name: 'Save on this device' }).click();
  await expect(page.getByRole('status')).toContainText('Profile and avatar saved in this browser.');
  await page.reload();
  await expect(page.locator('.profile-preview .profile-avatar img')).toBeVisible();
});
