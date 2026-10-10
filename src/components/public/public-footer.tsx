import Link from 'next/link'

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { href: '/services', label: 'Services' },
      { href: '/hospitals', label: 'Hospitals' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer className="border-t border-hairline bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="font-heading text-2xl leading-none text-brand">RapidAid</p>
          <p className="text-sm text-slate max-w-56">
            Emergency ambulance dispatch for Dhaka. Available 24/7.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading} className="space-y-3">
            <h3 className="text-base text-ink">{col.heading}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate hover:text-ink hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-3">
          <h3 className="text-base text-ink">Emergency?</h3>
          <p className="text-sm text-slate">
            Request an ambulance in seconds, no phone call needed.
          </p>
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-full bg-signal px-4 text-sm font-semibold text-white hover:bg-signal/90"
          >
            Request now
          </Link>
        </div>
      </div>
      <div className="border-t border-hairline py-4">
        <p className="text-center text-xs text-slate">
          RapidAid, emergency ambulance dispatch
        </p>
      </div>
    </footer>
  )
}
