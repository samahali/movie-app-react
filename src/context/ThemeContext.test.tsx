import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'
import type { ReactNode } from 'react'

// jsdom does not implement window.matchMedia — provide a minimal stub.
function stubMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
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

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  // Default stub: system preference is light
  stubMatchMedia(false)
})

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    // Suppress the expected React error boundary console noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used inside ThemeProvider'
    )
    consoleSpy.mockRestore()
  })

  it('returns a theme value', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(['light', 'dark']).toContain(result.current.theme)
  })

  it('returns a toggleTheme function', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(typeof result.current.toggleTheme).toBe('function')
  })

  it('defaults to light when localStorage has "light"', () => {
    localStorage.setItem('theme', 'light')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })

  it('defaults to dark when localStorage has "dark"', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
  })

  it('toggles from light to dark', () => {
    localStorage.setItem('theme', 'light')
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
  })

  it('toggles from dark to light', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
  })

  it('calling toggleTheme twice returns to the original theme', () => {
    localStorage.setItem('theme', 'light')
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => { result.current.toggleTheme() })
    act(() => { result.current.toggleTheme() })

    expect(result.current.theme).toBe('light')
  })

  it('adds the dark class on <html> when theme is dark', () => {
    localStorage.setItem('theme', 'dark')
    renderHook(() => useTheme(), { wrapper })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class on <html> when theme is light', () => {
    localStorage.setItem('theme', 'light')
    // Pre-set the dark class to ensure it is removed
    document.documentElement.classList.add('dark')
    renderHook(() => useTheme(), { wrapper })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists the toggled theme to localStorage', () => {
    localStorage.setItem('theme', 'light')
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => { result.current.toggleTheme() })

    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
