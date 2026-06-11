import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { NotFoundPage } from './NotFound'

function renderNotFound() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  it('renders a 404 heading', () => {
    renderNotFound()
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('renders a "Page not found" message', () => {
    renderNotFound()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders a descriptive explanation', () => {
    renderNotFound()
    expect(
      screen.getByText(/doesn't exist or has been moved/i)
    ).toBeInTheDocument()
  })

  it('renders a "Back to Home" link pointing to /', () => {
    renderNotFound()
    const link = screen.getByRole('link', { name: /back to home/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
