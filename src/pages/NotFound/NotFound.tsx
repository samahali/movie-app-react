import { Link } from 'react-router-dom'
import { Film, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <Film className="size-16 text-muted-foreground opacity-30" />
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-xl font-semibold">Page not found</p>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/" className="gap-2">
          <Home className="size-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
