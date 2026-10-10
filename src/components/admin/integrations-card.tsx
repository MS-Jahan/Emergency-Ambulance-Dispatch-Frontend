'use client'

import { useState } from 'react'
import { Mail, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useAdminTestEmail,
  useAdminTestSms,
  usePublicCapabilities,
} from '@/lib/hooks'
import type { IntegrationTestResult } from '@/types/api'
import { cn } from '@/lib/utils'

function describe(result: IntegrationTestResult | undefined, error: Error | null) {
  if (error) return { ok: false, text: error.message }
  if (!result) return null
  if (result.sent) return { ok: true, text: 'Accepted by the provider. Check the inbox or phone.' }
  if (result.skipped === 'not_configured') {
    return { ok: false, text: 'Skipped: not configured on the backend.' }
  }
  return { ok: false, text: result.error ?? 'The provider refused the message.' }
}

function Channel({
  icon,
  title,
  configured,
  placeholder,
  inputType,
  pending,
  onSend,
  result,
  error,
}: {
  icon: React.ReactNode
  title: string
  configured: boolean | undefined
  placeholder: string
  inputType: 'email' | 'tel'
  pending: boolean
  onSend: (to: string) => void
  result: IntegrationTestResult | undefined
  error: Error | null
}) {
  const [to, setTo] = useState('')
  const outcome = describe(result, error)

  return (
    <div className="space-y-3 rounded-2xl border border-hairline bg-gauze p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-medium text-ink">
          {icon}
          {title}
        </p>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-bold',
            configured ? 'bg-oxygen/15 text-ink' : 'bg-muted text-slate',
          )}
        >
          {configured === undefined ? 'Checking…' : configured ? 'Configured' : 'Not configured'}
        </span>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          if (to.trim()) onSend(to.trim())
        }}
      >
        <Input
          type={inputType}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={placeholder}
          aria-label={`${title} test recipient`}
          className="h-10 flex-1 border-hairline px-4 text-ink"
        />
        <Button type="submit" variant="outline" disabled={pending || !to.trim()} className="h-10">
          {pending ? 'Sending…' : 'Send test'}
        </Button>
      </form>
      {outcome && (
        <p
          role="status"
          className={cn('text-sm', outcome.ok ? 'text-ink' : 'text-slate')}
        >
          {outcome.text}
        </p>
      )}
    </div>
  )
}

/** Shows which optional integrations are live and lets an admin send a test message. */
export function IntegrationsCard() {
  const capabilities = usePublicCapabilities()
  const testEmail = useAdminTestEmail()
  const testSms = useAdminTestSms()

  return (
    <Card className="space-y-4 rounded-3xl border border-hairline p-6">
      <div>
        <h2 className="text-xl text-ink">Integrations</h2>
        <p className="mt-1 text-sm text-slate">
          Email and SMS switch on by themselves when their keys are added to the backend
          environment. No keys are shown here.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Channel
          icon={<Mail className="h-4 w-4 text-brand" aria-hidden />}
          title="Email"
          configured={capabilities.data?.email}
          placeholder="you@example.com"
          inputType="email"
          pending={testEmail.isPending}
          onSend={(to) => testEmail.mutate({ to })}
          result={testEmail.data}
          error={testEmail.error}
        />
        <Channel
          icon={<MessageSquare className="h-4 w-4 text-brand" aria-hidden />}
          title="SMS"
          configured={capabilities.data?.sms}
          placeholder="+8801700000000"
          inputType="tel"
          pending={testSms.isPending}
          onSend={(to) => testSms.mutate({ to })}
          result={testSms.data}
          error={testSms.error}
        />
      </div>
    </Card>
  )
}
