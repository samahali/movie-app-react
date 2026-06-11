import { test, expect } from '@playwright/test'

test.describe('TV Shows list page', () => {
  test('shows TV cards on /tv', async ({ page }) => {
    await page.goto('/tv')
    await expect(page.locator('[data-testid="tv-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "Popular" heading by default', async ({ page }) => {
    await page.goto('/tv?category=popular')
    await expect(page.locator('h1', { hasText: 'Popular' })).toBeVisible({ timeout: 10000 })
  })

  test('shows "Airing Today" heading for airing_today category', async ({ page }) => {
    await page.goto('/tv?category=airing_today')
    await expect(page.locator('h1', { hasText: 'Airing Today' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="tv-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "On TV" heading for on_the_air category', async ({ page }) => {
    await page.goto('/tv?category=on_the_air')
    await expect(page.locator('h1', { hasText: 'On TV' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="tv-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "Top Rated" heading for top_rated category', async ({ page }) => {
    await page.goto('/tv?category=top_rated')
    await expect(page.locator('h1', { hasText: 'Top Rated' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="tv-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows genre name as heading when browsing by genre', async ({ page }) => {
    await page.goto('/tv?genre=35&genreName=Comedy')
    await expect(page.locator('h1', { hasText: 'Comedy' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="tv-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('"Load More" button appears and loads more cards', async ({ page }) => {
    await page.goto('/tv?category=popular')
    await page.locator('[data-testid="tv-card"]').first().waitFor({ timeout: 15000 })
    const countBefore = await page.locator('[data-testid="tv-card"]').count()
    await expect(page.locator('button', { hasText: 'Load More' })).toBeVisible()
    await page.locator('button', { hasText: 'Load More' }).click()
    await expect(page.locator('[data-testid="tv-card"]')).not.toHaveCount(countBefore, { timeout: 15000 })
  })

  test('clicking a TV card navigates to /tv/:id', async ({ page }) => {
    await page.goto('/tv')
    await page.locator('[data-testid="tv-card"]').first().waitFor({ timeout: 15000 })
    await page.locator('[data-testid="tv-card"]').first().click()
    await expect(page).toHaveURL(/\/tv\/\d+/)
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })

  test('TV card shows year', async ({ page }) => {
    await page.goto('/tv?category=popular')
    await page.locator('[data-testid="tv-card"]').first().waitFor({ timeout: 15000 })
    // Cards render a 4-digit year
    await expect(page.locator('[data-testid="tv-card"]').first().locator('text=/\\d{4}/')).toBeVisible()
  })
})

test.describe('TV Show detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tv?category=popular')
    await page.locator('[data-testid="tv-card"]').first().waitFor({ timeout: 15000 })
    await page.locator('[data-testid="tv-card"]').first().click()
    await expect(page).toHaveURL(/\/tv\/\d+/)
    await page.locator('h1').waitFor({ timeout: 10000 })
  })

  test('shows show title in h1', async ({ page }) => {
    const title = await page.locator('h1').textContent()
    expect(title?.trim().length).toBeGreaterThan(0)
  })

  test('has correct document title', async ({ page }) => {
    await expect(page).toHaveTitle(/CineVault/, { timeout: 15000 })
  })

  test('shows overview section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  })

  test('shows seasons carousel when seasons exist', async ({ page }) => {
    // Breaking Bad (id=1396) is a stable show guaranteed to have seasons
    await page.goto('/tv/1396')
    await page.locator('h1').waitFor({ timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'Seasons' })).toBeVisible({ timeout: 10000 })
  })

  test('shows cast section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cast' })).toBeVisible({ timeout: 10000 })
  })

  test('shows genre pill links', async ({ page }) => {
    const genreLinks = page.locator('a[href*="/tv?genre="]')
    await expect(genreLinks.first()).toBeVisible({ timeout: 10000 })
  })

  test('clicking a genre pill navigates to genre list', async ({ page }) => {
    const genreLink = page.locator('a[href*="/tv?genre="]').first()
    await genreLink.waitFor({ timeout: 10000 })
    await genreLink.click()
    await expect(page).toHaveURL(/\/tv\?genre=/)
    await expect(page.locator('[data-testid="tv-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "Similar Shows" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Similar Shows' })).toBeVisible({ timeout: 10000 })
  })

  test('trailer button opens modal when trailer exists', async ({ page }) => {
    const trailerBtn = page.locator('button', { hasText: 'Watch Trailer' })
    if (await trailerBtn.isVisible()) {
      await trailerBtn.click()
      await expect(page.locator('iframe[src*="youtube"]')).toBeVisible({ timeout: 5000 })
      await page.locator('button[aria-label="Close trailer"]').click()
      await expect(page.locator('iframe[src*="youtube"]')).not.toBeVisible()
    }
  })
})
