import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Tasker MVP/i)
  await expect(page.getByRole('heading', { name: /Tasker MVP/i })).toBeVisible()
})

test('can navigate to Campaigns', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Campaigns/i }).click()
  await expect(page).toHaveURL(/\/campaigns$/)
  await expect(page.getByRole('heading', { name: /Campaigns/i })).toBeVisible()
})

test('can open Settings directly', async ({ page }) => {
  await page.goto('/settings')
  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()
})
