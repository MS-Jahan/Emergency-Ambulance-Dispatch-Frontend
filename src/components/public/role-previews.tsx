'use client'

import { Ambulance, ArrowRight, CheckCircle2, Navigation, Phone, Radio, Siren } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PatientSpotlightPreview() {
  return (
    <Card className="border border-hairline p-5 shadow-sm space-y-4 bg-paper">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal/10 text-signal">
            <Siren className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Trip #EA-4902</p>
            <p className="text-[11px] text-slate">Dhanmondi 27 → Square Hospital</p>
          </div>
        </div>
        <span className="rounded-full bg-signal/10 px-2 py-0.5 text-[11px] font-semibold text-signal border border-signal/20">
          Critical Priority
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate">
          <span>Assigned Ambulance:</span>
          <span className="font-mono font-semibold text-ink">DHK-ICU-8821</span>
        </div>
        <div className="flex items-center justify-between text-slate">
          <span>Estimated Arrival:</span>
          <span className="font-semibold text-oxygen">4 mins away</span>
        </div>
      </div>

      <div className="rounded-lg bg-gauze p-3 border border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-signal animate-ping" />
          <span className="text-xs font-medium text-ink">Ambulance en route</span>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs border-hairline">
          <Phone className="h-3 w-3 mr-1 text-oxygen" /> Call driver
        </Button>
      </div>
    </Card>
  )
}

export function DriverSpotlightPreview() {
  return (
    <Card className="border border-hairline p-5 shadow-sm space-y-4 bg-paper">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/10 text-amber-700 dark:text-amber">
            <Ambulance className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Driver Console</p>
            <p className="text-[11px] text-slate">Unit DHK-9012 · Basic Life Support</p>
          </div>
        </div>
        <span className="rounded-full bg-oxygen/10 px-2 py-0.5 text-[11px] font-semibold text-oxygen border border-oxygen/20">
          On Duty
        </span>
      </div>

      <div className="p-3 bg-gauze rounded-lg border border-hairline space-y-2">
        <p className="text-xs text-slate">Active Destination:</p>
        <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-signal" />
          Plot 42, Road 11, Banani
        </p>
      </div>

      <Button className="w-full h-11 bg-amber text-white hover:bg-amber/90 font-medium text-sm">
        Arrived at pickup location <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </Card>
  )
}

export function DispatcherSpotlightPreview() {
  return (
    <Card className="border border-hairline p-5 shadow-sm space-y-4 bg-paper">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-ink">
            <Radio className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Central Dispatch Board</p>
            <p className="text-[11px] text-slate">Live Incident Stream</p>
          </div>
        </div>
        <span className="rounded-full bg-oxygen/10 px-2 py-0.5 text-[11px] font-semibold text-oxygen border border-oxygen/20">
          Active Sync
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-amber/10 p-2 border border-amber/20">
          <p className="text-lg font-bold text-amber-700 dark:text-amber tabular-nums">2</p>
          <p className="text-[10px] text-slate uppercase">Pending</p>
        </div>
        <div className="rounded-lg bg-oxygen/10 p-2 border border-oxygen/20">
          <p className="text-lg font-bold text-oxygen tabular-nums">5</p>
          <p className="text-[10px] text-slate uppercase">En Route</p>
        </div>
        <div className="rounded-lg bg-gauze p-2 border border-hairline">
          <p className="text-lg font-bold text-ink tabular-nums">18</p>
          <p className="text-[10px] text-slate uppercase">Completed</p>
        </div>
      </div>

      <div className="text-xs text-slate border-t border-hairline pt-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-ink font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-oxygen" /> Auto-matched nearest unit
        </span>
        <span className="text-[11px] text-slate">100% Audit logged</span>
      </div>
    </Card>
  )
}
