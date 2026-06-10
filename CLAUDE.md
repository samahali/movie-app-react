# Movie App — Project Guide

## Stack

- **React 19** with **TypeScript** (`tsconfig.app.json`)
- **Vite 8** — build tool and dev server
- **Tailwind CSS v4.3** — `@tailwindcss/vite` plugin, config via `@theme` in `src/index.css`
- **shadcn/ui** — component primitives in `src/components/ui/` (do not hand-edit)
- **React Router DOM** — all navigation and dynamic routes
- **pnpm** — always use `pnpm`, never `npm` or `yarn`
- **Husky** — pre-commit runs `pnpm lint` automatically

---

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx
│   ├── Movies/
│   │   ├── Movies.tsx
│   │   └── MovieDetails.tsx
│   ├── Actors/
│   │   ├── Actors.tsx
│   │   └── ActorDetails.tsx
│   └── TV/
│       ├── TV.tsx
│       └── TVDetails.tsx
├── components/
│   ├── ui/                     # shadcn-owned — do not edit
│   ├── Navbar/
│   │   └── Navbar.tsx
│   └── Footer/
│       └── Footer.tsx
├── context/
│   └── ThemeContext.tsx         # dark/light theme + system preference
├── hooks/                       # custom hooks wrapping API calls
├── util/
│   └── API.ts                   # all TMDB fetch functions
├── types/
│   └── tmdb.ts                  # TMDB response interfaces
└── assets/
public/                          # static files served as-is
e2e/                             # Playwright E2E tests
```

---

## Path Aliases

`@/` maps to `src/`. Always use it for internal imports.

```ts
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
```

---

## Theme System

Dark/light mode is handled by `src/context/ThemeContext.tsx`.

- On first load: reads `localStorage`; falls back to `prefers-color-scheme`.
- Toggle: adds/removes `.dark` class on `<html>` — CSS vars in `index.css` do the rest.
- Wrap the app in `<ThemeProvider>` (already done in `App.tsx`).
- Use `useTheme()` anywhere to get `{ theme, toggleTheme }`.

---

## Environment Variables

Create `.env.local` (gitignored) with:

```
VITE_TMDB_API_KEY=your_bearer_token
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

Never hardcode keys. Never commit `.env` files.

---

## Husky & Pre-commit

```bash
pnpm install   # triggers `prepare` → sets up husky hooks
```

Pre-commit hook (`.husky/pre-commit`) runs `pnpm lint`. Fix lint errors — never use `--no-verify`.

---

## Common Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Type-check | `pnpm tsc -b --noEmit` |
| Lint | `pnpm lint` |
| Build | `pnpm build` |
| Unit tests | `pnpm test` |
| E2E tests | `pnpm exec playwright test` |
| Add shadcn component | `pnpm dlx shadcn@latest add <name>` |

---

## .claude/ Structure

All Claude Code configuration lives in `.claude/`.

```
.claude/
├── settings.json        # allowed/denied shell commands
├── rules.md             # coding rules applied to every task
├── agents/
│   ├── feature-builder.md   # builds full pages end-to-end
│   ├── api-integrator.md    # adds fetch functions, types, hooks
│   ├── reviewer.md          # pre-commit / pre-PR code review
│   └── tester.md            # unit, integration, and E2E tests
└── commands/
    ├── new-page.md          # /new-page
    ├── new-component.md     # /new-component
    ├── new-api.md           # /new-api
    └── tmdb.md              # /tmdb
```

### Rules — `.claude/rules.md`

Applied automatically to every task. Key rules:
- TypeScript only — no `.js`/`.jsx` in `src/`
- No `any`, no inline styles, no hardcoded API keys
- One component per file, PascalCase filenames
- All fetch calls go through `src/util/API.ts`
- Conventional commits; husky enforces lint on pre-commit
- Tests co-located with source; E2E in `e2e/`
- Theme toggled via `ThemeContext` only — never hardcoded

### Agents

| Agent | When to use |
|---|---|
| `feature-builder` | Build a full page (scaffold page + components + API + route) |
| `api-integrator` | Add/update TMDB fetch functions, interfaces, or hooks |
| `reviewer` | Review code before committing or opening a PR |
| `tester` | Write unit, integration, or E2E tests for any file |

### Slash Commands

| Command | What it does |
|---|---|
| `/new-page <Name>` | Scaffold a page under `src/pages/` with route, fetch, and hook |
| `/new-component <Name>` | Scaffold a component under `src/components/` with typed props |
| `/new-api <description>` | Add a typed fetch function + JSDoc to `src/util/API.ts` |
| `/tmdb <what>` | Look up a TMDB endpoint and generate the typed fetch function |

---

## Git Workflow

1. Create a GitHub issue for the feature.
2. Branch: `git checkout -b feat/<short-name>`
3. Implement → lint → commit (husky runs lint automatically).
4. Commit messages: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`.
5. Open a PR referencing the issue number.
6. Merge to `development` first; merge to `main` only for releases.
