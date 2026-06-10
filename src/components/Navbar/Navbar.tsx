import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Menu, X, ChevronDown, Film, Tv, Users } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { fetchMovieGenres, fetchTVGenres } from '@/util/API'
import type { Genre } from '@/types/tmdb'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const MOVIE_CATEGORIES = [
  { label: 'Now Playing', value: 'now_playing' },
  { label: 'Popular', value: 'popular' },
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'Upcoming', value: 'upcoming' },
]

const TV_CATEGORIES = [
  { label: 'Airing Today', value: 'airing_today' },
  { label: 'On TV', value: 'on_the_air' },
  { label: 'Popular', value: 'popular' },
  { label: 'Top Rated', value: 'top_rated' },
]

type DropdownKey = 'movies' | 'tv' | 'genres' | null

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie')

  const navRef = useRef<HTMLElement>(null)


  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // fetch genres when genre dropdown opens
  useEffect(() => {
    if (activeDropdown !== 'genres') return
    const fetchFn = mediaType === 'movie' ? fetchMovieGenres : fetchTVGenres
    fetchFn()
      .then((data) => setGenres(data.genres))
      .catch(() => setGenres([]))
  }, [activeDropdown, mediaType])

  function toggleDropdown(key: DropdownKey) {
    setActiveDropdown((prev) => (prev === key ? null : key))
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    navigate(`/movies?search=${encodeURIComponent(query)}`)
    setSearchQuery('')
  }

  function closeAll() {
    setActiveDropdown(null)
    setMobileOpen(false)
  }

  function handleMovieCategory(category: string) {
    navigate(`/movies?category=${category}`)
    closeAll()
  }

  function handleTVCategory(category: string) {
    navigate(`/tv?category=${category}`)
    closeAll()
  }

  function handleGenre(genre: Genre) {
    const path = mediaType === 'movie' ? '/movies' : '/tv'
    navigate(`${path}?genre=${genre.id}&genreName=${encodeURIComponent(genre.name)}`)
    closeAll()
  }

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-primary transition-opacity hover:opacity-80"
        >
          <Film className="size-6" />
          CineVault
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">

          {/* Movies dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDropdown('movies')}
              aria-expanded={activeDropdown === 'movies'}
              aria-haspopup="true"
              className="gap-1"
            >
              <Film className="size-4" />
              Movies
              <ChevronDown className={cn('size-3 transition-transform', activeDropdown === 'movies' && 'rotate-180')} />
            </Button>
            {activeDropdown === 'movies' && (
              <DropdownPanel>
                {MOVIE_CATEGORIES.map((cat) => (
                  <DropdownItem key={cat.value} onClick={() => handleMovieCategory(cat.value)}>
                    {cat.label}
                  </DropdownItem>
                ))}
              </DropdownPanel>
            )}
          </div>

          {/* TV dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDropdown('tv')}
              aria-expanded={activeDropdown === 'tv'}
              aria-haspopup="true"
              className="gap-1"
            >
              <Tv className="size-4" />
              TV Shows
              <ChevronDown className={cn('size-3 transition-transform', activeDropdown === 'tv' && 'rotate-180')} />
            </Button>
            {activeDropdown === 'tv' && (
              <DropdownPanel>
                {TV_CATEGORIES.map((cat) => (
                  <DropdownItem key={cat.value} onClick={() => handleTVCategory(cat.value)}>
                    {cat.label}
                  </DropdownItem>
                ))}
              </DropdownPanel>
            )}
          </div>

          {/* Actors link */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/actors" className="gap-1">
              <Users className="size-4" />
              Actors
            </Link>
          </Button>

          {/* Genres dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDropdown('genres')}
              aria-expanded={activeDropdown === 'genres'}
              aria-haspopup="true"
              className="gap-1"
            >
              Genres
              <ChevronDown className={cn('size-3 transition-transform', activeDropdown === 'genres' && 'rotate-180')} />
            </Button>
            {activeDropdown === 'genres' && (
              <DropdownPanel className="w-72">
                {/* media type tabs */}
                <div className="flex gap-1 border-b border-border px-2 pb-2">
                  <button
                    onClick={() => setMediaType('movie')}
                    className={cn(
                      'rounded px-3 py-1 text-xs font-medium transition-colors',
                      mediaType === 'movie'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Movies
                  </button>
                  <button
                    onClick={() => setMediaType('tv')}
                    className={cn(
                      'rounded px-3 py-1 text-xs font-medium transition-colors',
                      mediaType === 'tv'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    TV Shows
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-0.5 p-1">
                  {genres.length === 0 ? (
                    <p className="col-span-2 py-4 text-center text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    genres.map((genre) => (
                      <DropdownItem key={genre.id} onClick={() => handleGenre(genre)}>
                        {genre.name}
                      </DropdownItem>
                    ))
                  )}
                </div>
              </DropdownPanel>
            )}
          </div>
        </div>

        {/* Right side: search + theme toggle + mobile menu */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="hidden items-center md:flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="h-8 w-48 rounded-lg border border-border bg-muted pl-8 pr-3 text-sm outline-none transition-all focus:w-64 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </form>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <form onSubmit={handleSearch} className="mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, shows, actors…"
                className="h-9 w-full rounded-lg border border-border bg-muted pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </form>

          <div className="mt-3 space-y-1">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Movies</p>
            {MOVIE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleMovieCategory(cat.value)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {cat.label}
              </button>
            ))}

            <p className="mt-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">TV Shows</p>
            {TV_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleTVCategory(cat.value)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {cat.label}
              </button>
            ))}

            <Link
              to="/actors"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              Actors
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function DropdownPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'absolute left-0 top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      {children}
    </div>
  )
}

function DropdownItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}
