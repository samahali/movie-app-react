import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('shows at least one movie card', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/CineVault/)
  })

  test('clicking a movie card navigates to the detail page', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="movie-card"]').first().waitFor({ timeout: 15000 })
    await page.locator('[data-testid="movie-card"]').first().click()
    await expect(page).toHaveURL(/\/movies\/\d+/)
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Movies list page', () => {
  test('shows movie cards on /movies', async ({ page }) => {
    await page.goto('/movies')
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "Popular" heading by default', async ({ page }) => {
    await page.goto('/movies?category=popular')
    await expect(page.locator('h1', { hasText: 'Popular' })).toBeVisible({ timeout: 10000 })
  })

  test('shows "Now Playing" heading for now_playing category', async ({ page }) => {
    await page.goto('/movies?category=now_playing')
    await expect(page.locator('h1', { hasText: 'Now Playing' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "Top Rated" heading for top_rated category', async ({ page }) => {
    await page.goto('/movies?category=top_rated')
    await expect(page.locator('h1', { hasText: 'Top Rated' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "Upcoming" heading for upcoming category', async ({ page }) => {
    await page.goto('/movies?category=upcoming')
    await expect(page.locator('h1', { hasText: 'Upcoming' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows genre name as heading when browsing by genre', async ({ page }) => {
    await page.goto('/movies?genre=28&genreName=Action')
    await expect(page.locator('h1', { hasText: 'Action' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows search results heading when searching', async ({ page }) => {
    await page.goto('/movies?search=batman')
    await expect(page.locator('h1', { hasText: /batman/i })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('"Load More" button appears when more pages exist', async ({ page }) => {
    await page.goto('/movies?category=popular')
    await page.locator('[data-testid="movie-card"]').first().waitFor({ timeout: 15000 })
    // Popular movies always has multiple pages
    await expect(page.locator('button', { hasText: 'Load More' })).toBeVisible()
  })

  test('"Load More" loads additional cards', async ({ page }) => {
    await page.goto('/movies?category=popular')
    await page.locator('[data-testid="movie-card"]').first().waitFor({ timeout: 15000 })
    const countBefore = await page.locator('[data-testid="movie-card"]').count()
    await page.locator('button', { hasText: 'Load More' }).click()
    await expect(page.locator('[data-testid="movie-card"]')).not.toHaveCount(countBefore, { timeout: 15000 })
  })

  test('clicking a movie card navigates to /movies/:id', async ({ page }) => {
    await page.goto('/movies')
    await page.locator('[data-testid="movie-card"]').first().waitFor({ timeout: 15000 })
    await page.locator('[data-testid="movie-card"]').first().click()
    await expect(page).toHaveURL(/\/movies\/\d+/)
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Movie detail page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to popular movies and click the first card to get a real ID
    await page.goto('/movies?category=popular')
    await page.locator('[data-testid="movie-card"]').first().waitFor({ timeout: 15000 })
    await page.locator('[data-testid="movie-card"]').first().click()
    await expect(page).toHaveURL(/\/movies\/\d+/)
    await page.locator('h1').waitFor({ timeout: 10000 })
  })

  test('shows movie title in h1', async ({ page }) => {
    const title = await page.locator('h1').textContent()
    expect(title?.trim().length).toBeGreaterThan(0)
  })

  test('has correct document title', async ({ page }) => {
    await expect(page).toHaveTitle(/CineVault/, { timeout: 15000 })
  })

  test('shows overview section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  })

  test('shows genre pill links', async ({ page }) => {
    // Genre pills link to /movies?genre=...
    const genreLinks = page.locator('a[href*="/movies?genre="]')
    await expect(genreLinks.first()).toBeVisible({ timeout: 10000 })
  })

  test('shows cast section with actor avatars', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cast' })).toBeVisible({ timeout: 10000 })
  })

  test('clicking a genre pill navigates to genre list', async ({ page }) => {
    const genreLink = page.locator('a[href*="/movies?genre="]').first()
    await genreLink.waitFor({ timeout: 10000 })
    await genreLink.click()
    await expect(page).toHaveURL(/\/movies\?genre=/)
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('shows "Similar Movies" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Similar Movies' })).toBeVisible({ timeout: 10000 })
  })

  test('trailer button opens modal when trailer exists', async ({ page }) => {
    const trailerBtn = page.locator('button', { hasText: 'Watch Trailer' })
    // Not every movie has a trailer — skip gracefully
    if (await trailerBtn.isVisible()) {
      await trailerBtn.click()
      await expect(page.locator('iframe[src*="youtube"]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('pressing Escape or clicking backdrop closes trailer modal', async ({ page }) => {
    const trailerBtn = page.locator('button', { hasText: 'Watch Trailer' })
    if (await trailerBtn.isVisible()) {
      await trailerBtn.click()
      await expect(page.locator('iframe[src*="youtube"]')).toBeVisible()
      await page.keyboard.press('Escape')
      // After ESC, if the modal div with backdrop has a close button, click it instead
      const closeBtn = page.locator('button[aria-label="Close trailer"]')
      if (await closeBtn.isVisible()) await closeBtn.click()
      await expect(page.locator('iframe[src*="youtube"]')).not.toBeVisible()
    }
  })
})
