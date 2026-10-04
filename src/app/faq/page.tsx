import Link from 'next/link'
import { PublicHeader } from '@/components/public/public-header'
import { Button } from '@/components/ui/button'

const FAQS = [
  {
    q: 'How do I get an ambulance?',
    a: 'Sign in, press the big Raise request button, and your browser location is attached automatically — you can adjust the pickup point on the map. Pick a priority, and a dispatcher assigns the closest available unit.',
  },
  {
    q: 'What do the priorities mean?',
    a: 'CRITICAL requests are life-threatening and are assigned first, ahead of everything else in the queue. HIGH requests are urgent but stable and go before NORMAL ones, which are handled first-come first-served.',
  },
  {
    q: 'Which ambulance will come?',
    a: 'Three vehicle classes: Basic transport for stable patients, ICU support with monitoring equipment on board, and Cardiac care with a defibrillator and the highest dispatch priority. You can see live details of the assigned unit in your request view.',
  },
  {
    q: 'When and how do I pay?',
    a: 'Once. After the trip completes. A Stripe checkout link appears on the request; paying there marks the trip paid, and your payment history keeps the receipt. If you close checkout, the link expires so nothing can be charged by accident.',
  },
  {
    q: 'Can I cancel a request?',
    a: 'Yes — while it is still pending, before an ambulance is assigned. Once a driver is en route, the request runs its course; you can follow it live instead.',
  },
  {
    q: 'I am a driver. How do I join?',
    a: 'Register with the driver role and your license number. An admin verifies the profile; after that you go on duty from the driver page and receive assigned requests with their pickup points.',
  },
  {
    q: 'Does my location stay private?',
    a: 'Your pickup point is shared only with the dispatcher and the driver assigned to your trip — that is all it is used for.',
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold text-ink">
            Frequently asked questions
          </h1>
          <p className="text-slate">
            Short answers about requests, priorities, and paying.
          </p>
        </section>

        <section className="space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="bg-paper border border-hairline rounded-xl px-5 py-4 group"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer font-medium text-ink list-none marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-slate text-lg leading-none group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate leading-relaxed">{item.a}</p>
            </details>
          ))}
        </section>

        <section className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-ink text-paper rounded-xl p-6">
          <p className="text-sm">
            Question not covered here? Get in touch and we will answer.
          </p>
          <Button
            render={<Link href="/contact" />}
            className="bg-signal text-white hover:bg-signal/90 shrink-0"
          >
            Contact us
          </Button>
        </section>
      </main>
      <footer className="border-t border-hairline bg-paper py-4">
        <p className="text-center text-xs text-slate">
          RapidAid — emergency ambulance dispatch
        </p>
      </footer>
    </div>
  )
}
