import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'
import { PublicHeader } from '@/components/public/public-header'
import { PublicFooter } from '@/components/public/public-footer'
import { ContactForm } from '@/components/public/contact-form'

export const metadata: Metadata = {
  title: 'Contact Support & Inquiries',
  description:
    'Reach our 24/7 emergency dispatch headquarters, customer care team, or partner hospital network.',
  openGraph: {
    title: 'Contact Support & Inquiries',
    description:
      'Questions about emergency response, hospital coordination, or fleet integration? Contact RapidAid.',
  },
}

const SUPPORT_EMAIL = 'support@rapidaid.example'
const SUPPORT_PHONE = '+880 2 999 1234'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <section className="space-y-3">
          <h1 className="text-4xl sm:text-5xl text-ink">Talk to us</h1>
          <p className="text-slate max-w-2xl">
            Questions about the service, billing, fleet operations, or hospital
            partnerships — our support team is available around the clock.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="bg-paper border border-hairline rounded-2xl p-5 flex gap-3">
              <Mail className="h-5 w-5 text-brand shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">Email</p>
                <p className="text-sm text-slate">{SUPPORT_EMAIL}</p>
              </div>
            </div>
            <div className="bg-paper border border-hairline rounded-2xl p-5 flex gap-3">
              <Phone className="h-5 w-5 text-brand shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">Support line</p>
                <p className="text-sm text-slate">{SUPPORT_PHONE}</p>
              </div>
            </div>
            <div className="bg-paper border border-hairline rounded-2xl p-5 flex gap-3">
              <MapPin className="h-5 w-5 text-slate shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">Central Headquarters</p>
                <p className="text-sm text-slate">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>

          <ContactForm />
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
