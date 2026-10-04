'use client'

import { useState } from 'react'
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

// Brand palette per role.
const ROLE_PILL: Record<Role, string> = {
  PATIENT: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  DRIVER: 'bg-amber/10 text-amber-700 border-amber/30',
  ADMIN: 'bg-ink/5 text-ink border-hairline',
}

function joinedLabel(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function UsersTable() {
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [creatingDriver, setCreatingDriver] = useState(false)

  const users = useAdminUsers(1, { q: q.trim() || undefined, role: roleFilter === 'all' ? undefined : (roleFilter as Role) })
  const roleChange = useUpdateUserRole()
  const createDriver = useCreateDriver()

  const [driverName, setDriverName] = useState('')
  const [driverEmail, setDriverEmail] = useState('')
  const [driverPassword, setDriverPassword] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverLicense, setDriverLicense] = useState('')

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

  const doCreateDriver = async () => {
    try {
      await createDriver.mutateAsync({
        name: driverName.trim(),
        email: driverEmail.trim(),
        password: driverPassword,
        phone: driverPhone.trim(),
        licenseNumber: driverLicense.trim(),
      })
      toast.success('Driver created')
      setCreatingDriver(false)
      setDriverName('')
      setDriverEmail('')
      setDriverPassword('')
      setDriverPhone('')
      setDriverLicense('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Create failed')
    }
  }

  const driverFormValid =
    driverName.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(driverEmail.trim()) &&
    driverPassword.length >= 8 &&
    driverPhone.trim().length >= 6 &&
    driverLicense.trim().length >= 4

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
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or email"
              aria-label="Search users"
              className="h-9 w-44 pl-8 bg-paper border-hairline text-ink"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? 'all')}>
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

      <Dialog open={creatingDriver} onOpenChange={setCreatingDriver}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create driver</DialogTitle>
            <DialogDescription>
              Adds a verified driver account directly.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (driverFormValid) void doCreateDriver()
            }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="d-name" className="text-sm font-medium text-ink">
                Name
              </Label>
              <Input
                id="d-name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Full name"
                className="mt-1 bg-paper border-hairline text-ink"
              />
            </div>
            <div>
              <Label htmlFor="d-email" className="text-sm font-medium text-ink">
                Email
              </Label>
              <Input
                id="d-email"
                type="email"
                value={driverEmail}
                onChange={(e) => setDriverEmail(e.target.value)}
                placeholder="driver@example.com"
                className="mt-1 bg-paper border-hairline text-ink"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="d-pass" className="text-sm font-medium text-ink">
                  Password (8+)
                </Label>
                <Input
                  id="d-pass"
                  type="password"
                  value={driverPassword}
                  onChange={(e) => setDriverPassword(e.target.value)}
                  className="mt-1 bg-paper border-hairline text-ink"
                />
              </div>
              <div>
                <Label htmlFor="d-phone" className="text-sm font-medium text-ink">
                  Phone
                </Label>
                <Input
                  id="d-phone"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+880..."
                  className="mt-1 bg-paper border-hairline text-ink"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="d-license" className="text-sm font-medium text-ink">
                License number
              </Label>
              <Input
                id="d-license"
                value={driverLicense}
                onChange={(e) => setDriverLicense(e.target.value)}
                placeholder="DL-XXXX"
                className="mt-1 bg-paper border-hairline text-ink"
              />
            </div>
            <Button
              type="submit"
              disabled={createDriver.isPending || !driverFormValid}
              className="w-full bg-ink text-paper hover:bg-slate-800"
            >
              {createDriver.isPending ? 'Creating...' : 'Create driver'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
