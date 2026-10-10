'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/shared/field-error'
import { AuthLayout } from '@/components/auth/auth-layout'
import { useLogin, useDemoLogin } from '@/lib/hooks'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_ROLES = [
  {
    role: 'PATIENT' as const,
    label: 'Patient',
    caption: 'You will see: request wizard, live trip, payments',
  },
  {
    role: 'DRIVER' as const,
    label: 'Driver',
    caption: 'You will see: one big next-step button, navigation',
  },
  {
    role: 'ADMIN' as const,
    label: 'Admin',
    caption: 'You will see: dispatch board, KPIs, resources',
  },
]

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useLogin()
  const demoLoginMutation = useDemoLogin()

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data)
  }

  return (
    <AuthLayout>
      <div className="space-y-7 rounded-3xl border border-hairline bg-paper p-6 shadow-sm sm:p-9">
        <div className="space-y-1">
          <h1 className="text-4xl text-ink">Welcome back</h1>
          <p className="text-sm text-slate">
            New here?{' '}
            <Link href="/register" className="font-bold text-brand underline-offset-2 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-bold text-ink">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loginMutation.isPending}
              {...register('email')}
              className="h-12 border-hairline px-5 text-ink"
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-bold text-ink">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                {...register('password')}
                className="h-12 border-hairline px-5 pr-20 text-ink"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-sm font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <FieldError>{errors.password.message}</FieldError>}
          </div>

          {loginMutation.error && (
            <div
              role="alert"
              className="flex gap-2 rounded-2xl border border-signal/40 bg-signal/10 p-3 text-sm text-ink"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
              <p>{loginMutation.error.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="h-12 w-full text-base font-bold"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="space-y-3 border-t border-hairline pt-6">
          <p className="text-sm font-bold text-ink">Try a demo role</p>
          <div className="grid gap-2.5">
            {DEMO_ROLES.map((demo, i) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => demoLoginMutation.mutate(demo.role)}
                disabled={demoLoginMutation.isPending}
                className={cn(
                  'rounded-2xl border border-hairline px-5 py-3 text-left transition-colors',
                  'hover:border-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                  i === 0 && 'bg-brand-soft',
                )}
              >
                <span className="block font-heading text-xl text-ink">{demo.label}</span>
                <span className="block text-sm text-slate">{demo.caption}</span>
              </button>
            ))}
          </div>

          {demoLoginMutation.error && (
            <div
              role="alert"
              className="flex gap-2 rounded-2xl border border-signal/40 bg-signal/10 p-3 text-sm text-ink"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
              <p>{demoLoginMutation.error.message}</p>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
