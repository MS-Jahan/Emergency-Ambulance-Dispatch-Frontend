'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { FieldError } from '@/components/shared/field-error'
import { ChangePasswordCard } from '@/components/auth/change-password-card'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { useLogout, useMe, useUpdateProfile } from '@/lib/hooks'
import { ApiError } from '@/lib/api'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  phone: z
    .string()
    .min(6, 'Phone must be 6-20 characters')
    .max(20)
    .or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

const ROLE_LABEL = { PATIENT: 'Patient', DRIVER: 'Driver', ADMIN: 'Admin' } as const

/**
 * Shared account page body (patient and admin): photo, details, password,
 * sign out. `extra` slots into the left column under Details.
 */
export function AccountProfile({
  subtitle,
  extra,
}: {
  subtitle: string
  extra?: React.ReactNode
}) {
  const me = useMe()
  const updateProfile = useUpdateProfile()
  const logout = useLogout()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: me.data?.name ?? '', phone: me.data?.phone ?? '' },
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="title-page text-ink">Profile</h1>
        <p className="mt-1 text-sm text-slate">{subtitle}</p>
      </div>

      <Card className="rounded-2xl border border-hairline p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AvatarUpload userId={me.data?.id} name={me.data?.name} />
          <div className="min-w-0 sm:text-right">
            <p className="truncate font-heading text-xl text-ink">
              {me.data?.name ?? '—'}
            </p>
            <p className="truncate text-sm text-slate">{me.data?.email ?? ''}</p>
            {me.data && (
              <span className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                {ROLE_LABEL[me.data.role]}
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <div className="space-y-5">
          <Card className="space-y-5 rounded-2xl border border-hairline p-6">
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
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
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
                  className="mt-1 h-11 border-transparent bg-muted px-4 text-slate"
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
                {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
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
          {extra}
        </div>

        <div className="space-y-5">
          <ChangePasswordCard />
          <Card className="space-y-4 rounded-2xl border border-hairline p-6">
            <p className="text-sm text-slate">
              Signed in as{' '}
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
