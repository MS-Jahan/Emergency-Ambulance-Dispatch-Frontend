'use client'

import { useEffect } from 'react'
import { RefreshCcw, Siren } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-gauze flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <Siren className="h-12 w-12 text-signal mx-auto" />
        <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
        <p className="text-sm text-slate">
          An unexpected error stopped this page. Trying again usually fixes it;
          if it keeps happening, the trip data is safe on the server.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="text-sm text-white bg-signal hover:bg-signal/90 px-4 py-2 rounded-md inline-flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Try again
          </button>
          <a
            href="/dashboard"
            className="text-sm text-ink px-4 py-2 border border-hairline rounded-md bg-paper hover:bg-gauze inline-flex items-center justify-center"
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}
