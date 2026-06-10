import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { fetchNowPlayingMovies, fetchPopularMovies, fetchTopRatedMovies } from '@/util/API'
import { MovieCard } from '@/components/MovieCard/MovieCard'
import { Pagination } from '@/components/Pagination/Pagination'
import { Button } from '@/components/ui/button'
import type { Movie, PaginatedResponse } from '@/types/tmdb'

type Section = 'now_playing' | 'popular' | 'top_rated'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'now_playing', label: 'Now Playing' },
  { key: 'popular', label: 'Popular' },
  { key: 'top_rated', label: 'Top Rated' },
]

const FETCH_MAP: Record<Section, (page: number) => Promise<PaginatedResponse<Movie>>> = {
  now_playing: fetchNowPlayingMovies,
  popular: fetchPopularMovies,
  top_rated: fetchTopRatedMovies,
}

export function HomePage() {
  const [activeSection, setActiveSection] = useState<Section>('now_playing')
  const [movies, setMovies] = useState<Movie[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    FETCH_MAP[activeSection](page)
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
  }, [activeSection, page])

  function handleSectionChange(section: Section) {
    setActiveSection(section)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Discover Movies &amp; Shows
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Explore the latest in cinema and television
        </p>
      </div>

      {/* Section tabs */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              onClick={() => handleSectionChange(section.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeSection === section.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link to={`/movies?category=${activeSection}`} className="gap-1">
            See all <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Grid */}
      {error ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : isLoading ? (
        <MovieGridSkeleton />
      ) : movies.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center text-muted-foreground">
          No movies found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
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
