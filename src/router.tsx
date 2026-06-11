import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout/Layout'

const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })))
const MoviesPage = lazy(() => import('@/pages/Movies/Movies').then((m) => ({ default: m.MoviesPage })))
const MovieDetailsPage = lazy(() => import('@/pages/Movies/MovieDetails').then((m) => ({ default: m.MovieDetailsPage })))
const ActorsPage = lazy(() => import('@/pages/Actors/Actors').then((m) => ({ default: m.ActorsPage })))
const ActorDetailsPage = lazy(() => import('@/pages/Actors/ActorDetails').then((m) => ({ default: m.ActorDetailsPage })))
const TVPage = lazy(() => import('@/pages/TV/TV').then((m) => ({ default: m.TVPage })))
const TVDetailsPage = lazy(() => import('@/pages/TV/TVDetails').then((m) => ({ default: m.TVDetailsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFound').then((m) => ({ default: m.NotFoundPage })))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<S><HomePage /></S>} />
        <Route path="/movies" element={<S><MoviesPage /></S>} />
        <Route path="/movies/:id" element={<S><MovieDetailsPage /></S>} />
        <Route path="/actors" element={<S><ActorsPage /></S>} />
        <Route path="/actors/:id" element={<S><ActorDetailsPage /></S>} />
        <Route path="/tv" element={<S><TVPage /></S>} />
        <Route path="/tv/:id" element={<S><TVDetailsPage /></S>} />
        <Route path="*" element={<S><NotFoundPage /></S>} />
      </Route>
    </Routes>
  )
}
