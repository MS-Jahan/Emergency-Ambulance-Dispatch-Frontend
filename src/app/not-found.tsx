import Link from 'next/link'
import { Siren } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gauze flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <Siren className="h-12 w-12 text-signal mx-auto" />
        <h1 className="text-2xl font-bold text-ink">Page not found</h1>
        <p className="text-sm text-slate">
          The page you asked for does not exist or was moved. If you were
          mid-trip, your dashboard still has it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="text-sm text-oxygen hover:underline px-4 py-2 border border-hairline rounded-md bg-paper"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-paper bg-ink hover:bg-ink/90 px-4 py-2 rounded-md"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
