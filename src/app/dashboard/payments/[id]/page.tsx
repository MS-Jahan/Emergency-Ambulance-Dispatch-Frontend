'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  Printer,
  ShieldCheck,
  Siren,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { Card } from '@/components/ui/card'
import { usePayment } from '@/lib/hooks'
import type { PaymentStatus } from '@/types/api'

const STATUS_ICONS: Record<PaymentStatus, React.ReactNode> = {
  PAID: <CheckCircle2 className="h-4 w-4 text-oxygen" />,
  PENDING: <Clock className="h-4 w-4 text-amber" />,
  FAILED: <XCircle className="h-4 w-4 text-signal" />,
  REFUNDED: <ShieldCheck className="h-4 w-4 text-brand" />,
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PAID: 'border-oxygen/30 bg-oxygen/10 text-oxygen',
  PENDING: 'border-amber/30 bg-amber/10 text-amber',
  FAILED: 'border-signal/30 bg-signal/10 text-signal',
  REFUNDED: 'border-brand/30 bg-brand/10 text-brand',
}

export default function PaymentReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const paymentQuery = usePayment(id)
  const payment = paymentQuery.data

  const handlePrint = () => {
    window.print()
  }

  if (paymentQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-10 w-32 animate-pulse rounded-full bg-gauze" />
        <div className="h-[500px] w-full animate-pulse rounded-3xl border border-hairline bg-paper" />
      </div>
    )
  }

  if (paymentQuery.isError || !payment) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button
          nativeButton={false}
          variant="ghost"
          render={<Link href="/dashboard/payments" />}
          className="h-9 gap-2 text-slate hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to payments
        </Button>
        <EmptyState
          icon={<CreditCard className="h-6 w-6 text-slate" />}
          title="Receipt not found"
          description="We couldn't locate this payment record or you do not have permission to view it."
          action={
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/payments" />}
              className="mt-2"
            >
              Back to payments
            </Button>
          }
        />
      </div>
    )
  }

  const receiptNumber = `REC-${payment.id.slice(-8).toUpperCase()}`
  const createdDate = new Date(payment.createdAt)
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = createdDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const req = payment.request
  const patientName = req?.patient?.name || 'Patient'
  const patientEmail = req?.patient?.email
  const ambulanceType = req?.ambulance?.type ?? req?.requestedAmbulanceType ?? 'Standard'
  const ambulancePlate = req?.ambulance?.plateNumber

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Top action bar — hidden when printed */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button
          nativeButton={false}
          variant="ghost"
          render={<Link href="/dashboard/payments" />}
          className="h-9 gap-2 text-slate hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to payments
        </Button>
        <div className="flex items-center gap-2">
          {req?.id && (
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href={`/dashboard/requests/${req.id}`} />}
              className="h-9 gap-1.5"
            >
              <ExternalLink className="h-4 w-4" /> View trip
            </Button>
          )}
          <Button
            onClick={handlePrint}
            className="h-9 gap-2 bg-brand text-white hover:bg-brand/90"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <Card
        id="receipt-container"
        className="rounded-3xl border border-hairline bg-paper p-6 shadow-sm sm:p-10 print:border-none print:p-0 print:shadow-none"
      >
        {/* Receipt Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-2xl text-brand">RapidAid</span>
              <span className="rounded-full bg-signal/10 px-2 py-0.5 text-xs font-bold text-signal">
                24/7 Dispatch
              </span>
            </div>
            <p className="text-xs text-slate">Emergency Ambulance Dispatch Service</p>
            <p className="text-xs text-slate">Dhaka, Bangladesh · Hotline: 999</p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate">
              Receipt / Tax Invoice
            </span>
            <p className="font-mono text-sm font-bold text-ink">{receiptNumber}</p>
            <p className="text-xs text-slate">
              {formattedDate} · {formattedTime}
            </p>
            <div className="flex justify-end pt-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${
                  STATUS_COLORS[payment.status] ?? 'border-hairline bg-gauze text-slate'
                }`}
              >
                {STATUS_ICONS[payment.status]}
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To & Provider */}
        <div className="grid gap-6 py-6 sm:grid-cols-2 border-b border-hairline text-xs">
          <div className="space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-slate">Billed To</span>
            <p className="text-sm font-bold text-ink">{patientName}</p>
            {patientEmail && <p className="text-slate">{patientEmail}</p>}
            {req?.callbackPhone && (
              <p className="text-slate">Callback: {req.callbackPhone}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:text-right">
            <span className="font-bold uppercase tracking-wider text-slate">Service Provider</span>
            <p className="text-sm font-bold text-ink">RapidAid Dispatch Network</p>
            <p className="text-slate">Support: billing@rapidaid.org</p>
            <p className="text-slate">Emergency Operations Command</p>
          </div>
        </div>

        {/* Trip Summary Block */}
        <div className="my-6 space-y-3 rounded-2xl bg-gauze p-4 text-xs">
          <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
            <span className="font-bold text-ink">Emergency Transport Record</span>
            <span className="font-mono text-slate">Trip #{payment.requestId.slice(0, 12)}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="space-y-1">
              <span className="flex items-center gap-1 font-semibold text-slate">
                <MapPin className="h-3 w-3 text-signal" /> Pickup Location
              </span>
              <p className="font-medium text-ink">{req?.pickupAddress || 'Address on file'}</p>
            </div>

            <div className="space-y-1">
              <span className="flex items-center gap-1 font-semibold text-slate">
                <Siren className="h-3 w-3 text-oxygen" /> Destination Facility
              </span>
              <p className="font-medium text-ink">
                {req?.destinationHospital?.name || 'Emergency Receiving Hospital'}
              </p>
              {req?.destinationHospital?.address && (
                <p className="text-[11px] text-slate line-clamp-1">
                  {req.destinationHospital.address}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-hairline/60 pt-2 text-[11px] text-slate">
            <span>
              <strong className="text-ink">Unit Type:</strong> {ambulanceType} Ambulance
            </span>
            {ambulancePlate && (
              <span>
                <strong className="text-ink">License Plate:</strong> {ambulancePlate}
              </span>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3 py-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-slate">
                <th className="pb-2 font-bold uppercase tracking-wider">Item & Description</th>
                <th className="pb-2 text-center font-bold uppercase tracking-wider">Qty</th>
                <th className="pb-2 text-right font-bold uppercase tracking-wider">Rate</th>
                <th className="pb-2 text-right font-bold uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <tr>
                <td className="py-3 font-medium text-ink">
                  <div>Emergency Ambulance Transport ({ambulanceType})</div>
                  <div className="text-[11px] text-slate font-normal">
                    Priority medical dispatch and patient transport
                  </div>
                </td>
                <td className="py-3 text-center text-slate">1</td>
                <td className="py-3 text-right text-slate tabular-nums">
                  ${payment.amount.toLocaleString()}
                </td>
                <td className="py-3 text-right font-bold text-ink tabular-nums">
                  ${payment.amount.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-ink">
                  <div>Paramedic / EMT Medical Support</div>
                  <div className="text-[11px] text-slate font-normal">
                    Vital signs monitoring & emergency stabilization
                  </div>
                </td>
                <td className="py-3 text-center text-slate">1</td>
                <td className="py-3 text-right text-slate">Included</td>
                <td className="py-3 text-right font-bold text-ink tabular-nums">$0.00</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate">
                <span>Subtotal</span>
                <span className="font-mono text-ink">${payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate">
                <span>Taxes & Fees (0%)</span>
                <span className="font-mono text-ink">$0.00</span>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2 text-sm font-bold text-ink">
                <span>Total Paid</span>
                <span className="font-mono text-base text-brand">
                  ${payment.amount.toLocaleString()} {payment.currency.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details & Footer */}
        <div className="mt-6 border-t border-hairline pt-6 text-xs text-slate space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Payment Method:</strong> Stripe Card Payment
            </span>
            {payment.stripeSessionId && (
              <span className="font-mono text-[11px]">
                Session: {payment.stripeSessionId.slice(0, 20)}...
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed">
            This receipt confirms payment for emergency medical dispatch services provided by
            RapidAid. Keep this document for your health insurance, Medicare, or corporate expense
            reimbursement claims. For billing inquiries, contact support at{' '}
            <a href="mailto:billing@rapidaid.org" className="text-brand underline">
              billing@rapidaid.org
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  )
}
