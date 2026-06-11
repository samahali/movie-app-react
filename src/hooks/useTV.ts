import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import {
  fetchAiringTodayTV,
  fetchOnAirTV,
  fetchPopularTV,
  fetchTopRatedTV,
  fetchTVByGenre,
  fetchTVDetails,
  fetchTVCredits,
  fetchTVVideos,
  fetchSimilarTV,
} from '@/util/API'
import type { TVShow, PaginatedResponse } from '@/types/tmdb'

type TVCategory = 'airing_today' | 'on_the_air' | 'popular' | 'top_rated'

const FETCH_MAP: Record<TVCategory, (page: number) => Promise<PaginatedResponse<TVShow>>> = {
  airing_today: fetchAiringTodayTV,
  on_the_air: fetchOnAirTV,
  popular: fetchPopularTV,
  top_rated: fetchTopRatedTV,
}

const STALE_LIST = 5 * 60 * 1000
const STALE_DETAIL = 10 * 60 * 1000
const GC_LIST = 10 * 60 * 1000
const GC_DETAIL = 15 * 60 * 1000

/** Infinite-scroll hook for a TV category. */
export function useTVByCategory(category: string) {
  const key = (FETCH_MAP[category as TVCategory] ? category : 'popular') as TVCategory
  return useInfiniteQuery({
    queryKey: ['tv', 'category', key],
    queryFn: ({ pageParam }) => (FETCH_MAP[key])(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: STALE_LIST,
    gcTime: GC_LIST,
  })
}

/** Infinite-scroll hook for TV shows filtered by TMDB genre ID. */
export function useTVByGenre(genreId: number) {
  return useInfiniteQuery({
    queryKey: ['tv', 'genre', genreId],
    queryFn: ({ pageParam }) => fetchTVByGenre(genreId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: STALE_LIST,
    gcTime: GC_LIST,
    enabled: genreId > 0,
  })
}

/**
 * Parallel hook for all TV detail page data.
 * Fetches details, credits, videos, and similar shows in one call.
 */
export function useTVDetailsFull(id: number) {
  const results = useQueries({
    queries: [
      { queryKey: ['tv', id, 'details'],  queryFn: () => fetchTVDetails(id),  staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['tv', id, 'credits'],  queryFn: () => fetchTVCredits(id),  staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['tv', id, 'videos'],   queryFn: () => fetchTVVideos(id),   staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['tv', id, 'similar'],  queryFn: () => fetchSimilarTV(id),  staleTime: STALE_LIST,   gcTime: GC_LIST,   enabled: id > 0 },
    ],
  })
  const [details, credits, videos, similar] = results
  const isLoading = results.some((r) => r.isLoading)
  const error = results.find((r) => r.error)?.error ?? null
  return { details: details.data, credits: credits.data, videos: videos.data, similar: similar.data, isLoading, error }
}
