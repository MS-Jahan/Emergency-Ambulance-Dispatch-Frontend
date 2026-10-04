'use client'

import Link from 'next/link'
import { CreditCard, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useInitiatePayment, useMyPayments } from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { PaymentStatus } from '@/types/api'

const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-blue-100 text-blue-800 border-blue-200',
}

export default function PaymentsPage() {
  const payments = useMyPayments(1, 50)
  const initiate = useInitiatePayment()

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Payments</h1>
        <p className="text-sm text-slate mt-1">
          Trip charges — paid securely through Stripe
        </p>
      </div>

      {payments.isLoading ? (
        <ListSkeleton rows={4} />
      ) : payments.isError ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6 text-slate" />}
          title="Could not load payments"
          description="Try refreshing the page."
        />
      ) : (payments.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6 text-slate" />}
          title="No payments yet"
          description="Charges appear here after a trip completes."
        />
      ) : (
        <div className="space-y-3">
          {payments.data!.items.map((payment) => (
            <Card key={payment.id} className="p-4 border border-hairline">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-ink tabular-nums">
                      ৳{payment.amount.toLocaleString()}
                    </p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${PAYMENT_STATUS[payment.status] ?? 'bg-gauze text-slate border-hairline'}`}
                    >
                      {payment.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate mt-1">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/requests/${payment.requestId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-oxygen hover:underline"
                  >
                    View trip <ExternalLink className="h-3 w-3" />
                  </Link>
                  {payment.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => payNow(payment.requestId)}
                      disabled={initiate.isPending}
                      className="bg-ink text-paper hover:bg-slate-800"
                    >
                      {initiate.isPending ? 'Starting...' : 'Pay now'}
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
