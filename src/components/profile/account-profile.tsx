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

const phoneOptional = z
  .string()
  .min(6, 'Phone must be 6-20 characters')
  .max(20, 'Phone must be 6-20 characters')
  .or(z.literal(''))

const phoneRequired = z
  .string()
  .min(10, 'Enter a valid phone number (at least 10 digits)')
  .max(20, 'Phone must be at most 20 characters')

function schemaFor(requirePhone: boolean) {
  return z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    phone: requirePhone ? phoneRequired : phoneOptional,
  })
}

type ProfileForm = { name: string; phone: string }

const ROLE_LABEL = { PATIENT: 'Patient', DRIVER: 'Driver', ADMIN: 'Admin' } as const

/**
 * Account page body shared by patient, driver and admin. One full-width column
 * so every card lines up: photo, details, role extras, password, sign out.
 */
export function AccountProfile({
  subtitle,
  extra,
  badge,
  requirePhone = false,
}: {
  subtitle: string
  /** Role-specific cards, shown between Details and Change password. */
  extra?: React.ReactNode
  /** Small status chip beside the name (e.g. driver duty status). */
  badge?: React.ReactNode
  requirePhone?: boolean
}) {
  const me = useMe()
  const updateProfile = useUpdateProfile()
  const logout = useLogout()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(schemaFor(requirePhone)),
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="title-page text-ink">Profile</h1>
        <p className="mt-1 text-sm text-slate">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <AvatarUpload
            avatarUrl={me.data?.avatarUrl}
            name={me.data?.name}
            ready={!!me.data}
          />
          <div className="min-w-0 space-y-2 sm:text-right">
            <p className="truncate font-heading text-xl text-ink">
              {me.data?.name ?? '—'}
            </p>
            <p className="truncate text-sm text-slate">{me.data?.email ?? ''}</p>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {me.data && (
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                  {ROLE_LABEL[me.data.role]}
                </span>
              )}
              {badge}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-heading text-xl text-ink">Details</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
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
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty || updateProfile.isPending}
              className="h-10 px-6"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>

      {extra}

      <ChangePasswordCard />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="h-10 px-5"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {logout.isPending ? 'Logging out...' : 'Log out'}
        </Button>
      </div>
    </div>
  )
}
