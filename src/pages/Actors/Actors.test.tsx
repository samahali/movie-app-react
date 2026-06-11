import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ActorsPage } from './Actors'

vi.mock('@/hooks/useActors', () => ({
  useTrendingActors: vi.fn(),
}))

import * as useActorsHooks from '@/hooks/useActors'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cast = (v: unknown) => v as any

const mockActor = {
  id: 5,
  name: 'Keanu Reeves',
  profile_path: '/keanu.jpg',
  known_for_department: 'Acting',
  popularity: 95,
  known_for: [],
}

const baseInfiniteResult = {
  data: { pages: [{ results: [mockActor], total_pages: 1, page: 1, total_results: 1 }] },
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

function renderActorsPage() {
  return render(
    <MemoryRouter initialEntries={['/actors']}>
      <ActorsPage />
    </MemoryRouter>
  )
}

describe('ActorsPage', () => {
  beforeEach(() => {
    vi.mocked(useActorsHooks.useTrendingActors).mockReturnValue(cast(baseInfiniteResult))
  })

  it('renders "Trending Actors" heading', async () => {
    renderActorsPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Trending Actors' })).toBeInTheDocument()
    )
  })

  it('shows actor cards after data loads', async () => {
    renderActorsPage()
    await waitFor(() => expect(screen.getByText('Keanu Reeves')).toBeInTheDocument())
    expect(screen.getByTestId('actor-card')).toBeInTheDocument()
  })

  it('actor card links to /actors/:id', async () => {
    renderActorsPage()
    await waitFor(() => expect(screen.getByTestId('actor-card')).toBeInTheDocument())
    expect(screen.getByTestId('actor-card')).toHaveAttribute('href', '/actors/5')
  })

  it('renders actor department', async () => {
    renderActorsPage()
    await waitFor(() => expect(screen.getByText('Acting')).toBeInTheDocument())
  })

  it('renders actor profile image when profile_path is present', async () => {
    renderActorsPage()
    await waitFor(() => expect(screen.getByRole('img', { name: 'Keanu Reeves' })).toBeInTheDocument())
  })

  it('renders initial letter fallback when profile_path is null', async () => {
    vi.mocked(useActorsHooks.useTrendingActors).mockReturnValue(cast({
      ...baseInfiniteResult,
      data: { pages: [{ results: [{ ...mockActor, profile_path: null }], total_pages: 1, page: 1, total_results: 1 }] },
    }))
    renderActorsPage()
    await waitFor(() => expect(screen.queryByRole('img')).not.toBeInTheDocument())
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('shows error message on API failure', async () => {
    vi.mocked(useActorsHooks.useTrendingActors).mockReturnValue(cast({
      ...baseInfiniteResult,
      error: new Error('Actors unavailable'),
      data: undefined,
      isLoading: false,
    }))
    renderActorsPage()
    await waitFor(() => expect(screen.getByText('Actors unavailable')).toBeInTheDocument())
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(useActorsHooks.useTrendingActors).mockReturnValue(cast(loadingResult))
    renderActorsPage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows "Load More" button when hasNextPage is true', async () => {
    vi.mocked(useActorsHooks.useTrendingActors).mockReturnValue(cast({ ...baseInfiniteResult, hasNextPage: true }))
    renderActorsPage()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument())
  })

  it('does not show "Load More" button when hasNextPage is false', async () => {
    renderActorsPage()
    await waitFor(() => expect(screen.getByText('Keanu Reeves')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Load More' })).not.toBeInTheDocument()
  })

  it('calls fetchNextPage when "Load More" is clicked', async () => {
    const fetchNextPage = vi.fn()
    vi.mocked(useActorsHooks.useTrendingActors).mockReturnValue(cast({ ...baseInfiniteResult, hasNextPage: true, fetchNextPage }))
    renderActorsPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Load More' }))
    expect(fetchNextPage).toHaveBeenCalledOnce()
  })
})
