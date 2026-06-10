import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import {
  fetchAiringTodayTV,
  fetchOnAirTV,
  fetchPopularTV,
  fetchTopRatedTV,
  fetchTVByGenre,
} from '@/util/API'
import { Pagination } from '@/components/Pagination/Pagination'
import { cn } from '@/lib/utils'
import type { TVShow, PaginatedResponse } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

const CATEGORY_LABELS: Record<string, string> = {
  airing_today: 'Airing Today',
  on_the_air: 'On TV',
  popular: 'Popular',
  top_rated: 'Top Rated',
}

/**
 * TVPage renders TV shows filtered by category or genre.
 * URL params: ?category=, ?genre=, ?genreName=
 */
export function TVPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'popular'
  const genreId = searchParams.get('genre')
  const genreName = searchParams.get('genreName')
  const page = Number(searchParams.get('page') ?? '1')

  const [shows, setShows] = useState<TVShow[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    let request: Promise<PaginatedResponse<TVShow>>

    if (genreId) {
      request = fetchTVByGenre(Number(genreId), page)
    } else {
      const fetchMap: Record<string, (p: number) => Promise<PaginatedResponse<TVShow>>> = {
        airing_today: fetchAiringTodayTV,
        on_the_air: fetchOnAirTV,
        popular: fetchPopularTV,
        top_rated: fetchTopRatedTV,
      }
      request = (fetchMap[category] ?? fetchPopularTV)(page)
    }

    request
      .then((data) => {
        setShows(data.results)
        setTotalPages(data.total_pages)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setIsLoading(false))
  }, [category, genreId, page])

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const heading = genreName ?? CATEGORY_LABELS[category] ?? 'TV Shows'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{heading}</h1>

      {error ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

function TVCard({ show }: { show: TVShow }) {
  const posterUrl = show.poster_path ? `${IMAGE_BASE}/w342${show.poster_path}` : null
  const year = show.first_air_date?.slice(0, 4) ?? '—'

  return (
    <Link
      to={`/tv/${show.id}`}
      data-testid="tv-card"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <div className="aspect-2/3 overflow-hidden bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={show.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground px-2 text-center">
            {show.name}
          </div>
        )}
      </div>
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-yellow-400">
        <Star className="size-3 fill-yellow-400" />
        {show.vote_average.toFixed(1)}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-tight">{show.name}</p>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </Link>
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
