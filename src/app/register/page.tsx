'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
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

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })
  const registerMutation = useRegister()

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gauze to-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-signal text-white mb-4">
            <span className="text-xl font-bold">⚕</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Create account</h1>
          <p className="text-sm text-slate mt-1">
            Join Dispatch to request an ambulance
          </p>
        </div>

        <Card className="p-6 mb-6 border border-hairline">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-ink">
                Full name
              </Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                autoComplete="name"
                {...register('name')}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-signal">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-ink">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-signal">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-ink">
                Phone <span className="text-slate font-normal">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+8801712345678"
                autoComplete="tel"
                {...register('phone')}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-signal">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-signal">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-slate">
                At least 8 characters with a letter and a number
              </p>
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-ink"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-signal">
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
              className="w-full bg-ink text-paper hover:bg-slate-800 dark:bg-paper dark:text-ink dark:hover:bg-slate-100"
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-hairline">
            <p className="text-center text-sm text-slate mb-4">
              Already have an account?
            </p>
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-hairline text-ink hover:bg-gauze"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
