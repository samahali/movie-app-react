import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchMoviesByGenre,
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieVideos,
  fetchSimilarMovies,
  fetchSearchMulti,
} from '@/util/API'
import type { Movie, PaginatedResponse } from '@/types/tmdb'

type MovieCategory = 'now_playing' | 'popular' | 'top_rated' | 'upcoming'

const FETCH_MAP: Record<MovieCategory, (page: number) => Promise<PaginatedResponse<Movie>>> = {
  now_playing: fetchNowPlayingMovies,
  popular: fetchPopularMovies,
  top_rated: fetchTopRatedMovies,
  upcoming: fetchUpcomingMovies,
}

const STALE_LIST = 5 * 60 * 1000
const STALE_DETAIL = 10 * 60 * 1000
const GC_LIST = 10 * 60 * 1000
const GC_DETAIL = 15 * 60 * 1000

/** Infinite-scroll hook for a movie category (now_playing, popular, top_rated, upcoming). */
export function useMoviesByCategory(category: string) {
  const key = (FETCH_MAP[category as MovieCategory] ? category : 'popular') as MovieCategory
  return useInfiniteQuery({
    queryKey: ['movies', 'category', key],
    queryFn: ({ pageParam }) => (FETCH_MAP[key])(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: STALE_LIST,
    gcTime: GC_LIST,
  })
}

/** Infinite-scroll hook for movies filtered by TMDB genre ID. */
export function useMoviesByGenre(genreId: number) {
  return useInfiniteQuery({
    queryKey: ['movies', 'genre', genreId],
    queryFn: ({ pageParam }) => fetchMoviesByGenre(genreId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: STALE_LIST,
    gcTime: GC_LIST,
    enabled: genreId > 0,
  })
}

/** Infinite-scroll hook for multi-search results filtered to movies only. */
export function useMovieSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ['movies', 'search', query],
    queryFn: async ({ pageParam }) => {
      const data = await fetchSearchMulti(query, pageParam)
      return {
        ...data,
        // MultiSearchResult with media_type==='movie' has all Movie fields
        results: data.results.filter((r) => r.media_type === 'movie') as unknown as Movie[],
      }
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: query.length > 0,
  })
}

/**
 * Parallel hook for all movie detail page data.
 * Fetches details, credits, videos, and similar movies in one call.
 */
export function useMovieDetailsFull(id: number) {
  const results = useQueries({
    queries: [
      { queryKey: ['movie', id, 'details'],  queryFn: () => fetchMovieDetails(id),  staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['movie', id, 'credits'],  queryFn: () => fetchMovieCredits(id),  staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['movie', id, 'videos'],   queryFn: () => fetchMovieVideos(id),   staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['movie', id, 'similar'],  queryFn: () => fetchSimilarMovies(id), staleTime: STALE_LIST,   gcTime: GC_LIST,   enabled: id > 0 },
    ],
  })
  const [details, credits, videos, similar] = results
  const isLoading = results.some((r) => r.isLoading)
  const error = results.find((r) => r.error)?.error ?? null
  return { details: details.data, credits: credits.data, videos: videos.data, similar: similar.data, isLoading, error }
}
