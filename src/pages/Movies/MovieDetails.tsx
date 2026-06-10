import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Globe, Play, X, Star } from 'lucide-react'
import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieVideos,
  fetchSimilarMovies,
} from '@/util/API'
import { MovieCard } from '@/components/MovieCard/MovieCard'
import { Button } from '@/components/ui/button'
import type { MovieDetails, Credits, VideosResponse, Movie } from '@/types/tmdb'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE as string

/**
 * MovieDetailsPage fetches and displays full info for a single movie.
 * Makes 4 parallel API calls: details, credits, videos, similar movies.
 */
export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const movieId = Number(id)

  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [credits, setCredits] = useState<Credits | null>(null)
  const [videos, setVideos] = useState<VideosResponse | null>(null)
  const [similar, setSimilar] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trailerOpen, setTrailerOpen] = useState(false)

  useEffect(() => {
    if (!movieId) return
    setIsLoading(true)
    setError(null)
    window.scrollTo(0, 0)

    Promise.all([
      fetchMovieDetails(movieId),
      fetchMovieCredits(movieId),
      fetchMovieVideos(movieId),
      fetchSimilarMovies(movieId),
    ])
      .then(([detailsData, creditsData, videosData, similarData]) => {
        setDetails(detailsData)
        setCredits(creditsData)
        setVideos(videosData)
        setSimilar(similarData.results.slice(0, 6))
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setIsLoading(false))
  }, [movieId])

  if (isLoading) return <DetailsSkeleton />
  if (error) return <ErrorState message={error} />
  if (!details) return null

  const trailer = videos?.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
  ) ?? videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')

  const director = credits?.crew.find((c) => c.job === 'Director')
  const topCast = credits?.cast.slice(0, 10) ?? []

  const backdropUrl = details.backdrop_path
    ? `${IMAGE_BASE}/original${details.backdrop_path}`
    : null
  const posterUrl = details.poster_path
    ? `${IMAGE_BASE}/w500${details.poster_path}`
    : null

  function formatRuntime(minutes: number | null) {
    if (!minutes) return '—'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen">
      {/* ── Full-bleed backdrop with content anchored inside ── */}
      <div className="relative h-[75vh] w-full overflow-hidden md:h-[80vh]">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        {/* gradient: transparent top → opaque bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

        {/* ── Hero content sits at the bottom of the backdrop ── */}
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10">
          <div className="flex flex-col items-end gap-6 md:flex-row md:items-end md:gap-8">

            {/* Poster */}
            <div className="hidden shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl shadow-black/70 md:block md:w-52 lg:w-64">
              {posterUrl ? (
                <img src={posterUrl} alt={details.title} className="w-full" />
              ) : (
                <div className="aspect-2/3 w-full bg-muted" />
              )}
            </div>

            {/* Title block */}
            <div className="flex flex-1 flex-col gap-3 pb-1">
              <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
                {details.title}
              </h1>

              {details.tagline && (
                <p className="text-sm italic text-white/70 md:text-base">
                  "{details.tagline}"
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1 font-semibold text-yellow-400">
                  <Star className="size-4 fill-yellow-400" />
                  {details.vote_average.toFixed(1)}
                </span>
                <span className="opacity-40">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {formatRuntime(details.runtime)}
                </span>
                <span className="opacity-40">|</span>
                <span className="flex items-center gap-1">
                  <Globe className="size-4" />
                  {details.original_language.toUpperCase()}
                </span>
                <span className="opacity-40">|</span>
                <span>{details.release_date?.slice(0, 4)}</span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/movies?genre=${genre.id}&genreName=${encodeURIComponent(genre.name)}`}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ring-1 ring-white/20 transition-colors hover:bg-white/20"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Actions */}
              {trailer && (
                <Button
                  onClick={() => setTrailerOpen(true)}
                  size="lg"
                  className="mt-1 w-fit gap-2 shadow-lg"
                >
                  <Play className="size-5 fill-current" />
                  Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Below-the-fold content ───────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pb-20">

        {/* ── Overview ─────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="mb-3 text-xl font-semibold">Overview</h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">{details.overview}</p>
        </section>

        {/* ── Director ─────────────────────────────────────── */}
        {director && (
          <section className="mt-8">
            <h2 className="mb-1 text-xl font-semibold">Director</h2>
            <p className="text-muted-foreground">{director.name}</p>
          </section>
        )}

        {/* ── Cast ─────────────────────────────────────────── */}
        {topCast.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Cast</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
              {topCast.map((member) => (
                <Link
                  key={member.id}
                  to={`/actors/${member.id}`}
                  className="group flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-muted"
                >
                  <div className="size-14 overflow-hidden rounded-full bg-muted ring-2 ring-border transition-all group-hover:ring-primary md:size-16">
                    {member.profile_path ? (
                      <img
                        src={`${IMAGE_BASE}/w185${member.profile_path}`}
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

        {/* ── Production companies ─────────────────────────── */}
        {details.production_companies.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Production</h2>
            <div className="flex flex-wrap gap-3">
              {details.production_companies.map((company) => (
                <div
                  key={company.id}
                  className="flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-4"
                >
                  {company.logo_path ? (
                    <img
                      src={`${IMAGE_BASE}/w92${company.logo_path}`}
                      alt={company.name}
                      className="h-6 max-w-20 object-contain dark:invert"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{company.name}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Similar movies ───────────────────────────────── */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Similar Movies</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {similar.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </div>{/* end below-fold container */}

      {/* ── Trailer modal ────────────────────────────────────── */}
      {trailerOpen && trailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Close trailer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="m-8 flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  )
}
