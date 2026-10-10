'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/shared/field-error'
import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordStrength } from '@/components/auth/password-strength'
import { useResetPassword } from '@/lib/hooks'

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain a letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type Values = z.infer<typeof schema>

export function ResetPasswordForm() {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''
  const reset = useResetPassword()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })
  const newPassword = watch('newPassword')

  const onSubmit = (v: Values) =>
    reset.mutate(
      { token, newPassword: v.newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated. Please sign in with your new password.')
          router.push('/login')
        },
      },
    )

  const inputCls = 'h-12 border-hairline px-5 text-ink'

  return (
    <AuthLayout>
      <div className="space-y-7 rounded-3xl border border-hairline bg-paper p-6 shadow-sm sm:p-9">
        <div className="space-y-1">
          <h1 className="text-4xl text-ink">Choose a new password</h1>
          <p className="text-sm text-slate">At least 8 characters with a letter and a number.</p>
        </div>

        {!token ? (
          <div
            role="alert"
            className="flex gap-2 rounded-2xl border border-signal/40 bg-signal/10 p-4 text-sm text-ink"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
            <p>
              This link is missing its token.{' '}
              <Link href="/forgot-password" className="font-bold text-brand underline">
                Request a new reset link
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-bold text-ink">
                New password
              </Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                disabled={reset.isPending}
                {...register('newPassword')}
                className={inputCls}
              />
              <PasswordStrength password={newPassword} />
              {errors.newPassword && <FieldError>{errors.newPassword.message}</FieldError>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-ink">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={reset.isPending}
                {...register('confirmPassword')}
                className={inputCls}
              />
              {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
            </div>

            {reset.error && (
              <div
                role="alert"
                className="space-y-1 rounded-2xl border border-signal/40 bg-signal/10 p-3 text-sm text-ink"
              >
                <p className="flex gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
                  {reset.error.message}
                </p>
                <p>
                  <Link href="/forgot-password" className="font-bold text-brand underline">
                    Request a new reset link
                  </Link>
                </p>
              </div>
            )}

            <Button type="submit" disabled={reset.isPending} className="h-12 w-full text-base">
              {reset.isPending ? 'Saving…' : 'Update password'}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
