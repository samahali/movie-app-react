import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import {
  fetchTrendingActors,
  fetchPersonDetails,
  fetchPersonCredits,
  fetchPersonExternalIds,
} from '@/util/API'

const STALE_LIST = 5 * 60 * 1000
const STALE_DETAIL = 10 * 60 * 1000
const GC_LIST = 10 * 60 * 1000
const GC_DETAIL = 15 * 60 * 1000

/** Infinite-scroll hook for trending actors. */
export function useTrendingActors() {
  return useInfiniteQuery({
    queryKey: ['people', 'trending'],
    queryFn: ({ pageParam }) => fetchTrendingActors(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: STALE_LIST,
    gcTime: GC_LIST,
  })
}

/**
 * Parallel hook for all actor detail page data.
 * Fetches person details, combined credits, and external IDs in one call.
 */
export function useActorDetailsFull(id: number) {
  const results = useQueries({
    queries: [
      { queryKey: ['person', id, 'details'],      queryFn: () => fetchPersonDetails(id),      staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['person', id, 'credits'],      queryFn: () => fetchPersonCredits(id),      staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
      { queryKey: ['person', id, 'external_ids'], queryFn: () => fetchPersonExternalIds(id),  staleTime: STALE_DETAIL, gcTime: GC_DETAIL, enabled: id > 0 },
    ],
  })
  const [person, credits, externalIds] = results
  const isLoading = results.some((r) => r.isLoading)
  const error = results.find((r) => r.error)?.error ?? null
  return { person: person.data, credits: credits.data, externalIds: externalIds.data, isLoading, error }
}
