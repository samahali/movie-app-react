import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPopularMovies, fetchSearchMulti } from '@/util/API'
import type { Movie, PaginatedResponse } from '@/types/tmdb'

vi.stubEnv('VITE_TMDB_BASE_URL', 'https://api.tmdb.test')
vi.stubEnv('VITE_TMDB_API_KEY', 'test-key')

function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: 'Test Movie',
    overview: 'An overview.',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2024-01-01',
    vote_average: 7.5,
    vote_count: 100,
    genre_ids: [28], // Action — not excluded
    original_language: 'en',
    popularity: 50,
    ...overrides,
  }
}

function makeResponse(movies: Movie[]): PaginatedResponse<Movie> {
  return { page: 1, results: movies, total_pages: 1, total_results: movies.length }
}

function mockFetchOk(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }))
  )
}

function mockFetchError(status: number): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })))
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

// ─── fetchPopularMovies ───────────────────────────────────────────────────────

describe('fetchPopularMovies', () => {
  it('returns movies that pass all filters', async () => {
    const good = makeMovie({ id: 1, vote_count: 100, poster_path: '/poster.jpg', genre_ids: [28] })
    mockFetchOk(makeResponse([good]))

    const result = await fetchPopularMovies(1)

    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe(1)
  })

  it('removes items with vote_count below 50', async () => {
    const low = makeMovie({ id: 2, vote_count: 49 })
    const good = makeMovie({ id: 3, vote_count: 50 })
    mockFetchOk(makeResponse([low, good]))

    const result = await fetchPopularMovies()

    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe(3)
  })

  it('removes items with exactly 49 vote_count', async () => {
    mockFetchOk(makeResponse([makeMovie({ vote_count: 49 })]))

    const result = await fetchPopularMovies()

    expect(result.results).toHaveLength(0)
  })

  it('keeps items with exactly 50 vote_count', async () => {
    mockFetchOk(makeResponse([makeMovie({ vote_count: 50 })]))

    const result = await fetchPopularMovies()

    expect(result.results).toHaveLength(1)
  })

  it('removes items with null poster_path', async () => {
    const noPoster = makeMovie({ id: 4, poster_path: null })
    const withPoster = makeMovie({ id: 5, poster_path: '/poster.jpg' })
    mockFetchOk(makeResponse([noPoster, withPoster]))

    const result = await fetchPopularMovies()

    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe(5)
  })

  it('removes items with genre_id 18 (Drama)', async () => {
    const drama = makeMovie({ id: 6, genre_ids: [18] })
    const action = makeMovie({ id: 7, genre_ids: [28] })
    mockFetchOk(makeResponse([drama, action]))

    const result = await fetchPopularMovies()

    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe(7)
  })

  it('removes items with genre_id 10749 (Romance)', async () => {
    const romance = makeMovie({ id: 8, genre_ids: [10749] })
    const action = makeMovie({ id: 9, genre_ids: [28] })
    mockFetchOk(makeResponse([romance, action]))

    const result = await fetchPopularMovies()

    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe(9)
  })

  it('removes items that have an excluded genre among multiple genre_ids', async () => {
    const mixed = makeMovie({ id: 10, genre_ids: [28, 18] }) // Action + Drama
    mockFetchOk(makeResponse([mixed]))

    const result = await fetchPopularMovies()

    expect(result.results).toHaveLength(0)
  })

  it('preserves page metadata from the API response', async () => {
    const good = makeMovie()
    const raw: PaginatedResponse<Movie> = {
      page: 3,
      results: [good],
      total_pages: 10,
      total_results: 200,
    }
    mockFetchOk(raw)

    const result = await fetchPopularMovies(3)

    expect(result.page).toBe(3)
    expect(result.total_pages).toBe(10)
    expect(result.total_results).toBe(200)
  })

  it('throws when the response is not ok', async () => {
    mockFetchError(401)

    await expect(fetchPopularMovies()).rejects.toThrow('TMDB error: 401')
  })

  it('throws on 404 responses', async () => {
    mockFetchError(404)

    await expect(fetchPopularMovies()).rejects.toThrow('TMDB error: 404')
  })

  it('throws on 500 responses', async () => {
    mockFetchError(500)

    await expect(fetchPopularMovies()).rejects.toThrow('TMDB error: 500')
  })
})

// ─── fetchSearchMulti ─────────────────────────────────────────────────────────

describe('fetchSearchMulti', () => {
  it('passes the encoded query in the URL', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ page: 1, results: [], total_pages: 1, total_results: 0 }), {
        status: 200,
      })
    )
    vi.stubGlobal('fetch', fetchSpy)

    await fetchSearchMulti('hello world')

    const [calledUrl] = fetchSpy.mock.calls[0] as [string]
    expect(calledUrl).toContain('query=hello%20world')
  })

  it('encodes special characters in the query', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ page: 1, results: [], total_pages: 1, total_results: 0 }), {
        status: 200,
      })
    )
    vi.stubGlobal('fetch', fetchSpy)

    await fetchSearchMulti('avengers & friends')

    const [calledUrl] = fetchSpy.mock.calls[0] as [string]
    expect(calledUrl).toContain(encodeURIComponent('avengers & friends'))
  })

  it('includes the page parameter in the URL', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ page: 2, results: [], total_pages: 5, total_results: 10 }), {
        status: 200,
      })
    )
    vi.stubGlobal('fetch', fetchSpy)

    await fetchSearchMulti('batman', 2)

    const [calledUrl] = fetchSpy.mock.calls[0] as [string]
    expect(calledUrl).toContain('page=2')
  })

  it('throws when the response is not ok', async () => {
    mockFetchError(401)

    await expect(fetchSearchMulti('test')).rejects.toThrow('TMDB error: 401')
  })

  it('returns the full paginated response', async () => {
    const body = { page: 1, results: [{ id: 42, media_type: 'movie' }], total_pages: 1, total_results: 1 }
    mockFetchOk(body)

    const result = await fetchSearchMulti('something')

    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe(42)
  })
})
