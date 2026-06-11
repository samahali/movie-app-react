import { test, expect } from '@playwright/test'

// Leonardo DiCaprio — guaranteed to have profile image, biography, and Known For credits
const STABLE_ACTOR_ID = 6193
const STABLE_ACTOR_NAME = 'Leonardo DiCaprio'

test.describe('Actors list page', () => {
  test('shows "Trending Actors" heading', async ({ page }) => {
    await page.goto('/actors')
    await expect(page.locator('h1', { hasText: 'Trending Actors' })).toBeVisible({ timeout: 10000 })
  })

  test('shows actor cards', async ({ page }) => {
    await page.goto('/actors')
    await expect(page.locator('[data-testid="actor-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('actor cards show names', async ({ page }) => {
    await page.goto('/actors')
    await page.locator('[data-testid="actor-card"]').first().waitFor({ timeout: 15000 })
    const text = await page.locator('[data-testid="actor-card"]').first().textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('"Load More" button appears and loads more cards', async ({ page }) => {
    await page.goto('/actors')
    await page.locator('[data-testid="actor-card"]').first().waitFor({ timeout: 15000 })
    const countBefore = await page.locator('[data-testid="actor-card"]').count()
    await expect(page.locator('button', { hasText: 'Load More' })).toBeVisible()
    await page.locator('button', { hasText: 'Load More' }).click()
    await expect(page.locator('[data-testid="actor-card"]')).not.toHaveCount(countBefore, { timeout: 15000 })
  })

  test('clicking an actor card navigates to /actors/:id', async ({ page }) => {
    await page.goto('/actors')
    await page.locator('[data-testid="actor-card"]').first().waitFor({ timeout: 15000 })
    await page.locator('[data-testid="actor-card"]').first().click()
    await expect(page).toHaveURL(/\/actors\/\d+/)
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Actor detail page', () => {
  // Navigate directly to a known stable actor — avoids flakiness from random trending picks
  test.beforeEach(async ({ page }) => {
    await page.goto(`/actors/${STABLE_ACTOR_ID}`)
    // Wait until the name is rendered (data loaded + useEffect title set)
    await expect(page.locator('h1')).toHaveText(new RegExp(STABLE_ACTOR_NAME), { timeout: 15000 })
  })

  test('shows actor name in h1', async ({ page }) => {
    const name = await page.locator('h1').textContent()
    expect(name?.trim().length).toBeGreaterThan(0)
  })

  test('has correct document title', async ({ page }) => {
    // Title is set by useEffect after data loads — h1 text confirms data is ready
    await expect(page).toHaveTitle(new RegExp(STABLE_ACTOR_NAME), { timeout: 10000 })
  })

  test('shows "Known For" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Known For' })).toBeVisible({ timeout: 10000 })
  })

  test('shows biography', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Biography' })).toBeVisible({ timeout: 10000 })
  })

  test('shows profile image', async ({ page }) => {
    await expect(page.locator(`img[alt="${STABLE_ACTOR_NAME}"]`)).toBeVisible({ timeout: 10000 })
  })

  test('clicking a "Known For" credit navigates to movie or TV detail', async ({ page }) => {
    const creditLink = page.locator('section a[href*="/movies/"], section a[href*="/tv/"]').first()
    await creditLink.waitFor({ timeout: 10000 })
    await creditLink.click()
    await expect(page).toHaveURL(/\/(movies|tv)\/\d+/)
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })
})
