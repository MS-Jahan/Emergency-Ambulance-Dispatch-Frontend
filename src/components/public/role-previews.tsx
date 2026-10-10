import { Ambulance, ArrowRight, Navigation, Phone, Radio, Siren } from 'lucide-react'
import { Card } from '@/components/ui/card'

function IllustrationTag() {
  return (
    <span className="rounded-full border border-hairline bg-gauze px-2 py-0.5 text-[11px] font-semibold text-slate">
      Illustration
    </span>
  )
}

function Bar({ className = 'w-full' }: { className?: string }) {
  return <span aria-hidden className={`block h-2.5 rounded-full bg-hairline ${className}`} />
}

export function PatientSpotlightPreview() {
  return (
    <Card className="border border-hairline p-5 space-y-4 bg-paper rounded-2xl">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal/10 text-signal">
            <Siren className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Your trip</p>
            <p className="text-[11px] text-slate">Pickup address to hospital</p>
          </div>
        </div>
        <IllustrationTag />
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-3 text-slate">
          <span>Assigned ambulance</span>
          <Bar className="w-24" />
        </div>
        <div className="flex items-center justify-between gap-3 text-slate">
          <span>Estimated arrival</span>
          <Bar className="w-16" />
        </div>
      </div>

      <div className="rounded-xl bg-gauze p-3 border border-hairline flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-signal" aria-hidden />
          <span className="text-xs font-medium text-ink">EN_ROUTE_PICKUP</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-xs text-ink">
          <Phone className="h-3 w-3 text-oxygen" aria-hidden /> Call driver
        </span>
      </div>
    </Card>
  )
}

export function DriverSpotlightPreview() {
  return (
    <Card className="border border-hairline p-5 space-y-4 bg-paper rounded-2xl">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/10 text-amber">
            <Ambulance className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Driver console</p>
            <p className="text-[11px] text-slate">Assigned ambulance</p>
          </div>
        </div>
        <IllustrationTag />
      </div>

      <div className="p-3 bg-gauze rounded-xl border border-hairline space-y-2">
        <p className="text-xs text-slate">Pickup address</p>
        <p className="flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-signal" aria-hidden />
          <Bar className="w-40" />
        </p>
        <p className="text-[11px] font-semibold text-ink">ASSIGNED</p>
      </div>

      <div
        aria-hidden
        className="flex h-11 w-full items-center justify-center rounded-full bg-amber text-sm font-medium text-white"
      >
        Next step: start driving to pickup <ArrowRight className="h-4 w-4 ml-1.5" />
      </div>
    </Card>
  )
}

const BOARD_COLUMNS = ['Pending', 'In progress', 'Done']

export function DispatcherSpotlightPreview() {
  return (
    <Card className="border border-hairline p-5 space-y-4 bg-paper rounded-2xl">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-ink">
            <Radio className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Dispatch board</p>
            <p className="text-[11px] text-slate">Three columns</p>
          </div>
        </div>
        <IllustrationTag />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {BOARD_COLUMNS.map((c) => (
          <div key={c} className="rounded-lg bg-gauze p-2 border border-hairline space-y-2">
            <p className="text-[10px] font-semibold uppercase text-slate">{c}</p>
            <Bar />
            <Bar className="w-2/3" />
          </div>
        ))}
      </div>

      <p className="text-xs text-slate border-t border-hairline pt-2.5">
        Nearby ambulances are listed by distance, then assigned in a click.
      </p>
    </Card>
  )
}
