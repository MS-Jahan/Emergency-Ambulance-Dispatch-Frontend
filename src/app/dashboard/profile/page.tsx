'use client'

import { AccountProfile } from '@/components/profile/account-profile'
import { NotificationPreferencesCard } from '@/components/profile/notification-preferences-card'

export default function ProfilePage() {
  return (
    <AccountProfile
      subtitle="Your account details"
      extra={<NotificationPreferencesCard />}
    />
  )
}
