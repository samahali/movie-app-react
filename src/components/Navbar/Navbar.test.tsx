import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Navbar } from './Navbar'
import { ThemeProvider } from '@/context/ThemeContext'

vi.mock('@/hooks/useGenres', () => ({
  useGenres: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}))

// jsdom does not implement window.matchMedia — provide a minimal stub
function stubMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function renderNavbar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ThemeProvider>
          <Navbar />
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    stubMatchMedia()
  })

  it('renders the CineVault logo link', () => {
    renderNavbar()
    const logo = screen.getByRole('link', { name: /cinevault/i })
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('href', '/')
  })

  it('renders Movies navigation button', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: /movies/i })).toBeInTheDocument()
  })

  it('renders TV Shows navigation button', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: /tv shows/i })).toBeInTheDocument()
  })

  it('renders Actors navigation link', () => {
    renderNavbar()
    const actorsLink = screen.getByRole('link', { name: /actors/i })
    expect(actorsLink).toBeInTheDocument()
    expect(actorsLink).toHaveAttribute('href', '/actors')
  })

  it('renders the theme toggle button', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: /switch to (light|dark) mode/i })).toBeInTheDocument()
  })

  it('renders the search input', () => {
    renderNavbar()
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders the Genres dropdown button', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: /genres/i })).toBeInTheDocument()
  })
})
