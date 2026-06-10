# CineVault

A modern movie and TV show discovery app built with React 19, TypeScript, and the TMDB API. Browse trending movies, TV shows, and actors with a clean cinematic UI and full dark/light theme support.

## Features

- **Movies** — Now Playing, Popular, Top Rated, Upcoming, browse by genre
- **TV Shows** — Airing Today, On Air, Popular, Top Rated, browse by genre
- **Actors** — Trending people with full profile pages and filmographies
- **Detail pages** — Full-bleed backdrop hero, cast, trailer modal, similar titles, seasons carousel
- **Search** — Multi-search across movies, TV shows, and people
- **Dark / Light theme** — Follows system preference, togglable, persisted to localStorage
- **Content safety** — Adult content, explicit genres (Drama, Romance), and R-rated titles excluded at both API and client level
- **URL-driven pagination** — All filters and pages live in the URL (bookmarkable, shareable)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4.3 |
| Components | shadcn/ui |
| Routing | React Router DOM v7 |
| Icons | Lucide React |
| Font | Geist Variable |
| Testing | Vitest + Testing Library + Playwright |
| Linting | ESLint + Husky pre-commit |
| Package manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

### Installation

```bash
# Clone the repo
git clone https://github.com/samahali/movie-app-react.git
cd movie-app-react

# Install dependencies (also sets up Husky hooks)
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_TMDB_API_KEY=your_bearer_token_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

The API key is the **Bearer token** from your TMDB account (not the v3 key).

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests in watch mode |
| `pnpm test:run` | Run unit tests once |
| `pnpm exec playwright test` | Run E2E tests |

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx
│   ├── Movies/
│   │   ├── Movies.tsx
│   │   └── MovieDetails.tsx
│   ├── TV/
│   │   ├── TV.tsx
│   │   └── TVDetails.tsx
│   ├── Actors/
│   │   ├── Actors.tsx
│   │   └── ActorDetails.tsx
│   └── NotFound/
│       └── NotFound.tsx
├── components/
│   ├── ui/              # shadcn/ui primitives (read-only)
│   ├── Navbar/
│   ├── Footer/
│   ├── Layout/
│   ├── MovieCard/
│   └── Pagination/
├── context/
│   └── ThemeContext.tsx  # dark/light theme
├── util/
│   └── API.ts           # all TMDB fetch functions
├── types/
│   └── tmdb.ts          # TMDB response types
└── router.tsx           # lazy-loaded routes
```

## Docker

```bash
docker compose up --build
```

The app will be available at [http://localhost:4173](http://localhost:4173).

## Data Source

Movie and TV data is provided by [The Movie Database (TMDB)](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.

![TMDB Logo](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg)
