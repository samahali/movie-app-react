# /tmdb

Look up a TMDB endpoint and generate a fully typed fetch function, response interface, and TanStack Query hook.

## Usage

```
/tmdb <what you want to fetch>
```

Examples:
```
/tmdb movie videos (trailers)
/tmdb person external IDs (for IMDB link)
/tmdb search multi
/tmdb TV show season details
```

## What This Does

1. Identifies the correct TMDB v3 endpoint.
2. Documents the full response shape as a TypeScript interface.
3. Generates a ready-to-paste fetch function following the project pattern.
4. Generates a TanStack Query hook (`useInfiniteQuery` for lists, `useQuery`/`useQueries` for details).
5. Notes quirks, required params, and pagination behavior.

## TMDB Quick Reference

### Movies
| What | Endpoint |
|---|---|
| Now playing | `GET /movie/now_playing?page={n}` |
| Popular | `GET /movie/popular?page={n}` |
| Top rated | `GET /movie/top_rated?page={n}` |
| Upcoming | `GET /movie/upcoming?page={n}` |
| Details | `GET /movie/{id}` |
| Credits | `GET /movie/{id}/credits` |
| Videos | `GET /movie/{id}/videos` |
| Similar | `GET /movie/{id}/similar?page={n}` |
| Genres | `GET /genre/movie/list` |

### TV Shows
| What | Endpoint |
|---|---|
| Airing today | `GET /tv/airing_today?page={n}` |
| On air | `GET /tv/on_the_air?page={n}` |
| Popular | `GET /tv/popular?page={n}` |
| Top rated | `GET /tv/top_rated?page={n}` |
| Details | `GET /tv/{id}` |
| Credits | `GET /tv/{id}/credits` |
| Videos | `GET /tv/{id}/videos` |
| Similar | `GET /tv/{id}/similar?page={n}` |
| Season details | `GET /tv/{id}/season/{season_number}` |
| Genres | `GET /genre/tv/list` |

### People
| What | Endpoint |
|---|---|
| Trending (week) | `GET /trending/person/week?page={n}` |
| Details | `GET /person/{id}` |
| Combined credits | `GET /person/{id}/combined_credits` |
| External IDs (IMDB) | `GET /person/{id}/external_ids` |

### Search
| What | Endpoint |
|---|---|
| Multi | `GET /search/multi?query={q}&page={n}` |
| Movies | `GET /search/movie?query={q}&page={n}` |
| TV | `GET /search/tv?query={q}&page={n}` |
| People | `GET /search/person?query={q}&page={n}` |

## Image URL Construction

```
${import.meta.env.VITE_TMDB_IMAGE_BASE}/<size>/<file_path>
```

| Type | Sizes |
|---|---|
| Poster | `w92` `w154` `w185` `w342` `w500` `w780` `original` |
| Profile | `w45` `w185` `h632` `original` |
| Backdrop | `w300` `w780` `w1280` `original` |
| Logo | `w45` `w92` `w154` `w185` `w300` `w500` `original` |

**Size selection guideline:** use the smallest size that is still sharp at the rendered size. Cards at 200px wide → `w342`. Hero backdrop at 100vw → `original`. Never use `original` for small thumbnails.

## Output Format

1. Exact endpoint URL template
2. TypeScript interface for the response (to add to `src/types/tmdb.ts`)
3. Fetch function for `src/util/API.ts`
4. TanStack Query hook for `src/hooks/`
5. Notes: pagination behavior, required params, gotchas
