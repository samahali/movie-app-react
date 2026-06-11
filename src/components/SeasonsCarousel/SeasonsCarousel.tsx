import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TVSeason } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string
const VISIBLE = 6

export interface SeasonsCarouselProps {
  seasons: TVSeason[]
}

export function SeasonsCarousel({ seasons }: SeasonsCarouselProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(seasons.length / VISIBLE)
  const visible = seasons.slice(page * VISIBLE, page * VISIBLE + VISIBLE)

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Seasons</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Previous seasons"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Next seasons"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {visible.map((season) => (
          <div
            key={season.id}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-2/3 overflow-hidden bg-muted">
              {season.poster_path ? (
                <img
                  src={`${IMAGE_BASE}/w185${season.poster_path}`}
                  alt={season.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-1 text-xs font-semibold">{season.name}</p>
              <p className="text-xs text-muted-foreground">{season.episode_count} eps</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                i === page ? 'w-5 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground'
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
