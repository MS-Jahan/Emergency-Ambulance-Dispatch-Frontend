'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useMe, useUpdateProfile } from '@/lib/hooks'
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

export default function ProfilePage() {
  const me = useMe()
  const updateProfile = useUpdateProfile()

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
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Profile</h1>
        <p className="text-sm text-slate mt-1">Your account details</p>
      </div>

      <Card className="p-6 border border-hairline space-y-5">
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-slate">
            Email
          </Label>
          <p className="text-sm text-ink mt-1">{me.data?.email ?? '—'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-ink">
              Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1 bg-paper border-hairline text-ink"
            />
            {errors.name && (
              <p className="text-xs text-signal mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-ink">
              Phone
            </Label>
            <Input
              id="phone"
              placeholder="+8801XXXXXXXXX"
              {...register('phone')}
              className="mt-1 bg-paper border-hairline text-ink"
            />
            {errors.phone && (
              <p className="text-xs text-signal mt-1">{errors.phone.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="bg-ink text-paper hover:bg-slate-800"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
