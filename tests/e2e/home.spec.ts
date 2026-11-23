import { expect, test } from '@playwright/test';

test('homepage presents the three-column professional feed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tu feed profesional' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Secciones' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Información complementaria' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir mi perfil' })).toBeVisible();
});

test('theme preference is shared across routes and persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cambiar al tema oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'Abrir mi perfil' }).click();
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

test('feed remains usable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tu feed profesional' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});


test('feed layout has no horizontal overflow at desktop, tablet and mobile widths', async ({ page }) => {
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test('primary feed destinations resolve', async ({ page }) => {
  for (const route of ['/feed', '/roadmap', '/mentors', '/agent', '/profile', '/welcome']) {
    const response = await page.goto(route);
    expect(response?.status(), `route ${route}`).toBeLessThan(400);
  }
});
