# /new-api

Add a new TMDB API fetch function and TanStack Query hook to CineVault.

## Usage

```
/new-api <description of what to fetch>
```

Examples:
```
/new-api fetch movie credits (cast and crew) for a given movie ID
/new-api fetch trending actors for the week with infinite scroll
/new-api fetch TV show details including seasons for a given show ID
```

## What This Does

1. Reads `src/util/API.ts` in full — no duplicates.
2. Reads `src/types/tmdb.ts` — extends existing interfaces where possible.
3. Adds the fetch function to `src/util/API.ts` with JSDoc.
4. Creates a TanStack Query hook in `src/hooks/`:
   - Paginated lists → `useInfiniteQuery`
   - Single resources → `useQuery`
   - Parallel fetches → `useQueries`

## Fetch Function Template

```ts
/**
 * [What this fetches and from which endpoint]
 *
 * @param id - TMDB resource ID
 * @param page - Page number (default: 1)
 * @returns Promise resolving to [InterfaceName]
 *
 * @example
 * const credits = await fetchMovieCredits(550)
 */
export async function fetchMovieCredits(id: number): Promise<Credits> {
  return get<Credits>(`/movie/${id}/credits`)
}
```

## Hook Template (list)

```ts
export function useMoviesByGenre(genreId: number) {
  return useInfiniteQuery({
    queryKey: ['movies', 'genre', genreId],
    queryFn: ({ pageParam }) => fetchMoviesByGenre(genreId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!genreId,
  })
}
```

## Output Checklist

- [ ] No duplicate function in `src/util/API.ts`
- [ ] Response interface in `src/types/tmdb.ts`
- [ ] Fetch function exported with JSDoc (`@param`, `@returns`, `@example`)
- [ ] Throws on non-OK HTTP status (via `get()` helper)
- [ ] No hardcoded API key or base URL
- [ ] TanStack Query hook in `src/hooks/` with `staleTime`, `gcTime`, `enabled`

## Rules

- No `useState + useEffect` in hooks — TanStack Query only.
- Never hardcode base URL or API key.
- List endpoints accept `page` defaulting to `1`.
- `enabled: !!id` on all hooks that take an ID.
- No `any` — define the response interface.
