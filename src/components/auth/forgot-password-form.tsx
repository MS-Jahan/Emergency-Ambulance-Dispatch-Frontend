'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/shared/field-error'
import { AuthLayout } from '@/components/auth/auth-layout'
import { useForgotPassword, usePublicCapabilities } from '@/lib/hooks'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type Values = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const capabilities = usePublicCapabilities()
  const forgot = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const unavailable = capabilities.isSuccess && !capabilities.data.passwordReset

  return (
    <AuthLayout>
      <div className="space-y-7 rounded-3xl border border-hairline bg-paper p-6 shadow-sm sm:p-9">
        <div className="space-y-1">
          <h1 className="text-4xl text-ink">Reset your password</h1>
          <p className="text-sm text-slate">
            Enter the email address of your account and we will send you a link to choose a new
            password.
          </p>
        </div>

        {unavailable ? (
          <div
            role="status"
            className="flex gap-2 rounded-2xl border border-hairline bg-gauze p-4 text-sm text-ink"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate" aria-hidden />
            <p>
              Password reset by email is not available right now. Please contact support or use
              the one-click demo accounts on the sign-in page.
            </p>
          </div>
        ) : forgot.isSuccess ? (
          <div
            role="status"
            className="flex gap-3 rounded-2xl border border-hairline bg-brand-soft p-4 text-sm text-ink"
          >
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
            <p>
              If an account exists for that address, we sent a reset link. The link works for 30
              minutes and can be used once.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit((v) => forgot.mutate(v))}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-bold text-ink">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={forgot.isPending}
                {...register('email')}
                className="h-12 border-hairline px-5 text-ink"
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </div>

            {forgot.error && (
              <div
                role="alert"
                className="flex gap-2 rounded-2xl border border-signal/40 bg-signal/10 p-3 text-sm text-ink"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
                <p>{forgot.error.message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={forgot.isPending || capabilities.isLoading}
              className="h-12 w-full text-base"
            >
              {forgot.isPending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="text-sm text-slate">
          Remembered it?{' '}
          <Link href="/login" className="font-bold text-brand underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
