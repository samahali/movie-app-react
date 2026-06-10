import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchMoviesByGenre,
  fetchSearchMulti,
} from '@/util/API'
import { MovieCard } from '@/components/MovieCard/MovieCard'
import { Pagination } from '@/components/Pagination/Pagination'
import type { Movie, PaginatedResponse } from '@/types/tmdb'

const CATEGORY_LABELS: Record<string, string> = {
  now_playing: 'Now Playing',
  popular: 'Popular',
  top_rated: 'Top Rated',
  upcoming: 'Upcoming',
}

/**
 * MoviesPage renders movies filtered by category, genre, or search query.
 * URL params: ?category=, ?genre=, ?genreName=, ?search=
 */
export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'popular'
  const genreId = searchParams.get('genre')
  const genreName = searchParams.get('genreName')
  const searchQuery = searchParams.get('search')

  const page = Number(searchParams.get('page') ?? '1')

  const [movies, setMovies] = useState<Movie[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchMap: Record<string, (p: number) => Promise<PaginatedResponse<Movie>>> = {
      now_playing: fetchNowPlayingMovies,
      popular: fetchPopularMovies,
      top_rated: fetchTopRatedMovies,
      upcoming: fetchUpcomingMovies,
    }
    const request: Promise<PaginatedResponse<Movie>> = searchQuery
      ? fetchSearchMulti(searchQuery, page).then((data) => ({
          ...data,
          results: data.results.filter((r) => r.media_type === 'movie') as unknown as Movie[],
        }))
      : genreId
      ? fetchMoviesByGenre(Number(genreId), page)
      : (fetchMap[category] ?? fetchPopularMovies)(page)

    request
      .then((data) => {
        if (cancelled) return
        setIsLoading(false)
        setError(null)
        setMovies(data.results)
        setTotalPages(data.total_pages)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setIsLoading(false)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      })
    return () => { cancelled = true }
  }, [category, genreId, searchQuery, page])

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const heading = searchQuery
    ? `Results for "${searchQuery}"`
    : genreName
    ? genreName
    : (CATEGORY_LABELS[category] ?? 'Movies')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        {searchQuery && (
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Clear search
          </button>
        )}
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : isLoading ? (
        <MovieGridSkeleton />
      ) : movies.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="aspect-2/3 w-full animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-64 items-center justify-center text-muted-foreground">
      No movies found.
    </div>
  )
}
