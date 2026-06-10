import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <Film className="size-5" />
          CineVault
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/movies?category=popular" className="transition-colors hover:text-foreground">Movies</Link>
          <Link to="/tv?category=popular" className="transition-colors hover:text-foreground">TV Shows</Link>
          <Link to="/actors" className="transition-colors hover:text-foreground">Actors</Link>
        </nav>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Powered by TMDB
          </a>
          <a
            href="https://github.com/samahali/movie-app-react"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
