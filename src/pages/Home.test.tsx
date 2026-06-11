import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HomePage } from './Home'

vi.mock('@/hooks/useMovies', () => ({
  useMoviesByCategory: vi.fn(),
}))

import * as useMoviesHooks from '@/hooks/useMovies'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cast = (v: unknown) => v as any

const mockMovie = {
  id: 42,
  title: 'The Matrix',
  overview: 'Humans are trapped in a simulation.',
  poster_path: '/matrix.jpg',
  backdrop_path: null,
  release_date: '1999-03-31',
  vote_average: 8.7,
  vote_count: 25000,
  genre_ids: [28, 878],
  original_language: 'en',
  popularity: 120,
}

const baseResult = {
  data: { pages: [{ results: [mockMovie], total_pages: 1, page: 1, total_results: 1 }] },
  isLoading: false,
  error: null,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
}

const loadingResult = { ...baseResult, data: undefined, isLoading: true }

function renderHomePage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast(baseResult))
  })

  it('renders the hero heading', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { name: /discover movies/i })).toBeInTheDocument()
  })

  it('renders "Now Playing" section tab', () => {
    renderHomePage()
    expect(screen.getByRole('button', { name: 'Now Playing' })).toBeInTheDocument()
  })

  it('renders "Popular" section tab', () => {
    renderHomePage()
    expect(screen.getByRole('button', { name: 'Popular' })).toBeInTheDocument()
  })

  it('renders "Top Rated" section tab', () => {
    renderHomePage()
    expect(screen.getByRole('button', { name: 'Top Rated' })).toBeInTheDocument()
  })

  it('shows movie grid after loading — default is Now Playing', async () => {
    renderHomePage()
    await waitFor(() => expect(screen.getByText('The Matrix')).toBeInTheDocument())
    expect(screen.getByTestId('movie-card')).toBeInTheDocument()
  })

  it('calls useMoviesByCategory with now_playing on initial render', () => {
    renderHomePage()
    expect(useMoviesHooks.useMoviesByCategory).toHaveBeenCalledWith('now_playing')
  })

  it('calls useMoviesByCategory with popular when Popular tab is clicked', async () => {
    const user = userEvent.setup()
    renderHomePage()
    await user.click(screen.getByRole('button', { name: 'Popular' }))
    expect(useMoviesHooks.useMoviesByCategory).toHaveBeenCalledWith('popular')
  })

  it('calls useMoviesByCategory with top_rated when Top Rated tab is clicked', async () => {
    const user = userEvent.setup()
    renderHomePage()
    await user.click(screen.getByRole('button', { name: 'Top Rated' }))
    expect(useMoviesHooks.useMoviesByCategory).toHaveBeenCalledWith('top_rated')
  })

  it('shows error message on API failure', async () => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast({
      ...baseResult,
      data: undefined,
      isLoading: false,
      error: new Error('Something went wrong'),
    }))
    renderHomePage()
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument())
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast(loadingResult))
    renderHomePage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders a "See all" link pointing to movies with the active category', async () => {
    renderHomePage()
    await waitFor(() => expect(screen.getByText('The Matrix')).toBeInTheDocument())
    const seeAllLink = screen.getByRole('link', { name: /see all/i })
    expect(seeAllLink).toHaveAttribute('href', '/movies?category=now_playing')
  })

  it('"See all" link updates when a different tab is clicked', async () => {
    const user = userEvent.setup()
    renderHomePage()
    await user.click(screen.getByRole('button', { name: 'Popular' }))
    await waitFor(() => {
      const seeAllLink = screen.getByRole('link', { name: /see all/i })
      expect(seeAllLink).toHaveAttribute('href', '/movies?category=popular')
    })
  })
})
