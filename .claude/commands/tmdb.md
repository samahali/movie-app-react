# /tmdb

Look up a TMDB endpoint and generate a fully typed fetch function and response interface for it.

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

1. Identifies the correct TMDB v3 endpoint for the request.
2. Documents the full response shape as a TypeScript interface.
3. Generates a ready-to-paste fetch function following the project's pattern.
4. Notes any quirks (e.g. IMDB links require `/person/{id}/external_ids` not the base person endpoint).

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
| Multi (movies + TV + people) | `GET /search/multi?query={q}&page={n}` |
| Movies only | `GET /search/movie?query={q}&page={n}` |
| TV only | `GET /search/tv?query={q}&page={n}` |
| People only | `GET /search/person?query={q}&page={n}` |

## Image URL Construction

```
${import.meta.env.VITE_TMDB_IMAGE_BASE}/<size>/<file_path>
```

Poster sizes: `w92` `w154` `w185` `w342` `w500` `w780` `original`
Profile sizes: `w45` `w185` `h632` `original`
Backdrop sizes: `w300` `w780` `w1280` `original`
Logo sizes: `w45` `w92` `w154` `w185` `w300` `w500` `original`

## Output Format

The command returns:

1. The exact endpoint URL template.
2. A TypeScript interface for the response.
3. A ready-to-use fetch function matching the project's pattern in `src/util/API.ts`.
4. Any important notes about the endpoint (pagination, required params, gotchas).
