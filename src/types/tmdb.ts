export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

// ─── Movies ────────────────────────────────────────────────────────────────

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  original_language: string
  popularity: number
}

export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  runtime: number | null
  genres: Genre[]
  production_companies: ProductionCompany[]
  tagline: string
  status: string
  budget: number
  revenue: number
  homepage: string | null
  imdb_id: string | null
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Credits {
  id: number
  cast: CastMember[]
  crew: CrewMember[]
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface VideosResponse {
  id: number
  results: Video[]
}

export interface GenreListResponse {
  genres: Genre[]
}

// ─── TV Shows ──────────────────────────────────────────────────────────────

export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  original_language: string
  popularity: number
}

export interface TVSeason {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string | null
  poster_path: string | null
  overview: string
}

export interface TVShowDetails extends Omit<TVShow, 'genre_ids'> {
  genres: Genre[]
  production_companies: ProductionCompany[]
  number_of_seasons: number
  number_of_episodes: number
  seasons: TVSeason[]
  status: string
  tagline: string
  homepage: string | null
  episode_run_time: number[]
}

// ─── People ────────────────────────────────────────────────────────────────

export interface Person {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  popularity: number
  known_for: (Movie | TVShow)[]
}

export interface PersonDetails {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  gender: number
  place_of_birth: string | null
  profile_path: string | null
  popularity: number
  imdb_id: string | null
  homepage: string | null
  known_for_department: string
}

export interface PersonExternalIds {
  id: number
  imdb_id: string | null
  instagram_id: string | null
  twitter_id: string | null
}

export interface CombinedCredit {
  id: number
  media_type: 'movie' | 'tv'
  title?: string
  name?: string
  poster_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  character?: string
  job?: string
  popularity: number
}

export interface CombinedCreditsResponse {
  id: number
  cast: CombinedCredit[]
  crew: CombinedCredit[]
}

// ─── Search ────────────────────────────────────────────────────────────────

export interface MultiSearchResult {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  title?: string
  name?: string
  poster_path: string | null
  profile_path: string | null
  overview?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  popularity: number
}
