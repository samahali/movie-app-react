# /new-page

Scaffold a new page for the movie-app.

## Usage

```
/new-page <PageName> [description of what it displays]
```

Examples:
```
/new-page Movies displays a filterable grid of movies based on category and genre
/new-page ActorDetails shows full profile and filmography for a single actor
```

## What This Does

1. Creates `src/pages/<PageName>/<PageName>.tsx` (or `src/pages/<PageName>.tsx` for simple pages).
2. Adds any required fetch functions to `src/util/API.ts` with JSDoc (checks for duplicates first).
3. Creates a custom hook in `src/hooks/use<PageName>.ts` if data-fetching logic is non-trivial.
4. Registers the route in the router file (`src/App.tsx` or `src/router.tsx`).
5. Lists any sub-components that should be created separately.

## Output Checklist

Before finishing, confirm:
- [ ] Page file created at the correct path
- [ ] Route registered (show the route path used)
- [ ] Fetch functions added or existing ones reused
- [ ] Loading skeleton shown while data loads (use shadcn `Skeleton`)
- [ ] Error state shown if the API call fails
- [ ] Empty state shown if the API returns no results
- [ ] TypeScript types defined for all API responses

## Rules

- TypeScript only — `.tsx` extension.
- Tailwind classes only — no inline styles.
- No `any` types.
- API keys from `import.meta.env.VITE_TMDB_API_KEY`.
- JSDoc on the page component if it makes multiple API calls.
