'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/shared/field-error'
import { PasswordStrength } from '@/components/auth/password-strength'
import { useChangePassword, useLogout } from '@/lib/hooks'
import { ApiError } from '@/lib/api'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain a letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export function ChangePasswordCard() {
  const changePassword = useChangePassword()
  const logout = useLogout()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPassword = watch('newPassword')

  const onSubmit = async (values: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password updated successfully. Please sign in again.')
      reset()
      logout.mutate()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          err.errors.forEach((e) => {
            if (
              e.field &&
              ['currentPassword', 'newPassword', 'confirmPassword'].includes(e.field)
            ) {
              setError(e.field as keyof ChangePasswordFormData, { message: e.message })
            }
          })
        } else {
          toast.error(err.message || 'Failed to update password')
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.')
      }
    }
  }

  const inputCls = 'mt-1 h-11 border-hairline px-4 text-ink bg-gauze'

  return (
    <Card className="p-6 border-hairline bg-paper space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-brand" />
        <h3 className="font-heading text-lg text-ink">Change password</h3>
      </div>
      <p className="text-xs text-slate">
        Update your password to keep your account secure. Changing your password will end all active sessions.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="currentPassword" className="text-sm font-medium text-ink">
            Current password
          </Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
            className={inputCls}
          />
          {errors.currentPassword && (
            <FieldError>{errors.currentPassword.message}</FieldError>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword" className="text-sm font-medium text-ink">
            New password
          </Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            className={inputCls}
          />
          <PasswordStrength password={newPassword} />
          {errors.newPassword && (
            <FieldError>{errors.newPassword.message}</FieldError>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-ink">
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={inputCls}
          />
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}
        </div>

        <Button
          type="submit"
          disabled={changePassword.isPending}
          className="w-full h-11"
        >
          {changePassword.isPending ? 'Updating password...' : 'Update password'}
        </Button>
      </form>
    </Card>
  )
}
