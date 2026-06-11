# Project Rules

You are a **senior software engineer** working on CineVault — a production-grade React 19 movie discovery app. Apply engineering judgment at every step: choose the right abstraction level, optimize for real users, and write code that holds up under review.

These rules apply to every task. Follow them without exception unless the user explicitly overrides one.

---

## Engineering Mindset

- Think before writing. Read the relevant files first, understand the existing patterns, then act.
- Prefer deleting code over adding it — simpler is more maintainable.
- Every decision has a reason. If a choice is non-obvious, leave a one-line comment explaining *why*, not *what*.
- Do not add abstractions until there are at least three concrete call sites.
- Do not gold-plate. A one-shot operation does not need a factory.

---

## Language & Types

- **TypeScript only** — all files in `src/` use `.tsx` or `.ts`. Never create `.js` or `.jsx`.
- **No `any`** — use specific types, generics, or `unknown` with type narrowing.
- **No type assertions (`as X`)** unless narrowing is impossible; add a comment explaining why.
- Prefer `interface` for object shapes; `type` for unions and utility types.
- Use `satisfies` to validate object literals against a type without widening.
- Derive types from data where possible: `typeof CATEGORY_MAP[keyof typeof CATEGORY_MAP]` is better than a manual union.

---

## Styling

- **Tailwind utility classes only** — no `style={{}}`, no CSS modules.
- Use `cn()` from `@/lib/utils` for all conditional class merging.
- Tailwind v4 is active — no `tailwind.config.js`; config lives in CSS via `@theme`.
- Design tokens (colors, radii, spacing) live in `src/index.css` under `@theme`. Never hardcode hex values.

---

## Components

- **One component per file**. PascalCase filenames. Each component has its own directory under `src/components/<Name>/`.
- `src/components/ui/` is **shadcn-owned** — never edit those files. Extend via `className` or wrapper components.
- Prefer shadcn primitives (`Button`, `Card`, `Badge`, `Dialog`, `Skeleton`) over custom HTML.
- Every public component exports a named `interface <Name>Props` so consumers have autocomplete.
- Memoize expensive render-only components with `React.memo` — justify the cost, don't do it reflexively.
- Use `React.lazy` + `<Suspense>` for all page-level components (already wired in `router.tsx`).

---

## SEO & Meta

- Every page **must** set its `<title>` and `<meta name="description">` using a `<Helmet>` component (react-helmet-async, already installed, already wrapped in `HelmetProvider` in `main.tsx`).
- Detail pages (movie, TV, actor) include Open Graph tags: `og:title`, `og:description`, `og:image`, `og:type`.
- All images use meaningful `alt` text — never `alt=""` on content images; `alt=""` only on decorative ones.
- Use semantic HTML: `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, `<section>`, `<h1>`–`<h3>` in hierarchy.
- Every page has exactly one `<h1>`.
- Links use `<Link>` from React Router — never `<a href>` for internal navigation.
- Canonical URLs: detail pages should have a canonical tag matching their URL.

### SEO Template

```tsx
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>{movie.title} — CineVault</title>
  <meta name="description" content={movie.overview.slice(0, 155)} />
  <meta property="og:title" content={`${movie.title} — CineVault`} />
  <meta property="og:description" content={movie.overview.slice(0, 155)} />
  <meta property="og:image" content={`${IMAGE_BASE}/w780${movie.backdrop_path}`} />
  <meta property="og:type" content="video.movie" />
  <link rel="canonical" href={`https://cinevault.app/movies/${movie.id}`} />
</Helmet>
```

---

## Performance

### Images

- Always set explicit `width` and `height` on images to prevent layout shift (CLS).
- Use `loading="lazy"` on all images below the fold; `loading="eager"` on the hero/LCP image.
- Use `fetchpriority="high"` on the LCP image (backdrop on detail pages).
- Choose the smallest adequate TMDB image size for the rendered size — never use `original` for thumbnails.
- Wrap images in a sized container so the browser can reserve space before the image loads.

### Code splitting

- All pages are lazy-loaded via `React.lazy` — already in `router.tsx`. Maintain this.
- Avoid importing entire libraries when a sub-path import suffices.

### Rendering

- Avoid anonymous functions as `useEffect` deps — extract them with `useCallback` or define outside the component.
- Do not create objects/arrays inline in JSX props that are passed to memoized children.
- Avoid `useEffect` chains — if effect A triggers state that triggers effect B, merge them.
- Avoid calling `setState` synchronously inside an effect body — set state only in async callbacks (`.then`, `.catch`) or cleanup.

### Bundle

- No `console.log` in committed code — use `// TODO:` comments during development and remove before commit.
- No unused imports — the linter will catch these, but don't introduce them.

---

## Data Fetching — TanStack Query

The app uses **TanStack Query v5** (`@tanstack/react-query`) for all server state.

### Rules

- All fetch functions stay in `src/util/API.ts` — they are pure `async` functions, not hooks.
- All TanStack Query hooks live in `src/hooks/` — one hook per resource type.
- **Never** use raw `useState + useEffect` for async data — always use TanStack Query hooks.
- **Paginated list pages** use `useInfiniteQuery` with a "Load More" button or intersection observer.
- **Detail pages** (single resource) use `useQuery`.
- **Parallel fetches** (e.g. details + credits + videos at once) use `useQueries`.
- Set `staleTime` on all queries — `5 * 60 * 1000` (5 min) for lists, `10 * 60 * 1000` for details.
- Set `gcTime` to at least `10 * 60 * 1000` so navigating back doesn't re-fetch.
- Prefetch detail queries on hover/focus of cards where latency matters.

### Infinite Query Pattern (list pages)

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPopularMovies } from '@/util/API'

export function usePopularMovies() {
  return useInfiniteQuery({
    queryKey: ['movies', 'popular'],
    queryFn: ({ pageParam }) => fetchPopularMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < Math.min(lastPage.total_pages, 500) ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  })
}

// In the component:
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = usePopularMovies()
const movies = data?.pages.flatMap((p) => p.results) ?? []
```

### Query Pattern (detail pages)

```tsx
import { useQuery, useQueries } from '@tanstack/react-query'
import { fetchMovieDetails, fetchMovieCredits } from '@/util/API'

export function useMovieDetails(id: number) {
  return useQueries({
    queries: [
      {
        queryKey: ['movie', id, 'details'],
        queryFn: () => fetchMovieDetails(id),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['movie', id, 'credits'],
        queryFn: () => fetchMovieCredits(id),
        staleTime: 10 * 60 * 1000,
      },
    ],
  })
}
```

### Query Key Convention

```
['movies', 'popular', page]
['movies', 'genre', genreId, page]
['movies', 'search', query, page]
['movie', id, 'details']
['movie', id, 'credits']
['tv', 'popular', page]
['tv', id, 'details']
['person', id, 'details']
```

---

## API & Data Layer

- All TMDB fetch functions belong in `src/util/API.ts`.
- Never inline `fetch()` inside a component or hook body — call a function from `src/util/`.
- Every fetch function has a JSDoc block: `@param`, `@returns`, example usage.
- API key: `import.meta.env.VITE_TMDB_API_KEY` — never hardcoded.
- Base URL: `import.meta.env.VITE_TMDB_BASE_URL` — never hardcoded.
- Content safety: all list endpoints append `SAFE_PARAMS`; client-side `filterMovies`/`filterShows` run afterward.

---

## Accessibility

- Interactive elements (`button`, `a`) always have visible focus styles (Tailwind `focus-visible:ring-*`).
- Icon-only buttons need `aria-label`.
- Images need meaningful `alt` text (not the filename).
- Modals and dialogs use shadcn `Dialog` — it handles focus trapping and ARIA roles automatically.
- Color contrast: text on muted backgrounds must meet WCAG AA (4.5:1 for normal, 3:1 for large text).
- Theme toggle button must have an `aria-label` that reflects the *current* theme.
- Keyboard navigation must work for all interactive elements — test with Tab/Enter/Space/Escape.

---

## State Management

- **Local UI state** → `useState` / `useReducer`.
- **Server/async state** → TanStack Query hooks in `src/hooks/`.
- **Shared cross-page UI state** → React Context in `src/context/`.
- Do not introduce Redux or Zustand unless the user explicitly asks.

---

## Routing & URL

- Use **React Router DOM v7** for all navigation.
- Dynamic routes: `/movies/:id`, `/actors/:id`, `/tv/:id`.
- All list filters (category, genre, search) live in URL params — never in component state.
- Pagination for infinite scroll does **not** need to be in the URL (the browser scroll position handles resume).
- Route definitions: `src/router.tsx`.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB Bearer token |
| `VITE_TMDB_BASE_URL` | `https://api.themoviedb.org/3` |
| `VITE_TMDB_IMAGE_BASE` | `https://image.tmdb.org/t/p` |

Add to `.env.local` (gitignored). Never commit `.env` files with real keys.

---

## Testing

- Every component: co-located test file (`MovieCard.tsx` → `MovieCard.test.tsx`).
- Every API fetch function: unit test in `src/util/API.test.ts`.
- Every custom hook: test in `src/hooks/<hookName>.test.ts` using `renderHook` + a `QueryClientProvider` wrapper.
- Page integration tests: mock the hooks (`vi.mock('@/hooks/useMovies')`), not the raw fetch.
- E2E tests: `e2e/*.spec.ts` (Playwright).
- Never make real network requests in tests.
- Test user-visible behavior — not internal state or implementation details.
- `data-testid` on cards, key interactive elements for E2E targeting.

---

## Git & Commits

- Branch: `feat/<name>`, `fix/<name>`, `chore/<name>`.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `perf:`, `style:`, `docs:`, `chore:`, `test:`.
- Husky runs `pnpm lint` on pre-commit — must pass, never `--no-verify`.
- Every feature starts from a GitHub issue — reference it in the PR.

---

## Import Order

1. React and external packages
2. `@/` alias imports
3. Relative imports

---

## What NOT to Do

- No `document.querySelector` or direct DOM manipulation.
- No `console.log` in committed code.
- No barrel `index.ts` re-exports unless explicitly asked.
- No new dependency without checking if the existing stack already covers it.
- No abbreviated names (`movieDetails` not `md`, `handlePageChange` not `hpc`).
- No `as any` escape hatches — define the type properly.
- No `useEffect` for derived data — compute it during render instead.
- No synchronous `setState` calls at the top of an effect body.
