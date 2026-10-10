'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePaymentBySession } from '@/lib/hooks'

function CancelInner() {
  const params = useSearchParams()
  const sessionId = params.get('sessionId') ?? undefined
  const payment = usePaymentBySession(sessionId, 'cancel')

  return (
    <div className="w-full max-w-md bg-paper border border-hairline rounded-3xl p-8 text-center space-y-4">
      <Undo2 className="h-14 w-14 text-amber mx-auto" />
      <h1 className="text-3xl text-ink">Checkout cancelled</h1>
      <p className="text-sm text-slate">
        Nothing was charged. Start a new payment from your payment history
        whenever you&apos;re ready.
      </p>
      {payment.data?.status === 'PENDING' && (
        <p className="text-xs text-slate">
          The old checkout link was retired — a fresh one is created next time.
        </p>
      )}
      <Button
        nativeButton={false} render={<Link href="/dashboard/payments" />}
        className="w-full h-11"
      >
        Payment history
      </Button>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-gauze flex items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <CancelInner />
      </Suspense>
    </main>
  )
}
