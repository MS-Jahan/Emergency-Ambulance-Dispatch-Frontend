'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Car, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/auth-layout'
import { useLogin, useDemoLogin } from '@/lib/hooks'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_ROLES = [
  {
    role: 'PATIENT' as const,
    label: 'Patient',
    icon: <User className="h-5 w-5" />,
    className: 'bg-oxygen text-white hover:bg-oxygen/90',
  },
  {
    role: 'DRIVER' as const,
    label: 'Driver',
    icon: <Car className="h-5 w-5" />,
    className: 'bg-amber text-white hover:bg-amber/90',
  },
  {
    role: 'ADMIN' as const,
    label: 'Admin',
    icon: <ShieldCheck className="h-5 w-5" />,
    className: 'bg-ink text-paper hover:bg-ink/90',
  },
]

export function LoginForm() {
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
      <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-ink">Sign in to your account</h2>
          <p className="text-sm text-slate">
            New here?{' '}
            <Link href="/register" className="font-medium text-oxygen hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loginMutation.isPending}
                {...register('email')}
                className="h-12 pl-10 bg-paper border-hairline text-ink"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-signal">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-ink">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                {...register('password')}
                className="h-12 pl-10 bg-paper border-hairline text-ink"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-signal">{errors.password.message}</p>
            )}
          </div>

          {loginMutation.error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{loginMutation.error.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-12 bg-ink text-paper hover:bg-signal"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-paper px-3 text-xs text-slate">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">Try a demo account</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_ROLES.map((demo) => (
              <Button
                key={demo.role}
                type="button"
                onClick={() => demoLoginMutation.mutate(demo.role)}
                disabled={demoLoginMutation.isPending}
                className={`h-14 rounded-md ${demo.className}`}
              >
                <span className="flex items-center gap-2">
                  {demo.icon}
                  <span className="text-sm font-medium">{demo.label}</span>
                </span>
              </Button>
            ))}
          </div>

          {demoLoginMutation.error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{demoLoginMutation.error.message}</p>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
