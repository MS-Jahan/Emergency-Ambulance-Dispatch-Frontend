'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useAdminUsers, useCreateDriver, useUpdateUserRole } from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { AdminUser, Role } from '@/types/api'

const ROLES: Role[] = ['PATIENT', 'DRIVER', 'ADMIN']

const createDriverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(6, 'Phone must be at least 6 characters'),
  licenseNumber: z.string().min(4, 'License number must be at least 4 characters'),
})

type CreateDriverFormData = z.infer<typeof createDriverSchema>

// Brand palette per role.
const ROLE_PILL: Record<Role, string> = {
  PATIENT: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  DRIVER: 'bg-amber/10 text-amber-700 dark:text-amber border-amber/30',
  ADMIN: 'bg-ink/5 text-ink border-hairline',
}

function joinedLabel(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function CreateDriverDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createDriver = useCreateDriver()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDriverFormData>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      licenseNumber: '',
    },
  })

  const onSubmit = async (data: CreateDriverFormData) => {
    try {
      await createDriver.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone.trim(),
        licenseNumber: data.licenseNumber.trim(),
      })
      toast.success('Driver created')
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Create failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create driver</DialogTitle>
          <DialogDescription>
            Adds a verified driver account directly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div>
            <Label htmlFor="d-name" className="text-sm font-medium text-ink">
              Name
            </Label>
            <Input
              id="d-name"
              placeholder="Full name"
              {...register('name')}
              className="mt-1 bg-paper border-hairline text-ink"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-signal">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="d-email" className="text-sm font-medium text-ink">
              Email
            </Label>
            <Input
              id="d-email"
              type="email"
              placeholder="driver@example.com"
              {...register('email')}
              className="mt-1 bg-paper border-hairline text-ink"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-signal">{errors.email.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="d-pass" className="text-sm font-medium text-ink">
                Password (8+)
              </Label>
              <Input
                id="d-pass"
                type="password"
                {...register('password')}
                className="mt-1 bg-paper border-hairline text-ink"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-signal">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="d-phone" className="text-sm font-medium text-ink">
                Phone
              </Label>
              <Input
                id="d-phone"
                placeholder="+880..."
                {...register('phone')}
                className="mt-1 bg-paper border-hairline text-ink"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-signal">{errors.phone.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="d-license" className="text-sm font-medium text-ink">
              License number
            </Label>
            <Input
              id="d-license"
              placeholder="DL-XXXX"
              {...register('licenseNumber')}
              className="mt-1 bg-paper border-hairline text-ink"
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-xs text-signal">{errors.licenseNumber.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={createDriver.isPending}
            className="w-full bg-ink text-paper hover:bg-ink/90"
          >
            {createDriver.isPending ? 'Creating...' : 'Create driver'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function UsersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const roleFilter = searchParams.get('role') ?? 'all'

  const [creatingDriver, setCreatingDriver] = useState(false)

  const users = useAdminUsers(1, {
    q: q.trim() || undefined,
    role: roleFilter === 'all' ? undefined : (roleFilter as Role),
  })
  const roleChange = useUpdateUserRole()

  const setRole = (r: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (r === 'all') {
      sp.delete('role')
    } else {
      sp.set('role', r)
    }
    router.push(`/admin/resources?${sp.toString()}`)
  }

  const setQuery = (query: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      sp.set('q', query)
    } else {
      sp.delete('q')
    }
    router.push(`/admin/resources?${sp.toString()}`)
  }

  const items = users.data?.items ?? []
  const driverCount = users.data?.meta.total ?? items.length

  const changeRole = async (u: AdminUser, role: Role) => {
    try {
      await roleChange.mutateAsync({ id: u.id, role })
      toast.success(`${u.name} is now a ${role.toLowerCase()}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Role change failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <p className="text-sm text-slate">Users ({driverCount})</p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or email"
              aria-label="Search users"
              className="h-9 w-44 pl-8 bg-paper border-hairline text-ink"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRole(v ?? 'all')}>
            <SelectTrigger className="w-32 bg-paper border-hairline" aria-label="Filter by role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r[0] + r.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => setCreatingDriver(true)}
            className="bg-signal text-white hover:bg-signal/90"
          >
            Create driver
          </Button>
        </div>
      </div>

      {users.isLoading ? (
        <ListSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6 text-slate" />}
          title="No users found"
          description={
            q ? `Nothing matches "${q}".` : 'Users appear here as they sign up.'
          }
        />
      ) : (
        <ul className="space-y-2">
          {items.map((u) => (
            <li key={u.id}>
              <Card className="flex items-center justify-between gap-3 p-3 border border-hairline transition-colors hover:border-ink/30">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{u.name}</p>
                  <p className="truncate text-xs text-slate">
                    {u.email}
                    <span className="mx-1.5">·</span>joined{' '}
                    {joinedLabel(u.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`hidden sm:inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${ROLE_PILL[u.role]}`}
                  >
                    {u.role}
                  </span>
                  <Select
                    value={u.role}
                    onValueChange={(v) => v && void changeRole(u, v as Role)}
                    disabled={roleChange.isPending}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-28"
                      aria-label={`Change role for ${u.name}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r[0] + r.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <CreateDriverDialog
        open={creatingDriver}
        onOpenChange={setCreatingDriver}
      />
    </div>
  )
}
