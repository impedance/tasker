import { expect, test } from '@playwright/test'

async function ensureOnboardingDismissed(page: import('@playwright/test').Page) {
  const onboardingTitle = page.getByRole('heading', { name: /Choose Your Starting Point/i })
  try {
    await onboardingTitle.waitFor({ state: 'visible', timeout: 2000 })
  } catch {
    return
  }

  const startTutorial = page.getByRole('button', { name: /Start with Tutorial/i })
  await startTutorial.click()

  // The app reloads after seeding.
  await page.waitForLoadState('domcontentloaded')
  await onboardingTitle.waitFor({ state: 'hidden', timeout: 10000 })
}

test('has title', async ({ page }) => {
  await page.goto('/')
  await ensureOnboardingDismissed(page)
  await expect(page).toHaveTitle(/Tasker MVP/i)
  await expect(page.getByRole('heading', { name: /Tasker MVP/i })).toBeVisible()
})

test('can open Campaigns directly', async ({ page }) => {
  await page.goto('/campaigns')
  await ensureOnboardingDismissed(page)
  await expect(page).toHaveURL(/\/campaigns$/)
  await expect(page.getByRole('heading', { name: /Campaigns/i })).toBeVisible()
})

test('can navigate to Map', async ({ page }) => {
  await page.goto('/')
  await ensureOnboardingDismissed(page)
  await page.getByRole('link', { name: /Map/i }).click()
  await expect(page).toHaveURL(/\/map(\/.*)?$/)
  await expect(page.getByRole('heading', { name: /Strategic Map/i })).toBeVisible()
})

test('can open Settings directly', async ({ page }) => {
  await page.goto('/settings')
  await ensureOnboardingDismissed(page)
  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()
})

test('first run: onboarding leads to Capital after tutorial', async ({ page, context }) => {
  // Start with a clean browser profile (no IndexedDB)
  await context.clearCookies()
  
  await page.goto('/')
  
  // Should see onboarding dialog on first run
  const onboardingTitle = page.getByRole('heading', { name: /Choose Your Starting Point/i })
  await onboardingTitle.waitFor({ state: 'visible', timeout: 5000 })
  
  // Choose tutorial
  const startTutorial = page.getByRole('button', { name: /Start with Tutorial/i })
  await startTutorial.click()
  
  // App reloads after seeding tutorial
  await page.waitForLoadState('domcontentloaded')
  
  // Should land on Capital (root redirects to /capital)
  await page.waitForURL(/\/capital/)
  await expect(page.getByRole('heading', { name: /Welcome to Tasker|Campaign Foothold/i })).toBeVisible({ timeout: 5000 })
  
  // Capital should show tutorial campaign content
  const campaignTitle = page.getByText(/Welcome to Tasker/i)
  await expect(campaignTitle).toBeVisible()
})

test('root route redirects to Capital', async ({ page }) => {
  await page.goto('/')
  await ensureOnboardingDismissed(page)
  
  // Root should redirect to /capital
  await page.waitForURL(/\/capital/)
  await expect(page).toHaveURL(/\/capital/)
  
  // Capital page should be visible
  const capitalHeading = page.getByRole('heading', { name: /Campaign Foothold/i })
  await expect(capitalHeading).toBeVisible()
})
