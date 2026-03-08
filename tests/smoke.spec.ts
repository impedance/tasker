import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Capital/i);
});

test('can navigate to Map', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Region Map');
    await expect(page).toHaveURL(/.*map/);
    await expect(page.locator('h1')).toContainText('Region Map');
});

test('can navigate to Chronicle', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Chronicle');
    await expect(page).toHaveURL(/.*chronicle/);
    await expect(page.locator('h1')).toContainText('Chronicle');
});
