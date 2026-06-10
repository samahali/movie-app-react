import type {
  PaginatedResponse,
  MovieDetails,
  Credits,
  VideosResponse,
  GenreListResponse,
  Movie,
  TVShow,
  TVShowDetails,
  Person,
  PersonDetails,
  PersonExternalIds,
  CombinedCreditsResponse,
  MultiSearchResult,
} from '@/types/tmdb'

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL as string
const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string

// Appended to every list/discover/search request — blocks adult content at the API level
const SAFE_PARAMS = 'include_adult=false&include_null_first_air_dates=false&without_genres=18,10749'

// Minimum vote count to consider a rating reliable
const MIN_VOTE_COUNT = 50

// TMDB genre IDs excluded from all results: 18 = Drama, 10749 = Romance
const EXCLUDED_GENRE_IDS = new Set([18, 10749])

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { headers: headers() })
  if (!response.ok) throw new Error(`TMDB error: ${response.status}`)
  return response.json() as Promise<T>
}

/**
 * Removes movies with unreliable vote counts or missing posters.
 * Adult content is already excluded at the API level via include_adult=false.
 */
function filterMovies(data: PaginatedResponse<Movie>): PaginatedResponse<Movie> {
  return {
    ...data,
    results: data.results.filter(
      (m) =>
        m.vote_count >= MIN_VOTE_COUNT &&
        m.poster_path !== null &&
        !m.genre_ids.some((id) => EXCLUDED_GENRE_IDS.has(id))
    ),
  }
}

/**
 * Removes TV shows with unreliable vote counts, missing posters, or excluded genres.
 */
function filterShows(data: PaginatedResponse<TVShow>): PaginatedResponse<TVShow> {
  return {
    ...data,
    results: data.results.filter(
      (s) =>
        s.vote_count >= MIN_VOTE_COUNT &&
        s.poster_path !== null &&
        !s.genre_ids.some((id) => EXCLUDED_GENRE_IDS.has(id))
    ),
  }
}

// ─── Movies ────────────────────────────────────────────────────────────────

/**
 * Fetches now playing movies (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchNowPlayingMovies(page = 1) {
  const data = await get<PaginatedResponse<Movie>>(`/movie/now_playing?page=${page}&${SAFE_PARAMS}`)
  return filterMovies(data)
}

/**
 * Fetches popular movies (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchPopularMovies(page = 1) {
  const data = await get<PaginatedResponse<Movie>>(`/movie/popular?page=${page}&${SAFE_PARAMS}`)
  return filterMovies(data)
}

/**
 * Fetches top rated movies (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchTopRatedMovies(page = 1) {
  const data = await get<PaginatedResponse<Movie>>(`/movie/top_rated?page=${page}&${SAFE_PARAMS}`)
  return filterMovies(data)
}

/**
 * Fetches upcoming movies (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchUpcomingMovies(page = 1) {
  const data = await get<PaginatedResponse<Movie>>(`/movie/upcoming?page=${page}&${SAFE_PARAMS}`)
  return filterMovies(data)
}

/**
 * Fetches movies filtered by genre (adult content excluded, US certification ≤ PG-13).
 * @param genreId - TMDB genre ID
 * @param page - Page number (default: 1)
 */
export async function fetchMoviesByGenre(genreId: number, page = 1) {
  const data = await get<PaginatedResponse<Movie>>(
    `/discover/movie?with_genres=${genreId}&page=${page}&${SAFE_PARAMS}&vote_count.gte=${MIN_VOTE_COUNT}&certification_country=US&certification.lte=PG-13`
  )
  return filterMovies(data)
}

/**
 * Fetches full details for a single movie.
 * @param id - TMDB movie ID
 */
export async function fetchMovieDetails(id: number) {
  return get<MovieDetails>(`/movie/${id}`)
}

/**
 * Fetches cast and crew for a movie.
 * @param id - TMDB movie ID
 */
export async function fetchMovieCredits(id: number) {
  return get<Credits>(`/movie/${id}/credits`)
}

/**
 * Fetches trailers and clips for a movie.
 * @param id - TMDB movie ID
 */
export async function fetchMovieVideos(id: number) {
  return get<VideosResponse>(`/movie/${id}/videos`)
}

/**
 * Fetches movies similar to the given movie (adult content excluded).
 * @param id - TMDB movie ID
 * @param page - Page number (default: 1)
 */
export async function fetchSimilarMovies(id: number, page = 1) {
  const data = await get<PaginatedResponse<Movie>>(`/movie/${id}/similar?page=${page}&${SAFE_PARAMS}`)
  return filterMovies(data)
}

/**
 * Fetches the movie genre list.
 */
export async function fetchMovieGenres() {
  return get<GenreListResponse>('/genre/movie/list')
}

// ─── TV Shows ──────────────────────────────────────────────────────────────

/**
 * Fetches TV shows airing today (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchAiringTodayTV(page = 1) {
  const data = await get<PaginatedResponse<TVShow>>(`/tv/airing_today?page=${page}&${SAFE_PARAMS}`)
  return filterShows(data)
}

/**
 * Fetches TV shows currently on air (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchOnAirTV(page = 1) {
  const data = await get<PaginatedResponse<TVShow>>(`/tv/on_the_air?page=${page}&${SAFE_PARAMS}`)
  return filterShows(data)
}

/**
 * Fetches popular TV shows (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchPopularTV(page = 1) {
  const data = await get<PaginatedResponse<TVShow>>(`/tv/popular?page=${page}&${SAFE_PARAMS}`)
  return filterShows(data)
}

/**
 * Fetches top rated TV shows (adult content excluded).
 * @param page - Page number (default: 1)
 */
export async function fetchTopRatedTV(page = 1) {
  const data = await get<PaginatedResponse<TVShow>>(`/tv/top_rated?page=${page}&${SAFE_PARAMS}`)
  return filterShows(data)
}

/**
 * Fetches TV shows filtered by genre (adult content excluded).
 * @param genreId - TMDB genre ID
 * @param page - Page number (default: 1)
 */
export async function fetchTVByGenre(genreId: number, page = 1) {
  const data = await get<PaginatedResponse<TVShow>>(
    `/discover/tv?with_genres=${genreId}&page=${page}&${SAFE_PARAMS}&vote_count.gte=${MIN_VOTE_COUNT}`
  )
  return filterShows(data)
}

/**
 * Fetches full details for a single TV show.
 * @param id - TMDB TV show ID
 */
export async function fetchTVDetails(id: number) {
  return get<TVShowDetails>(`/tv/${id}`)
}

/**
 * Fetches cast and crew for a TV show.
 * @param id - TMDB TV show ID
 */
export async function fetchTVCredits(id: number) {
  return get<Credits>(`/tv/${id}/credits`)
}

/**
 * Fetches trailers and clips for a TV show.
 * @param id - TMDB TV show ID
 */
export async function fetchTVVideos(id: number) {
  return get<VideosResponse>(`/tv/${id}/videos`)
}

/**
 * Fetches TV shows similar to the given show (adult content excluded).
 * @param id - TMDB TV show ID
 * @param page - Page number (default: 1)
 */
export async function fetchSimilarTV(id: number, page = 1) {
  const data = await get<PaginatedResponse<TVShow>>(`/tv/${id}/similar?page=${page}&${SAFE_PARAMS}`)
  return filterShows(data)
}

/**
 * Fetches the TV genre list.
 */
export async function fetchTVGenres() {
  return get<GenreListResponse>('/genre/tv/list')
}

// ─── People ────────────────────────────────────────────────────────────────

/**
 * Fetches trending people for the week.
 * @param page - Page number (default: 1)
 */
export async function fetchTrendingActors(page = 1) {
  return get<PaginatedResponse<Person>>(`/trending/person/week?page=${page}&${SAFE_PARAMS}`)
}

/**
 * Fetches full details for a single person.
 * @param id - TMDB person ID
 */
export async function fetchPersonDetails(id: number) {
  return get<PersonDetails>(`/person/${id}`)
}

/**
 * Fetches combined movie + TV credits for a person.
 * @param id - TMDB person ID
 */
export async function fetchPersonCredits(id: number) {
  return get<CombinedCreditsResponse>(`/person/${id}/combined_credits`)
}

/**
 * Fetches external IDs for a person (includes imdb_id for IMDB link).
 * @param id - TMDB person ID
 */
export async function fetchPersonExternalIds(id: number) {
  return get<PersonExternalIds>(`/person/${id}/external_ids`)
}

// ─── Search ────────────────────────────────────────────────────────────────

/**
 * Searches movies, TV shows, and people (adult content excluded).
 * @param query - Search term
 * @param page - Page number (default: 1)
 */
export async function fetchSearchMulti(query: string, page = 1) {
  return get<PaginatedResponse<MultiSearchResult>>(
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}&${SAFE_PARAMS}`
  )
}
