import Link from 'next/link'
import { Phone } from 'lucide-react'

/**
 * Shared auth shell: brand wordmark + 999 pill on top, a single rounded
 * card centred on the page. Same on every viewport.
 */
export function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gauze">
      <header className="flex items-center justify-between px-5 py-4 sm:px-10">
        <Link href="/" className="font-heading text-2xl text-brand">
          RapidAid
        </Link>
        <a
          href="tel:999"
          className="inline-flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-sm font-extrabold text-white hover:bg-signal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Phone className="h-4 w-4" aria-hidden />
          999
        </a>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  )
}
