'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { PublicHeader } from '@/components/public/public-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SUPPORT_EMAIL = 'support@rapidaid.example'
const SUPPORT_PHONE = '+880 2 XXXX XXXX'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Fill every field')
      return
    }
    // No backend behind this form — hand the draft to the visitor's mail client
    const subject = encodeURIComponent(`Message from ${form.name.trim()}`)
    const body = encodeURIComponent(
      `${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`,
    )
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    toast.success('Opening your email app with the message ready')
  }

  const inputCls = 'mt-1 bg-paper border-hairline text-ink'

  return (
    <div className="min-h-screen bg-gauze flex flex-col">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold text-ink">Contact us</h1>
          <p className="text-slate">
            Questions about the service, billing, or partnerships — we read
            everything.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="bg-paper border border-hairline rounded-xl p-5 flex gap-3">
              <Mail className="h-5 w-5 text-oxygen shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">Email</p>
                <p className="text-sm text-slate">{SUPPORT_EMAIL}</p>
              </div>
            </div>
            <div className="bg-paper border border-hairline rounded-xl p-5 flex gap-3">
              <Phone className="h-5 w-5 text-signal shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">Support line</p>
                <p className="text-sm text-slate">{SUPPORT_PHONE}</p>
              </div>
            </div>
            <div className="bg-paper border border-hairline rounded-xl p-5 flex gap-3">
              <MapPin className="h-5 w-5 text-slate shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">Office</p>
                <p className="text-sm text-slate">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="bg-paper border border-hairline rounded-xl p-5 space-y-4"
          >
            <div>
              <Label htmlFor="c-name" className="text-sm font-medium text-ink">
                Name
              </Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="c-email" className="text-sm font-medium text-ink">
                Email
              </Label>
              <Input
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="c-msg" className="text-sm font-medium text-ink">
                Message
              </Label>
              <textarea
                id="c-msg"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className={`mt-1 w-full rounded-md border border-hairline bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-oxygen/40`}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-ink text-paper hover:bg-ink/90"
            >
              Send message
            </Button>
            <p className="text-xs text-slate">
              This opens your email app with the message filled in — nothing is
              stored on our servers.
            </p>
          </form>
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
