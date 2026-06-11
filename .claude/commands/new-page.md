# /new-page

Scaffold a new production-quality page for CineVault.

## Usage

```
/new-page <PageName> [description of what it displays]
```

Examples:
```
/new-page Movies displays a filterable infinite-scroll grid of movies by category and genre
/new-page ActorDetails shows full profile, biography, and filmography for a single actor
```

## What This Does

1. Reads `src/pages/`, `src/components/`, `src/util/API.ts`, `src/hooks/`, `src/router.tsx` first.
2. Adds fetch function(s) to `src/util/API.ts` with JSDoc (checks for duplicates).
3. Creates a TanStack Query hook in `src/hooks/`:
   - List pages → `useInfiniteQuery`
   - Detail pages → `useQueries`
4. Creates the page component at `src/pages/<PageName>/<PageName>.tsx`.
5. Creates sub-components under `src/components/` if reusable.
6. Registers the route in `src/router.tsx` with `React.lazy`.
7. Adds `<Helmet>` SEO tags (title, description, Open Graph for detail pages).

## Output Checklist

- [ ] Types in `src/types/tmdb.ts`
- [ ] Fetch function(s) in `src/util/API.ts` with JSDoc
- [ ] TanStack Query hook in `src/hooks/` with `staleTime` + `gcTime`
- [ ] Page at correct path with `<Helmet>` SEO block
- [ ] Route registered in `src/router.tsx` with `React.lazy`
- [ ] Loading skeleton while data loads
- [ ] Error state on failure
- [ ] Empty state on 0 results
- [ ] "Load More" button (infinite scroll) on list pages
- [ ] LCP image: `loading="eager"` + `fetchpriority="high"`
- [ ] All other images: `loading="lazy"`
- [ ] Lint passes (`pnpm lint`)

## Rules

- TypeScript only — `.tsx` extension.
- Tailwind classes only — no inline styles.
- No `any`.
- No `useState + useEffect` for async data — use TanStack Query.
- No numbered pagination — use `useInfiniteQuery` + "Load More".
- API keys from `import.meta.env.VITE_TMDB_API_KEY`.
