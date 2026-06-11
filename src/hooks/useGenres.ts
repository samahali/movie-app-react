import { useQuery } from '@tanstack/react-query'
import { fetchMovieGenres, fetchTVGenres } from '@/util/API'

const STALE = 60 * 60 * 1000
const GC = 24 * 60 * 60 * 1000

/** Hook to fetch the TMDB movie or TV genre list. Cached for 1 hour. */
export function useGenres(mediaType: 'movie' | 'tv', options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['genres', mediaType],
    queryFn: () => (mediaType === 'movie' ? fetchMovieGenres() : fetchTVGenres()),
    staleTime: STALE,
    gcTime: GC,
    select: (data) => data.genres,
    enabled: options?.enabled ?? true,
  })
}
