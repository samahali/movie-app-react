import { Helmet } from 'react-helmet-async'
import { TrendingUp } from 'lucide-react'
import { useTrendingActors } from '@/hooks/useActors'
import { ActorCard } from '@/components/ActorCard/ActorCard'
import { Button } from '@/components/ui/button'

/** ActorsPage shows trending actors from TMDB with infinite scroll. */
export function ActorsPage() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useTrendingActors()
  const actors = data?.pages.flatMap((p) => p.results) ?? []

  return (
    <>
      <Helmet>
        <title>Trending Actors — CineVault</title>
        <meta name="description" content="Discover the most popular actors and actresses trending this week on CineVault." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex items-center gap-3">
          <TrendingUp className="size-7 text-primary" />
          <h1 className="text-3xl font-bold">Trending Actors</h1>
        </header>

        {error ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
            <p className="text-sm text-destructive">{(error as Error).message}</p>
          </div>
        ) : isLoading ? (
          <ActorsGridSkeleton />
        ) : actors.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-muted-foreground">No actors found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {actors.map((actor) => (
                <ActorCard key={actor.id} actor={actor} />
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

function ActorsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="aspect-2/3 animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
