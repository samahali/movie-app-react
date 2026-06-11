import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, ExternalLink, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useActorDetailsFull } from '@/hooks/useActors'
import { Button } from '@/components/ui/button'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

const GENDER_LABELS: Record<number, string> = {
  0: 'Not specified',
  1: 'Female',
  2: 'Male',
  3: 'Non-binary',
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * ActorDetailsPage fetches full profile, credits, and external IDs in parallel.
 * IMDB link is derived from external_ids.imdb_id.
 */
export function ActorDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const personId = Number(id)
  const { person, credits, externalIds, isLoading, error } = useActorDetailsFull(personId)
  const [bioExpanded, setBioExpanded] = useState(false)

  useEffect(() => {
    if (person?.name) document.title = `${person.name} — CineVault`
    return () => { document.title = 'CineVault' }
  }, [person?.name])

  if (isLoading) return <DetailsSkeleton />
  if (error) return (
    <div className="m-8 flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
      <p className="text-sm text-destructive">{(error as Error).message}</p>
    </div>
  )
  if (!person) return null

  const profileUrl = person.profile_path ? `${IMAGE_BASE}/w342${person.profile_path}` : null
  const ogImageUrl = person.profile_path ? `${IMAGE_BASE}/w185${person.profile_path}` : null
  const genderLabel = GENDER_LABELS[person.gender] ?? 'Not specified'

  const topCredits = credits
    ? [...credits.cast].sort((a, b) => b.popularity - a.popularity).slice(0, 8)
    : []

  const shortBio = person.biography.slice(0, 400)
  const hasBioMore = person.biography.length > 400

  return (
    <>
      <Helmet>
        <title>{person.name} — CineVault</title>
        <meta name="description" content={person.biography.slice(0, 155) || `${person.name} — actor profile on CineVault.`} />
        <meta property="og:title" content={`${person.name} — CineVault`} />
        <meta property="og:description" content={person.biography.slice(0, 155) || `${person.name} on CineVault.`} />
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        <meta property="og:type" content="profile" />
      </Helmet>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Profile photo */}
          <div className="w-full shrink-0 md:w-56">
            <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
              {profileUrl ? (
                <img src={profileUrl} alt={person.name} className="w-full" loading="eager" fetchPriority="high" />
              ) : (
                <div className="aspect-2/3 flex items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                  {person.name[0]}
                </div>
              )}
            </div>

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
                  <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
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
                    className="mt-2 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    const to = credit.media_type === 'movie' ? `/movies/${credit.id}` : `/tv/${credit.id}`
                    const title = credit.title ?? credit.name ?? 'Unknown'
                    const posterUrl = credit.poster_path ? `${IMAGE_BASE}/w185${credit.poster_path}` : null
                    return (
                      <Link
                        key={`${credit.id}-${credit.media_type}`}
                        to={to}
                        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">{title}</div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="line-clamp-2 text-xs font-medium">{title}</p>
                          <p className="mt-0.5 text-xs capitalize text-muted-foreground">{credit.media_type}</p>
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
    </>
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
