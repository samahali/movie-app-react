import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { MovieCard } from './MovieCard'
import type { Movie } from '@/types/tmdb'

const baseMovie: Movie = {
  id: 123,
  title: 'Inception',
  overview: 'A thief who steals secrets.',
  poster_path: '/inception.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 35000,
  genre_ids: [28, 878],
  original_language: 'en',
  popularity: 87.5,
}

function renderCard(movie: Movie = baseMovie) {
  return render(
    <MemoryRouter>
      <MovieCard movie={movie} />
    </MemoryRouter>
  )
}

describe('MovieCard', () => {
  it('renders the movie title', () => {
    renderCard()
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('renders a poster image when poster_path is present', () => {
    renderCard()
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', 'Inception')
    // src ends with the poster_path — the image base comes from env which may be empty in test
    expect(img).toHaveAttribute('src', expect.stringContaining('inception.jpg'))
  })

  it('renders a text fallback when poster_path is null', () => {
    renderCard({ ...baseMovie, poster_path: null })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // The fallback renders the title inside the poster area as well
    const titleElements = screen.getAllByText('Inception')
    expect(titleElements.length).toBeGreaterThan(0)
  })

  it('links to /movies/:id', () => {
    renderCard()
    const link = screen.getByTestId('movie-card')
    expect(link).toHaveAttribute('href', '/movies/123')
  })

  it('displays the release year', () => {
    renderCard()
    expect(screen.getByText('2010')).toBeInTheDocument()
  })

  it('displays the rating', () => {
    renderCard()
    expect(screen.getByText('8.8')).toBeInTheDocument()
  })

  it('shows a dash for year when release_date is undefined', () => {
    // The component uses `release_date?.slice(0, 4) ?? '—'`
    // — fires only when the value is null/undefined (not empty string).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderCard({ ...baseMovie, release_date: undefined as any })
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('applies the optional className to the link element', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={baseMovie} className="custom-class" />
      </MemoryRouter>
    )
    expect(screen.getByTestId('movie-card')).toHaveClass('custom-class')
  })
})
