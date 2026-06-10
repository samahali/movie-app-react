# Project Rules

These rules apply to every task in this project. Follow them without exception unless the user explicitly overrides one.

## Language & Types

- **TypeScript only** — all files in `src/` use `.tsx` or `.ts`. Never create `.js` or `.jsx` files.
- **No `any`** — use specific types, generics, or `unknown` with type narrowing. If a TMDB API shape is unknown, define an interface for it in the same file or in `src/types/`.
- **No type assertions (`as X`)** unless narrowing is impossible and you leave a comment explaining why.
- Prefer `interface` over `type` for object shapes; use `type` for unions and utility types.

## Styling

- **Tailwind utility classes only** — no inline `style={{}}`, no CSS modules, no styled-components.
- Use `cn()` from `@/lib/utils` whenever classes are conditionally combined.
- Tailwind v4 is in use — do not add a `tailwind.config.js`; configuration lives in CSS via `@theme`.

## Components

- **One component per file** — never export multiple components from one file.
- Component files are PascalCase (e.g. `MovieCard.tsx`). Utility/hook files are camelCase (e.g. `useMovies.ts`).
- Each component lives in its own directory under `src/components/<ComponentName>/`.
- `src/components/ui/` is **owned by shadcn** — do not hand-edit those files. Customize via `className` props or wrapper components.
- Use shadcn primitives (`Button`, `Card`, `Dialog`, etc.) before reaching for custom HTML elements.

## API & Data Fetching

- All TMDB fetch functions belong in `src/util/API.ts` (or a feature-specific file under `src/util/`).
- Never inline `fetch()` calls inside a component body — always call a function from `src/util/`.
- Every fetch function must have a JSDoc comment explaining parameters and return shape.
- Use the TMDB base URL from an environment variable: `import.meta.env.VITE_TMDB_BASE_URL`.
- API keys must come from `import.meta.env.VITE_TMDB_API_KEY` — never hardcode them.

## Documentation

- Document complex business logic, multi-call components, utility functions, and custom hooks with JSDoc (see examples in CLAUDE.md).
- Skip comments on trivial code — well-named identifiers are enough.
- Every custom hook must document its return values.

## Git & Commits

- Branch names: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`.
- Husky runs `pnpm lint` on pre-commit — lint must pass before any commit goes through.
- Never use `--no-verify` to bypass the hook.
- Every feature starts from a GitHub issue. Reference the issue number in the PR description.

## File & Import Order

1. External packages (`react`, `lucide-react`, etc.)
2. `@/` alias imports (`@/components/...`, `@/util/...`)
3. Relative imports (`./MovieCard`, `../types`)

## State Management

- Local UI state → `useState` / `useReducer`.
- Shared cross-page state → React Context (create under `src/context/`).
- Server/async state → custom hooks in `src/hooks/` wrapping fetch functions from `src/util/API.ts`.
- Do not introduce Redux unless the user explicitly asks for it.

## Routing

- Use **React Router DOM** for all navigation.
- Dynamic routes use the TMDB resource ID: `/movies/:id`, `/actors/:id`, `/tv/:id`.
- Route definitions live in a single file (e.g. `src/router.tsx` or `src/App.tsx`).

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB API bearer token |
| `VITE_TMDB_BASE_URL` | `https://api.themoviedb.org/3` |
| `VITE_TMDB_IMAGE_BASE` | `https://image.tmdb.org/t/p` |

Add these to `.env.local` (gitignored). Never commit `.env` files containing real keys.

## Testing

- Every component gets a co-located test file: `MovieCard.tsx` → `MovieCard.test.tsx`.
- Every API fetch function in `src/util/API.ts` gets a unit test in `src/util/API.test.ts`.
- Every custom hook gets a test in `src/hooks/<hookName>.test.ts`.
- Integration tests render the full page with mocked API responses — use `vi.mock('@/util/API')`.
- E2E tests live in the top-level `e2e/` directory as `*.spec.ts` files (Playwright).
- **Never make real network requests in tests** — mock `fetch` via `vi.stubGlobal` or `msw`.
- Test user-visible behavior, not implementation details (no testing internal state or private fns).
- Add `data-testid` attributes to key interactive elements (movie cards, nav links, search input) for E2E targeting.
- Use the `tester` agent to scaffold tests for any new component, hook, or page.

## Theme

- Theme is controlled by a `ThemeContext` in `src/context/ThemeContext.tsx`.
- On first load, read `localStorage` for a saved preference; fall back to `window.matchMedia('prefers-color-scheme: dark')`.
- Toggle applies/removes the `dark` class on `<html>` — Tailwind and the CSS vars in `index.css` handle the rest.
- The theme toggle button must be accessible (aria-label, keyboard navigable).
- Never hardcode `dark:` classes based on a hardcoded assumption — always respect the context value.

## What NOT to Do

- Do not use `document.querySelector` or direct DOM manipulation.
- Do not add `console.log` statements to committed code.
- Do not create barrel `index.ts` re-export files unless the user asks.
- Do not add dependencies without checking if the functionality already exists in the stack.
- Do not abbreviate variable names (use `movieDetails` not `md`).
