import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MoviesPage } from './Movies'

vi.mock('@/hooks/useMovies', () => ({
  useMoviesByCategory: vi.fn(),
  useMoviesByGenre: vi.fn(),
  useMovieSearch: vi.fn(),
}))

import * as useMoviesHooks from '@/hooks/useMovies'

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  overview: 'A test movie.',
  poster_path: '/test.jpg',
  backdrop_path: null,
  release_date: '2023-01-01',
  vote_average: 7.5,
  vote_count: 1000,
  genre_ids: [28],
  original_language: 'en',
  popularity: 50,
}

const baseInfiniteResult = {
  data: { pages: [{ results: [mockMovie], total_pages: 1, page: 1, total_results: 1 }] },
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

const errorResult = {
  data: undefined,
  isLoading: false,
  error: new Error('Network error'),
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
}

function renderMoviesPage(url = '/movies?category=popular') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <MoviesPage />
    </MemoryRouter>
  )
}

describe('MoviesPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cast = (v: unknown) => v as any

  beforeEach(() => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast(baseInfiniteResult))
    vi.mocked(useMoviesHooks.useMoviesByGenre).mockReturnValue(cast(baseInfiniteResult))
    vi.mocked(useMoviesHooks.useMovieSearch).mockReturnValue(cast(baseInfiniteResult))
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast(loadingResult))
    renderMoviesPage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows movie cards after data loads', async () => {
    renderMoviesPage()
    await waitFor(() => expect(screen.getByText('Test Movie')).toBeInTheDocument())
    expect(screen.getByTestId('movie-card')).toBeInTheDocument()
  })

  it('shows error message on failure', async () => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast(errorResult))
    renderMoviesPage()
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })

  it('shows "No movies found." when results are empty', async () => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast(emptyResult))
    renderMoviesPage()
    await waitFor(() => expect(screen.getByText('No movies found.')).toBeInTheDocument())
  })

  it('renders "Popular" heading for popular category', async () => {
    renderMoviesPage('/movies?category=popular')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Popular' })).toBeInTheDocument())
  })

  it('renders "Now Playing" heading for now_playing category', async () => {
    renderMoviesPage('/movies?category=now_playing')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Now Playing' })).toBeInTheDocument())
  })

  it('renders genre name as heading when genreName param is set', async () => {
    renderMoviesPage('/movies?genre=28&genreName=Action')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Action' })).toBeInTheDocument())
  })

  it('renders search results heading when search param is set', async () => {
    renderMoviesPage('/movies?search=inception')
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Results for "inception"' })).toBeInTheDocument()
    )
  })

  it('shows "Load More" button when hasNextPage is true', async () => {
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast({ ...baseInfiniteResult, hasNextPage: true }))
    renderMoviesPage()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument())
  })

  it('does not show "Load More" button when hasNextPage is false', async () => {
    renderMoviesPage()
    await waitFor(() => expect(screen.getByText('Test Movie')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Load More' })).not.toBeInTheDocument()
  })

  it('calls fetchNextPage when "Load More" is clicked', async () => {
    const fetchNextPage = vi.fn()
    vi.mocked(useMoviesHooks.useMoviesByCategory).mockReturnValue(cast({ ...baseInfiniteResult, hasNextPage: true, fetchNextPage }))
    renderMoviesPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Load More' }))
    expect(fetchNextPage).toHaveBeenCalledOnce()
  })

  it('shows "Clear search" button when search param is set', async () => {
    renderMoviesPage('/movies?search=inception')
    await waitFor(() => expect(screen.getByText('Clear search')).toBeInTheDocument())
  })
})
