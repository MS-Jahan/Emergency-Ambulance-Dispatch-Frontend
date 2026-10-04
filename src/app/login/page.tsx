'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useLogin, useDemoLogin } from '@/lib/hooks'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLogin()
  const demoLoginMutation = useDemoLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email and password required')
      return
    }
    loginMutation.mutate({ email, password })
  }

  const handleDemoLogin = (role: 'PATIENT' | 'DRIVER' | 'ADMIN') => {
    demoLoginMutation.mutate(role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gauze to-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-signal text-white mb-4">
            <span className="text-xl font-bold">⚕</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Dispatch</h1>
          <p className="text-sm text-slate mt-1">Emergency ambulance service</p>
        </div>

        {/* Main card */}
        <Card className="p-6 mb-6 border border-hairline">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-ink">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className="mt-1 bg-paper border-hairline text-ink placeholder:text-slate-400"
              />
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
              className="w-full bg-ink text-paper hover:bg-slate-800 dark:bg-paper dark:text-ink dark:hover:bg-slate-100"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-hairline">
            <p className="text-center text-sm text-slate mb-4">New to Dispatch?</p>
            <Link href="/register">
              <Button
                variant="outline"
                className="w-full border-hairline text-ink hover:bg-gauze"
              >
                Create account
              </Button>
            </Link>
          </div>
        </Card>

        {/* Demo section */}
        <div className="space-y-3">
          <p className="text-center text-xs font-medium text-slate uppercase tracking-wide">
            Demo login
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleDemoLogin('PATIENT')}
              disabled={demoLoginMutation.isPending}
              className="h-16 flex flex-col items-center justify-center gap-1 rounded bg-oxygen text-white hover:bg-oxygen-600 dark:hover:bg-opacity-80"
              variant="ghost"
            >
              <span className="text-lg">👤</span>
              <span className="text-xs font-medium">Patient</span>
            </Button>

            <Button
              onClick={() => handleDemoLogin('DRIVER')}
              disabled={demoLoginMutation.isPending}
              className="h-16 flex flex-col items-center justify-center gap-1 rounded bg-amber text-white hover:bg-amber-600 dark:hover:bg-opacity-80"
              variant="ghost"
            >
              <span className="text-lg">🚗</span>
              <span className="text-xs font-medium">Driver</span>
            </Button>

            <Button
              onClick={() => handleDemoLogin('ADMIN')}
              disabled={demoLoginMutation.isPending}
              className="h-16 flex flex-col items-center justify-center gap-1 rounded bg-ink text-white hover:bg-slate-800 dark:bg-paper dark:text-ink dark:hover:bg-slate-100"
              variant="ghost"
            >
              <span className="text-lg">👨‍💼</span>
              <span className="text-xs font-medium">Admin</span>
            </Button>
          </div>

          {demoLoginMutation.error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{demoLoginMutation.error.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
