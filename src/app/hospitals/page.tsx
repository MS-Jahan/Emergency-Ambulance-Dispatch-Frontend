import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/public-header'
import { PublicFooter } from '@/components/public/public-footer'
import { HospitalsDirectoryView } from '@/components/public/hospitals-directory-view'
import { ListSkeleton } from '@/components/shared/skeletons'

export const metadata: Metadata = {
  title: 'Hospital Directory & Emergency Bases',
  description:
    'Explore partner hospitals, trauma centers, and ICU facilities across Bangladesh. Filter by district or proximity.',
  openGraph: {
    title: 'Hospital Directory & Emergency Bases',
    description:
      'Verified 24/7 partner hospitals and emergency transit facilities nationwide.',
  },
}

export default function HospitalsPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section className="space-y-3 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink">Hospitals</h1>
          <p className="text-slate">
            Partner hospitals and medical centers in our emergency network. Ranked by proximity to your current location.
          </p>
        </section>

        <Suspense fallback={<ListSkeleton rows={4} />}>
          <HospitalsDirectoryView />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}
