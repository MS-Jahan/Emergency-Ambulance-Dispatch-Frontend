'use client'

import { FieldError } from '@/components/shared/field-error'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { LogOut, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useLogout, useMe, useUpdateProfile } from '@/lib/hooks'
import { useUI } from '@/lib/store'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  phone: z
    .string()
    .min(6, 'Phone must be 6-20 characters')
    .max(20)
    .or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

/** Small toggle switch (no shadcn switch installed; hand-rolled, same contract). */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 flex-shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        checked ? 'bg-brand' : 'border-2 border-slate bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-6 w-6 rounded-full shadow transition-transform',
          checked ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-slate',
        )}
      />
    </button>
  )
}

export default function ProfilePage() {
  const me = useMe()
  const updateProfile = useUpdateProfile()
  const logout = useLogout()
  const theme = useUI((s) => s.theme)
  const setTheme = useUI((s) => s.setTheme)

  // Apply immediately on toggle; flips brand tokens on patient/public pages.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: me.data?.name ?? '',
      phone: me.data?.phone ?? '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        phone: data.phone || undefined,
      })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl text-ink">Profile</h1>
        <p className="text-sm text-slate mt-1">Your account details</p>
      </div>

      {/* Avatar — initials, no photo upload (no endpoint) */}
      <div className="flex">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand font-heading text-3xl text-brand-foreground">
            {me.data ? initials(me.data.name) : '—'}
          </div>
          <span
            className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gauze bg-paper text-slate"
            title="Profile photo coming soon"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
      <Card className="space-y-5 rounded-3xl border border-hairline p-6">
        <p className="font-heading text-xl text-ink">Details</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm font-bold text-ink">
              Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1 h-11 border-hairline px-4 text-ink"
            />
            {errors.name && (
              <FieldError>{errors.name.message}</FieldError>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-bold text-ink">
              Email
            </Label>
            <Input
              id="email"
              value={me.data?.email ?? ''}
              readOnly
              disabled
              className="mt-1 h-11 px-4 border-transparent bg-muted text-slate"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-bold text-ink">
              Phone
            </Label>
            <Input
              id="phone"
              placeholder="+8801XXXXXXXXX"
              {...register('phone')}
              className="mt-1 h-11 border-hairline px-4 text-ink"
            />
            {errors.phone && (
              <FieldError>{errors.phone.message}</FieldError>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="h-11 w-full"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <div className="space-y-5">
      <Card className="space-y-4 rounded-3xl border border-hairline p-6">
        <p className="font-heading text-xl text-ink">Preferences</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-ink">Dark theme</p>
            <p className="text-xs text-slate">Easier on the eyes at night</p>
          </div>
          <Toggle
            checked={theme === 'dark'}
            onChange={(v) => setTheme(v ? 'dark' : 'light')}
            label="Toggle dark mode"
          />
        </div>
      </Card>

      <Card className="space-y-4 rounded-3xl border border-hairline p-6">
        <p className="text-sm text-slate">
          Logged in as{' '}
          <span className="font-medium text-ink">{me.data?.email ?? '—'}</span>
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="h-11 w-full"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {logout.isPending ? 'Logging out...' : 'Log out'}
        </Button>
      </Card>
      </div>
      </div>
    </div>
  )
}
