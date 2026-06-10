import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, ExternalLink, Star } from 'lucide-react'
import { fetchPersonDetails, fetchPersonCredits, fetchPersonExternalIds } from '@/util/API'
import { Button } from '@/components/ui/button'
import type { PersonDetails, CombinedCreditsResponse, PersonExternalIds } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

/**
 * ActorDetailsPage fetches full profile, credits, and external IDs in parallel.
 * IMDB link is derived from external_ids.imdb_id.
 */
export function ActorDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const personId = Number(id)

  const [person, setPerson] = useState<PersonDetails | null>(null)
  const [credits, setCredits] = useState<CombinedCreditsResponse | null>(null)
  const [externalIds, setExternalIds] = useState<PersonExternalIds | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bioExpanded, setBioExpanded] = useState(false)

  useEffect(() => {
    if (!personId) return
    setIsLoading(true)
    setError(null)

    Promise.all([
      fetchPersonDetails(personId),
      fetchPersonCredits(personId),
      fetchPersonExternalIds(personId),
    ])
      .then(([personData, creditsData, externalData]) => {
        setPerson(personData)
        setCredits(creditsData)
        setExternalIds(externalData)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setIsLoading(false))
  }, [personId])

  if (isLoading) return <DetailsSkeleton />
  if (error) return (
    <div className="m-8 flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
      <p className="text-sm text-destructive">{error}</p>
    </div>
  )
  if (!person) return null

  const profileUrl = person.profile_path
    ? `${IMAGE_BASE}/w342${person.profile_path}`
    : null

  const genderLabel = person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Non-binary'

  // top 8 credits sorted by popularity
  const topCredits = credits
    ? [...credits.cast]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 8)
    : []

  const shortBio = person.biography.slice(0, 400)
  const hasBioMore = person.biography.length > 400

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Profile photo */}
        <div className="w-full md:w-56 shrink-0">
          <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
            {profileUrl ? (
              <img src={profileUrl} alt={person.name} className="w-full" />
            ) : (
              <div className="aspect-2/3 flex items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                {person.name[0]}
              </div>
            )}
          </div>

          {/* Personal info sidebar */}
          <div className="mt-4 space-y-3 text-sm">
            <InfoRow label="Known For" value={person.known_for_department} />
            <InfoRow label="Gender" value={genderLabel} />
            {person.birthday && <InfoRow label="Born" value={formatDate(person.birthday)} />}
            {person.deathday && <InfoRow label="Died" value={formatDate(person.deathday)} />}
            {person.place_of_birth && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Birthplace</p>
                <p className="mt-0.5 flex items-start gap-1">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  {person.place_of_birth}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Popularity</p>
              <p className="mt-0.5 flex items-center gap-1">
                <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
                {person.popularity.toFixed(1)}
              </p>
            </div>
            {externalIds?.imdb_id && (
              <a
                href={`https://www.imdb.com/name/${externalIds.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="mt-2 w-full gap-1.5">
                  <ExternalLink className="size-3.5" />
                  IMDB Profile
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{person.name}</h1>

          {person.biography && (
            <section className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">Biography</h2>
              <p className="leading-relaxed text-muted-foreground">
                {bioExpanded ? person.biography : shortBio}
                {hasBioMore && !bioExpanded && '…'}
              </p>
              {hasBioMore && (
                <button
                  onClick={() => setBioExpanded((prev) => !prev)}
                  className="mt-2 text-sm text-primary underline-offset-4 hover:underline"
                >
                  {bioExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </section>
          )}

          {topCredits.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-semibold">Known For</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {topCredits.map((credit) => {
                  const to = credit.media_type === 'movie'
                    ? `/movies/${credit.id}`
                    : `/tv/${credit.id}`
                  const title = credit.title ?? credit.name ?? 'Unknown'
                  const posterUrl = credit.poster_path
                    ? `${IMAGE_BASE}/w185${credit.poster_path}`
                    : null

                  return (
                    <Link
                      key={`${credit.id}-${credit.media_type}`}
                      to={to}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-2/3 overflow-hidden bg-muted">
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground px-2 text-center">{title}</div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium line-clamp-2">{title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground capitalize">{credit.media_type}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10">
      <div className="flex gap-8">
        <div className="h-72 w-48 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-10 w-2/3 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-4/6 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
