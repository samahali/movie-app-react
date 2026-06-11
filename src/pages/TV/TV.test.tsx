import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TVPage } from './TV'

vi.mock('@/hooks/useTV', () => ({
  useTVByCategory: vi.fn(),
  useTVByGenre: vi.fn(),
}))

import * as useTVHooks from '@/hooks/useTV'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cast = (v: unknown) => v as any

const mockShow = {
  id: 10,
  name: 'Breaking Bad',
  overview: 'A chemistry teacher turns criminal.',
  poster_path: '/bb.jpg',
  backdrop_path: null,
  first_air_date: '2008-01-20',
  vote_average: 9.5,
  vote_count: 12000,
  genre_ids: [80, 35],
  original_language: 'en',
  popularity: 200,
}

const baseInfiniteResult = {
  data: { pages: [{ results: [mockShow], total_pages: 1, page: 1, total_results: 1 }] },
  isLoading: false,
  error: null,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
}

const loadingResult = {
  data: undefined,
  isLoading: true,
  error: null,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
}

const emptyResult = {
  data: { pages: [{ results: [], total_pages: 1, page: 1, total_results: 0 }] },
  isLoading: false,
  error: null,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
}

function renderTVPage(url = '/tv?category=popular') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <TVPage />
    </MemoryRouter>
  )
}

describe('TVPage', () => {
  beforeEach(() => {
    vi.mocked(useTVHooks.useTVByCategory).mockReturnValue(cast(baseInfiniteResult))
    vi.mocked(useTVHooks.useTVByGenre).mockReturnValue(cast(baseInfiniteResult))
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(useTVHooks.useTVByCategory).mockReturnValue(cast(loadingResult))
    renderTVPage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows TV cards after data loads', async () => {
    renderTVPage()
    await waitFor(() => expect(screen.getByText('Breaking Bad')).toBeInTheDocument())
    expect(screen.getByTestId('tv-card')).toBeInTheDocument()
  })

  it('TV card links to /tv/:id', async () => {
    renderTVPage()
    await waitFor(() => expect(screen.getByTestId('tv-card')).toBeInTheDocument())
    expect(screen.getByTestId('tv-card')).toHaveAttribute('href', '/tv/10')
  })

  it('shows error message on API failure', async () => {
    vi.mocked(useTVHooks.useTVByCategory).mockReturnValue(cast({
      ...baseInfiniteResult,
      error: new Error('TV API down'),
      data: undefined,
      isLoading: false,
    }))
    renderTVPage()
    await waitFor(() => expect(screen.getByText('TV API down')).toBeInTheDocument())
  })

  it('shows "No shows found." when results are empty', async () => {
    vi.mocked(useTVHooks.useTVByCategory).mockReturnValue(cast(emptyResult))
    renderTVPage()
    await waitFor(() => expect(screen.getByText('No shows found.')).toBeInTheDocument())
  })

  it('renders "Popular" heading for popular category', async () => {
    renderTVPage('/tv?category=popular')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Popular' })).toBeInTheDocument())
  })

  it('renders "Airing Today" heading for airing_today category', async () => {
    renderTVPage('/tv?category=airing_today')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Airing Today' })).toBeInTheDocument())
  })

  it('renders "On TV" heading for on_the_air category', async () => {
    renderTVPage('/tv?category=on_the_air')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'On TV' })).toBeInTheDocument())
  })

  it('renders "Top Rated" heading for top_rated category', async () => {
    renderTVPage('/tv?category=top_rated')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Top Rated' })).toBeInTheDocument())
  })

  it('renders genreName as heading when genreName param is set', async () => {
    renderTVPage('/tv?genre=35&genreName=Comedy')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Comedy' })).toBeInTheDocument())
  })

  it('shows "Load More" button when hasNextPage is true', async () => {
    vi.mocked(useTVHooks.useTVByCategory).mockReturnValue(cast({ ...baseInfiniteResult, hasNextPage: true }))
    renderTVPage()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument())
  })

  it('does not show "Load More" button when hasNextPage is false', async () => {
    renderTVPage()
    await waitFor(() => expect(screen.getByText('Breaking Bad')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Load More' })).not.toBeInTheDocument()
  })

  it('renders show year from first_air_date', async () => {
    renderTVPage()
    await waitFor(() => expect(screen.getByText('2008')).toBeInTheDocument())
  })

  it('renders vote average on the card', async () => {
    renderTVPage()
    await waitFor(() => expect(screen.getByText('9.5')).toBeInTheDocument())
  })
})
