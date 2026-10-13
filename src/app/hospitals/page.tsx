import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/public-header'
import { PublicFooter } from '@/components/public/public-footer'
import { HospitalsDirectoryView } from '@/components/public/hospitals-directory-view'
import { ListSkeleton } from '@/components/shared/skeletons'
import { PageContainer } from '@/components/shared/page-container'

export const metadata: Metadata = {
  title: 'Hospital Directory & Emergency Bases',
  description:
    'Explore hospitals and emergency facilities. Filter by district or proximity.',
  openGraph: {
    title: 'Hospital Directory & Emergency Bases',
    description:
      'Hospitals and emergency facilities you can choose as a destination.',
  },
}

export default function HospitalsPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1"><PageContainer width="wide" className="py-12 sm:py-16 space-y-10">
        <section className="space-y-3 max-w-2xl">
          <h1 className="title-hero text-ink">Hospitals</h1>
          <p className="text-slate">
            Partner hospitals and medical centers in our emergency network. Ranked by proximity to your current location.
          </p>
        </section>

        <Suspense fallback={<ListSkeleton rows={4} />}>
          <HospitalsDirectoryView />
        </Suspense>
      </PageContainer></main>
      <PublicFooter />
    </div>
  )
}
