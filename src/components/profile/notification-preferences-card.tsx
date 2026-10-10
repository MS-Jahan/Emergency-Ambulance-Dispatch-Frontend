'use client'

import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Toggle } from '@/components/shared/toggle'
import { useMe, usePublicCapabilities, useUpdateProfile } from '@/lib/hooks'
import { ApiError } from '@/lib/api'

/**
 * Trip update preferences. Each channel is offered only when the backend
 * reports it as configured, so with no email or SMS keys this renders nothing.
 */
export function NotificationPreferencesCard() {
  const capabilities = usePublicCapabilities()
  const me = useMe()
  const update = useUpdateProfile()

  const caps = capabilities.data
  const user = me.data
  if (!caps || !user || (!caps.email && !caps.sms)) return null

  const hasPhone = Boolean(user.phone && user.phone.trim().length > 0)

  const save = (patch: { notifyEmail?: boolean; notifySms?: boolean }, what: string) =>
    update.mutate(patch, {
      onSuccess: () => toast.success(`${what} updated`),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : 'Could not save your preference'),
    })

  return (
    <Card className="space-y-4 rounded-3xl border border-hairline p-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-brand" aria-hidden />
        <h3 className="font-heading text-lg text-ink">Trip updates</h3>
      </div>
      <p className="text-xs text-slate">
        Choose how we tell you when a crew is assigned, picks you up, or completes or cancels your
        trip. Messages never include medical details or addresses.
      </p>

      {caps.email && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Email updates</p>
            <p className="text-xs text-slate">Sent to {user.email}</p>
          </div>
          <Toggle
            checked={user.notifyEmail ?? true}
            disabled={update.isPending}
            onChange={(v) => save({ notifyEmail: v }, 'Email updates')}
            label="Email updates"
          />
        </div>
      )}

      {caps.sms && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">SMS updates</p>
            <p className="text-xs text-slate">
              {hasPhone
                ? `Sent to ${user.phone}`
                : 'Add a phone number in your details above to turn this on'}
            </p>
          </div>
          <Toggle
            checked={Boolean(user.notifySms)}
            disabled={update.isPending || (!hasPhone && !user.notifySms)}
            onChange={(v) => save({ notifySms: v }, 'SMS updates')}
            label="SMS updates"
          />
        </div>
      )}
    </Card>
  )
}
