import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TVShow } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

export interface TVCardProps {
  show: TVShow
  className?: string
}

export function TVCard({ show, className }: TVCardProps) {
  const posterUrl = show.poster_path ? `${IMAGE_BASE}/w342${show.poster_path}` : null
  const year = show.first_air_date?.slice(0, 4) ?? '—'

  return (
    <Link
      to={`/tv/${show.id}`}
      data-testid="tv-card"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
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
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
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
