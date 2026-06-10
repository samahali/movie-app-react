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

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/actors" element={<ActorsPage />} />
          <Route path="/actors/:id" element={<ActorDetailsPage />} />
          <Route path="/tv" element={<TVPage />} />
          <Route path="/tv/:id" element={<TVDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
