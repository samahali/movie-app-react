import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppRouter } from '@/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
