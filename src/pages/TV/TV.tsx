import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTVByCategory, useTVByGenre } from '@/hooks/useTV'
import { TVCard } from '@/components/TVCard/TVCard'
import { Button } from '@/components/ui/button'

const CATEGORY_LABELS: Record<string, string> = {
  airing_today: 'Airing Today',
  on_the_air: 'On TV',
  popular: 'Popular',
  top_rated: 'Top Rated',
}

/**
 * TVPage renders TV shows filtered by category or genre using TanStack Query infinite scroll.
 * URL params: ?category=, ?genre=, ?genreName=
 */
export function TVPage() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'popular'
  const genreId = searchParams.get('genre')
  const genreName = searchParams.get('genreName')

  const categoryResult = useTVByCategory(category)
  const genreResult = useTVByGenre(genreId ? Number(genreId) : 0)

  const active = genreId ? genreResult : categoryResult
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = active

  const heading = genreName ?? CATEGORY_LABELS[category] ?? 'TV Shows'
  const shows = data?.pages.flatMap((p) => p.results) ?? []

  return (
    <>
      <Helmet>
        <title>{heading} — CineVault</title>
        <meta name="description" content={`Browse ${heading.toLowerCase()} TV shows on CineVault.`} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">{heading}</h1>

        {error ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
            <p className="text-sm text-destructive">{(error as Error).message}</p>
          </div>
        ) : isLoading ? (
          <TVGridSkeleton />
        ) : shows.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-muted-foreground">No shows found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {shows.map((show) => (
                <TVCard key={show.id} show={show} />
              ))}
            </div>
            {hasNextPage && (
              <div className="mt-10 flex justify-center">
                <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="outline" size="lg">
                  {isFetchingNextPage ? 'Loading…' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function TVGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="aspect-2/3 animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
