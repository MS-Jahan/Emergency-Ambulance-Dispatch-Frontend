'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  PENDING: 'bg-amber text-white',
  PAID: 'bg-oxygen text-white',
  FAILED: 'bg-signal text-white',
  REFUNDED: 'bg-brand-soft text-brand',
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'PAID', 'FAILED'] as const

function PaymentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') ?? 'ALL'
  const tripQuery = searchParams.get('q') ?? ''

  const payments = useMyPayments(1, 50)
  const initiate = useInitiatePayment()

  const setStatus = (v: string | null) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (!v || v === 'ALL') {
      sp.delete('status')
    } else {
      sp.set('status', v)
    }
    router.push(`/dashboard/payments?${sp.toString()}`)
  }

  const setQuery = (q: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      sp.set('q', q)
    } else {
      sp.delete('q')
    }
    router.push(`/dashboard/payments?${sp.toString()}`)
  }

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
        <h1 className="text-4xl text-ink">Payments</h1>
        <p className="text-sm text-slate mt-1">
          Trip charges — paid securely through Stripe
        </p>
      </div>

      {/* Filter bar — stacked on phones, inline from sm up */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={statusFilter} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40 border-hairline text-ink">
            <SelectValue>
              {(v: string) => (v === 'ALL' ? 'All statuses' : v.charAt(0) + v.slice(1).toLowerCase())}
            </SelectValue>
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
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
            aria-hidden
          />
          <Input
            value={tripQuery}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by trip ID"
            className="h-10 border-hairline pl-10 text-ink"
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
            <Card key={payment.id} className="rounded-3xl border border-hairline px-5 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                {/* Left: trip + date */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-bold text-ink">
                    {payment.requestId}
                  </p>
                  <p className="mt-0.5 text-xs text-slate">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Middle: amount, color-coded */}
                <p
                  className={`flex-shrink-0 text-lg font-extrabold tabular-nums text-ink`}
                >
                  ${payment.amount.toLocaleString()}
                </p>

                {/* Right: badge + action */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span
                    className={`hidden rounded-full px-3 py-0.5 text-xs font-extrabold sm:inline-block ${STATUS_BADGE[payment.status] ?? 'bg-muted text-slate'}`}
                  >
                    {payment.status.toLowerCase()}
                  </span>
                  {payment.status === 'PENDING' ? (
                    <Button
                      size="sm"
                      onClick={() => payNow(payment.requestId)}
                      disabled={initiate.isPending}
                      className="h-9 px-4"
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
                      className="h-9 px-3 text-brand"
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

export default function PaymentsPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={4} />}>
      <PaymentsContent />
    </Suspense>
  )
}
