'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AlertCircle, Lock, Mail, Phone, User } from 'lucide-react'
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

const INPUT_ICON = 'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate'
const INPUT_CLASS = 'h-12 pl-10 bg-paper border-hairline text-ink'

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })
  const registerMutation = useRegister()

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch is the documented way to mirror field value
  const passwordValue = watch('password') ?? ''

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
    })
  }

  return (
    <AuthLayout>
      <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-ink">Create your account</h2>
          <p className="text-sm text-slate">
            Already registered?{' '}
            <Link href="/login" className="font-medium text-oxygen hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-ink">
              Full name
            </Label>
            <div className="relative">
              <User className={INPUT_ICON} />
              <Input
                id="name"
                placeholder="Jane Doe"
                autoComplete="name"
                {...register('name')}
                className={INPUT_CLASS}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-signal">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </Label>
            <div className="relative">
              <Mail className={INPUT_ICON} />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                className={INPUT_CLASS}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-signal">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-ink">
              Phone <span className="text-slate font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className={INPUT_ICON} />
              <Input
                id="phone"
                type="tel"
                placeholder="+8801712345678"
                autoComplete="tel"
                {...register('phone')}
                className={INPUT_CLASS}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-signal">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-ink">
              Password
            </Label>
            <div className="relative">
              <Lock className={INPUT_ICON} />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                className={INPUT_CLASS}
              />
            </div>
            {errors.password ? (
              <p className="text-xs text-signal">{errors.password.message}</p>
            ) : (
              <PasswordStrength password={passwordValue} />
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-ink"
            >
              Confirm password
            </Label>
            <div className="relative">
              <Lock className={INPUT_ICON} />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={INPUT_CLASS}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-signal">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {registerMutation.error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{registerMutation.error.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-12 bg-ink text-paper hover:bg-signal"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
