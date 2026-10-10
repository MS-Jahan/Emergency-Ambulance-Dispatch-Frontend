import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gauze flex items-center px-4 sm:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <p className="font-heading text-8xl sm:text-9xl leading-none text-brand" aria-hidden>
          404
        </p>
        <h1 className="text-3xl sm:text-4xl text-ink">This road doesn&apos;t go anywhere.</h1>
        <p className="text-slate max-w-md">
          The page you asked for does not exist or was moved. If you were
          mid-trip, your dashboard still has it.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button nativeButton={false} render={<Link href="/" />} className="h-11 px-6">
            Home
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/dashboard" />}
            variant="outline"
            className="h-11 px-6"
          >
            Dashboard
          </Button>
          <Button
            nativeButton={false}
            render={<a href="tel:999" />}
            className="h-11 px-6 bg-signal text-white hover:bg-signal/90"
          >
            Call 999
          </Button>
        </div>
      </div>
    </main>
  )
}
