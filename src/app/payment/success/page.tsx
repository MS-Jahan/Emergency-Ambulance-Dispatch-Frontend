'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/shared/skeletons'
import { usePaymentBySession } from '@/lib/hooks'

function SuccessInner() {
  const params = useSearchParams()
  const sessionId = params.get('sessionId') ?? undefined
  const payment = usePaymentBySession(sessionId)

  return (
    <div className="w-full max-w-md bg-paper border border-hairline rounded-2xl p-8 text-center space-y-4">
      {payment.isLoading ? (
        <div className="py-4">
          <ListSkeleton rows={3} />
        </div>
      ) : payment.isError ? (
        <>
          <XCircle className="h-12 w-12 text-signal mx-auto" />
          <h1 className="text-xl font-semibold text-ink">
            We couldn&apos;t confirm that payment
          </h1>
          <p className="text-sm text-slate">
            The session link looks stale. Check your payment history before
            paying again.
          </p>
        </>
      ) : payment.data?.status === 'PAID' ? (
        <>
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <h1 className="text-xl font-semibold text-ink">Payment received</h1>
          <p className="text-sm text-slate">
            ৳{payment.data.amount.toLocaleString()} for trip{' '}
            <span className="tabular-nums">{payment.data.requestId.slice(0, 8)}</span>
            . A receipt lives in your payment history.
          </p>
        </>
      ) : (
        <>
          <Clock className="h-12 w-12 text-amber-500 mx-auto" />
          <h1 className="text-xl font-semibold text-ink">Confirming payment</h1>
          <p className="text-sm text-slate">
            Stripe hasn&apos;t confirmed the charge yet. Refresh in a moment —
            don&apos;t pay again.
          </p>
        </>
      )}

      <Button
        nativeButton={false} render={<Link href="/dashboard/payments" />}
        variant="outline"
        className="w-full border-hairline text-ink hover:bg-gauze"
      >
        Payment history
      </Button>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gauze to-paper flex items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <SuccessInner />
      </Suspense>
    </main>
  )
}
