import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gauze to-paper">
      {/* Navigation */}
      <nav className="border-b border-hairline bg-paper/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-signal text-white flex items-center justify-center text-lg font-bold">
              ⚕
            </div>
            <span className="font-bold text-ink">Dispatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-ink hover:bg-gauze"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-ink text-paper hover:bg-slate-800">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-ink mb-6 leading-tight">
              Ambulance in seconds
            </h1>
            <p className="text-lg text-slate mb-8 leading-relaxed">
              Fast, reliable emergency ambulance dispatch. Request help with one tap.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-signal text-white hover:bg-red-600">
                  Request now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-ink text-ink hover:bg-gauze">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-paper rounded-lg border border-hairline p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-amber mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-ink text-sm">Pending</p>
                  <p className="text-xs text-slate">You request an ambulance</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-oxygen mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-ink text-sm">On the way</p>
                  <p className="text-xs text-slate">Driver heading to your location</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-oxygen mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-ink text-sm">En route to hospital</p>
                  <p className="text-xs text-slate">You're safely in the ambulance</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-ink text-sm">Complete</p>
                  <p className="text-xs text-slate">Arrived at the hospital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-paper border-t border-hairline py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-ink mb-12 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border border-hairline">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-lg font-bold text-ink mb-2">Tell us your location</h3>
              <p className="text-slate text-sm">Share your pickup location with one tap</p>
            </Card>
            <Card className="p-6 border border-hairline">
              <div className="text-3xl mb-4">🚗</div>
              <h3 className="text-lg font-bold text-ink mb-2">We dispatch an ambulance</h3>
              <p className="text-slate text-sm">The nearest ambulance heads to you immediately</p>
            </Card>
            <Card className="p-6 border border-hairline">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-lg font-bold text-ink mb-2">Pay after arrival</h3>
              <p className="text-slate text-sm">Pay online once you've safely arrived</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-ink to-slate py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-paper mb-6">
            Save a life
          </h2>
          <p className="text-paper/80 mb-8 text-lg">
            Emergency ambulance dispatch is available 24/7. Anytime you need us, we're here.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-signal text-white hover:bg-red-600">
              Get started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
