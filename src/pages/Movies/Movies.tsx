import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useMoviesByCategory, useMoviesByGenre, useMovieSearch } from '@/hooks/useMovies'
import { MovieCard } from '@/components/MovieCard/MovieCard'
import { Button } from '@/components/ui/button'
import type { Movie } from '@/types/tmdb'
import type { InfiniteData } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/types/tmdb'

const CATEGORY_LABELS: Record<string, string> = {
  now_playing: 'Now Playing',
  popular: 'Popular',
  top_rated: 'Top Rated',
  upcoming: 'Upcoming',
}

type InfiniteMovies = InfiniteData<PaginatedResponse<Movie>>

interface PageContentProps {
  data: InfiniteMovies | undefined
  isLoading: boolean
  error: Error | null
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

/**
 * MoviesPage renders movies filtered by category, genre, or search query using TanStack Query infinite scroll.
 * URL params: ?category=, ?genre=, ?genreName=, ?search=
 */
export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'popular'
  const genreId = searchParams.get('genre')
  const genreName = searchParams.get('genreName')
  const searchQuery = searchParams.get('search') ?? ''

  const categoryResult = useMoviesByCategory(category)
  const genreResult = useMoviesByGenre(genreId ? Number(genreId) : 0)
  const searchResult = useMovieSearch(searchQuery)

  const active = searchQuery ? searchResult : genreId ? genreResult : categoryResult
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = active

  const heading = searchQuery
    ? `Results for "${searchQuery}"`
    : genreName ?? CATEGORY_LABELS[category] ?? 'Movies'

  return (
    <>
      <Helmet>
        <title>{heading} — CineVault</title>
        <meta name="description" content={`Browse ${heading.toLowerCase()} on CineVault.`} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{heading}</h1>
          {searchQuery && (
            <button
              onClick={() => setSearchParams({})}
              className="text-sm text-muted-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear search
            </button>
          )}
        </div>

        <PageContent
          data={data}
          isLoading={isLoading}
          error={error as Error | null}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </>
  )
}

function PageContent({ data, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage }: PageContentProps) {
  const movies = data?.pages.flatMap((p) => p.results) ?? []

  if (error) return <ErrorState message={(error as Error).message} />
  if (isLoading) return <MovieGridSkeleton />
  if (movies.length === 0) return <EmptyState />

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      {hasNextPage && (
        <div className="mt-10 flex justify-center">
          <Button onClick={fetchNextPage} disabled={isFetchingNextPage} variant="outline" size="lg">
            {isFetchingNextPage ? 'Loading…' : 'Load More'}
          </Button>
        </div>
      )}
    </>
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
