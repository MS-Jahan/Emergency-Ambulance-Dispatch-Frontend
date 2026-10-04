'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useInitiatePayment, useMyPayments } from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { PaymentStatus } from '@/types/api'

const STATUS_BADGE: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-blue-100 text-blue-800 border-blue-200',
}

/** Amount color tells the story at a glance: teal paid, amber owed, red failed. */
const AMOUNT_COLOR: Record<PaymentStatus, string> = {
  PENDING: 'text-amber',
  PAID: 'text-oxygen',
  FAILED: 'text-signal',
  REFUNDED: 'text-slate',
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'PAID', 'FAILED'] as const

export default function PaymentsPage() {
  const payments = useMyPayments(1, 50)
  const initiate = useInitiatePayment()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [tripQuery, setTripQuery] = useState('')

  const payNow = async (requestId: string) => {
    try {
      const { checkoutUrl } = await initiate.mutateAsync(requestId)
      window.location.assign(checkoutUrl)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Could not start payment',
      )
    }
  }

  const all = payments.data?.items ?? []
  const filtered = all.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (tripQuery && !p.requestId.toLowerCase().includes(tripQuery.toLowerCase()))
      return false
    return true
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Payment history</h1>
        <p className="text-sm text-slate mt-1">
          Trip charges — paid securely through Stripe
        </p>
      </div>

      {/* Filter bar — stacked on phones, inline from sm up */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'ALL')}>
          <SelectTrigger className="w-full sm:w-40 bg-paper border-hairline text-ink">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'ALL' ? 'All statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            value={tripQuery}
            onChange={(e) => setTripQuery(e.target.value)}
            placeholder="Search by trip ID"
            className="h-10 bg-paper border-hairline text-ink pl-9"
            aria-label="Search by trip ID"
          />
        </div>
      </div>

      {payments.isLoading ? (
        <ListSkeleton rows={4} />
      ) : payments.isError ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6 text-slate" />}
          title="Could not load payments"
          description="Try refreshing the page."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6 text-slate" />}
          title={all.length === 0 ? 'No payments yet' : 'No matching payments'}
          description={
            all.length === 0
              ? 'Charges appear here after a trip completes.'
              : 'Try a different status or trip ID.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => (
            <Card key={payment.id} className="p-4 border border-hairline">
              <div className="flex items-center gap-3">
                {/* Left: trip + date */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-slate">
                    {payment.requestId}
                  </p>
                  <p className="mt-0.5 text-sm text-slate">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Middle: amount, color-coded */}
                <p
                  className={`flex-shrink-0 text-lg font-bold tabular-nums ${AMOUNT_COLOR[payment.status] ?? 'text-ink'}`}
                >
                  ৳{payment.amount.toLocaleString()}
                </p>

                {/* Right: badge + action */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span
                    className={`hidden rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline-block ${STATUS_BADGE[payment.status] ?? 'bg-gauze text-slate border-hairline'}`}
                  >
                    {payment.status.toLowerCase()}
                  </span>
                  {payment.status === 'PENDING' ? (
                    <Button
                      size="sm"
                      onClick={() => payNow(payment.requestId)}
                      disabled={initiate.isPending}
                      className="bg-ink text-paper hover:bg-ink/90"
                    >
                      {initiate.isPending ? 'Starting...' : 'Pay'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      render={
                        <a href={`/dashboard/requests/${payment.requestId}`} />
                      }
                      className="text-oxygen hover:bg-oxygen/10"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      Trip
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
