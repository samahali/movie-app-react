import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { fetchTrendingActors } from '@/util/API'
import { Pagination } from '@/components/Pagination/Pagination'
import type { Person } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

export function ActorsPage() {
  const [actors, setActors] = useState<Person[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchTrendingActors(page)
      .then((data) => {
        if (cancelled) return
        setIsLoading(false)
        setError(null)
        setActors(data.results)
        setTotalPages(data.total_pages)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setIsLoading(false)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      })
    return () => { cancelled = true }
  }, [page])

  function handlePageChange(newPage: number) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp className="size-7 text-primary" />
        <h1 className="text-3xl font-bold">Trending Actors</h1>
      </div>

      {error ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : isLoading ? (
        <ActorsGridSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {actors.map((actor) => (
              <ActorCard key={actor.id} actor={actor} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

function ActorCard({ actor }: { actor: Person }) {
  const profileUrl = actor.profile_path
    ? `${IMAGE_BASE}/w342${actor.profile_path}`
    : null

  return (
    <Link
      to={`/actors/${actor.id}`}
      data-testid="actor-card"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-2/3 w-full overflow-hidden bg-muted">
        {profileUrl ? (
          <img
            src={profileUrl}
            alt={actor.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            {actor.name[0]}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold leading-tight">{actor.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{actor.known_for_department}</p>
      </div>
    </Link>
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
