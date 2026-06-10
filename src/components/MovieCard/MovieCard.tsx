import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

interface MovieCardProps {
  movie: Movie
  className?: string
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE}/w342${movie.poster_path}`
    : null

  const rating = movie.vote_average.toFixed(1)
  const year = movie.release_date?.slice(0, 4) ?? '—'

  return (
    <Link
      to={`/movies/${movie.id}`}
      data-testid="movie-card"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      {/* Poster */}
      <div className="aspect-2/3 w-full overflow-hidden bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-center text-xs px-2">{movie.title}</span>
          </div>
        )}
      </div>

      {/* Rating badge */}
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-yellow-400">
        <Star className="size-3 fill-yellow-400" />
        {rating}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-tight">{movie.title}</p>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </Link>
  )
}
