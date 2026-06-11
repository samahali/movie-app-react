import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Play, X, Star, Globe, Tv } from 'lucide-react'
import { useTVDetailsFull } from '@/hooks/useTV'
import { SeasonsCarousel } from '@/components/SeasonsCarousel/SeasonsCarousel'
import { TVCard } from '@/components/TVCard/TVCard'
import { Button } from '@/components/ui/button'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

/**
 * TVDetailsPage fetches and displays full info for a single TV show.
 * Uses useTVDetailsFull which fires 4 parallel TanStack Query fetches.
 */
export function TVDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const showId = Number(id)
  const { details, credits, videos, similar, isLoading, error } = useTVDetailsFull(showId)
  const [trailerOpen, setTrailerOpen] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [showId])
  useEffect(() => {
    if (details?.name) document.title = `${details.name} — CineVault`
    return () => { document.title = 'CineVault' }
  }, [details?.name])

  if (isLoading) return <DetailsSkeleton />
  if (error) return (
    <div className="m-8 flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
      <p className="text-sm text-destructive">{(error as Error).message}</p>
    </div>
  )
  if (!details) return null

  const trailer = videos?.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
  ) ?? videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')

  const topCast = credits?.cast.slice(0, 10) ?? []
  const similarShows = similar?.results.slice(0, 6) ?? []

  const backdropUrl = details.backdrop_path ? `${IMAGE_BASE}/w1280${details.backdrop_path}` : null
  const posterUrl = details.poster_path ? `${IMAGE_BASE}/w500${details.poster_path}` : null
  const ogImageUrl = details.backdrop_path ? `${IMAGE_BASE}/w780${details.backdrop_path}` : null

  return (
    <>
      <Helmet>
        <title>{details.name} — CineVault</title>
        <meta name="description" content={details.overview.slice(0, 155)} />
        <meta property="og:title" content={`${details.name} — CineVault`} />
        <meta property="og:description" content={details.overview.slice(0, 155)} />
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        <meta property="og:type" content="video.tv_show" />
      </Helmet>

      <div className="min-h-screen">
        {/* ── Full-bleed backdrop ── */}
        <div className="relative h-[75vh] w-full overflow-hidden md:h-[80vh]">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={`Backdrop for ${details.name}`}
              className="h-full w-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10">
            <div className="flex flex-col items-end gap-6 md:flex-row md:items-end md:gap-8">

              {/* Poster */}
              <div className="hidden shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl shadow-black/70 md:block md:w-52 lg:w-64">
                {posterUrl ? (
                  <img src={posterUrl} alt={details.name} className="w-full" loading="lazy" />
                ) : (
                  <div className="aspect-2/3 w-full bg-muted" />
                )}
              </div>

              {/* Title block */}
              <div className="flex flex-1 flex-col gap-3 pb-1">
                <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
                  {details.name}
                </h1>
                {details.tagline && (
                  <p className="text-sm italic text-white/70 md:text-base">"{details.tagline}"</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                  <span className="flex items-center gap-1 font-semibold text-yellow-400">
                    <Star className="size-4 fill-yellow-400" />
                    {details.vote_average.toFixed(1)}
                  </span>
                  <span className="opacity-40">|</span>
                  <span className="flex items-center gap-1">
                    <Tv className="size-4" />
                    {details.number_of_seasons} season{details.number_of_seasons !== 1 ? 's' : ''}
                  </span>
                  <span className="opacity-40">|</span>
                  <span>{details.number_of_episodes} episodes</span>
                  <span className="opacity-40">|</span>
                  <span className="flex items-center gap-1">
                    <Globe className="size-4" />
                    {details.original_language.toUpperCase()}
                  </span>
                  <span className="opacity-40">|</span>
                  <span>{details.first_air_date?.slice(0, 4)}</span>
                  <span className="opacity-40">|</span>
                  <span>{details.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
                    <Link
                      key={genre.id}
                      to={`/tv?genre=${genre.id}&genreName=${encodeURIComponent(genre.name)}`}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ring-1 ring-white/20 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
                {trailer && (
                  <Button onClick={() => setTrailerOpen(true)} size="lg" className="mt-1 w-fit gap-2 shadow-lg">
                    <Play className="size-5 fill-current" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Below-the-fold ── */}
        <div className="mx-auto max-w-7xl px-4 pb-20">
          <section className="mt-12">
            <h2 className="mb-3 text-xl font-semibold">Overview</h2>
            <p className="max-w-3xl leading-relaxed text-muted-foreground">{details.overview}</p>
          </section>

          {details.seasons.length > 0 && <SeasonsCarousel seasons={details.seasons} />}

          {topCast.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold">Cast</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
                {topCast.map((member) => (
                  <Link
                    key={member.id}
                    to={`/actors/${member.id}`}
                    className="group flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="size-14 overflow-hidden rounded-full bg-muted ring-2 ring-border transition-all group-hover:ring-primary md:size-16">
                      {member.profile_path ? (
                        <img
                          src={`${IMAGE_BASE}/w45${member.profile_path}`}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">?</div>
                      )}
                    </div>
                    <p className="text-xs font-medium leading-tight">{member.name}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{member.character}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {details.production_companies.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold">Production</h2>
              <div className="flex flex-wrap gap-3">
                {details.production_companies.map((company) => (
                  <div key={company.id} className="flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-4">
                    {company.logo_path ? (
                      <img
                        src={`${IMAGE_BASE}/w92${company.logo_path}`}
                        alt={company.name}
                        className="h-6 max-w-20 object-contain dark:invert"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">{company.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {similarShows.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold">Similar Shows</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                {similarShows.map((show) => (
                  <TVCard key={show.id} show={show} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Trailer modal ── */}
        {trailerOpen && trailer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setTrailerOpen(false)}
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title={trailer.name}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <div className="flex items-center justify-between bg-zinc-900 px-4 py-2">
                <p className="text-sm text-zinc-300">{trailer.name}</p>
                <button
                  onClick={() => setTrailerOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Close trailer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function DetailsSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-[55vh] w-full bg-muted md:h-[65vh]" />
      <div className="mx-auto max-w-7xl px-4 pb-20">
        <div className="-mt-48 flex gap-8 md:-mt-56">
          <div className="h-72 w-48 rounded-2xl bg-muted shadow-xl md:h-96 md:w-64" />
          <div className="flex flex-1 flex-col gap-4 pt-32 md:pt-48">
            <div className="h-10 w-2/3 rounded-lg bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
            <div className="h-10 w-36 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
