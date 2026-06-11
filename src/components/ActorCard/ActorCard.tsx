import { Link } from 'react-router-dom'
import type { Person } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

export interface ActorCardProps {
  actor: Person
}

export function ActorCard({ actor }: ActorCardProps) {
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
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
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
