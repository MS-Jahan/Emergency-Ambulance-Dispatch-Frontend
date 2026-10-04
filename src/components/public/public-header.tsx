import Link from 'next/link'
import { Siren } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/hospitals', label: 'Hospitals' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  return (
    <header className="border-b border-hairline bg-paper">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-ink font-semibold">
          <Siren className="h-5 w-5 text-signal" />
          <span className="text-sm">RapidAid</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          nativeButton={false} render={<Link href="/login" />}
          size="sm"
          className="bg-signal text-white hover:bg-signal/90"
        >
          Sign in
        </Button>
      </div>
      <nav className="sm:hidden flex items-center gap-4 px-4 pb-2 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs text-slate hover:text-ink whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
