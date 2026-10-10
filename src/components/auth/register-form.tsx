'use client'

import { FieldError } from '@/components/shared/field-error'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordStrength } from '@/components/auth/password-strength'
import { useRegister } from '@/lib/hooks'

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z
      .string()
      .min(6, 'Phone must be at least 6 characters')
      .max(20, 'Phone must be at most 20 characters')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain a letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      message: 'You must agree to the terms to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const INPUT_CLASS = 'h-12 border-hairline px-5 text-ink'

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })
  const registerMutation = useRegister()

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch is the documented way to mirror field value
  const passwordValue = watch('password') ?? ''

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
    })
  }

  return (
    <AuthLayout>
      <div className="space-y-6 rounded-3xl border border-hairline bg-paper p-6 shadow-sm sm:p-9">
        <div className="space-y-1">
          <h1 className="text-4xl text-ink">Create account</h1>
          <p className="text-sm text-slate">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-brand underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-bold text-ink">
              Full name
            </Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              autoComplete="name"
              {...register('name')}
              className={INPUT_CLASS}
            />
            {errors.name && (
              <FieldError>{errors.name.message}</FieldError>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-bold text-ink">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              className={INPUT_CLASS}
            />
            {errors.email && (
              <FieldError>{errors.email.message}</FieldError>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-bold text-ink">
              Phone <span className="text-slate font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+8801712345678"
              autoComplete="tel"
              {...register('phone')}
              className={INPUT_CLASS}
            />
            {errors.phone && (
              <FieldError>{errors.phone.message}</FieldError>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-bold text-ink">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              className={INPUT_CLASS}
            />
            {errors.password ? (
              <FieldError>{errors.password.message}</FieldError>
            ) : (
              <PasswordStrength password={passwordValue} />
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-bold text-ink"
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={INPUT_CLASS}
            />
            {errors.confirmPassword && (
              <FieldError>
                {errors.confirmPassword.message}
              </FieldError>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="agreeTerms"
              type="checkbox"
              {...register('agreeTerms')}
              className="mt-0.5 h-5 w-5 accent-[var(--brand)]"
            />
            <Label htmlFor="agreeTerms" className="text-sm font-normal text-ink">
              I agree to the terms of service
            </Label>
          </div>
          {errors.agreeTerms && (
            <FieldError>{errors.agreeTerms.message}</FieldError>
          )}

          {registerMutation.error && (
            <div role="alert" className="flex gap-2 rounded-2xl border border-signal/40 bg-signal/10 p-3 text-sm text-ink">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
              <p>{registerMutation.error.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="h-12 w-full text-base font-bold"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
