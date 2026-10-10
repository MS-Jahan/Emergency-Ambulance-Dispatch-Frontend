import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Choose a new password',
  description: 'Set a new password for your RapidAid account.',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
