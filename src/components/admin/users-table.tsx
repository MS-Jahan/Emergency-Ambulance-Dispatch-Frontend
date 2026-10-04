'use client'

import { useState } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useAdminUsers, useCreateDriver, useUpdateUserRole } from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { Role } from '@/types/api'

const ROLES: Role[] = ['PATIENT', 'DRIVER', 'ADMIN']

function rolePill(role: Role) {
  if (role === 'ADMIN') return 'bg-ink text-paper border-ink'
  if (role === 'DRIVER') return 'bg-blue-100 text-blue-800 border-blue-200'
  return 'bg-gauze text-slate border-hairline'
}

export function UsersTable() {
  const [role, setRole] = useState<string>('all')
  const [q, setQ] = useState('')
  const users = useAdminUsers(1, {
    ...(role !== 'all' && { role }),
    ...(q.trim() && { q: q.trim() }),
  })
  const updateRole = useUpdateUserRole()
  const createDriver = useCreateDriver()

  const [addingDriver, setAddingDriver] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
  })

  const changeRole = async (id: string, next: Role) => {
    try {
      await updateRole.mutateAsync({ id, role: next })
      toast.success(`Role set to ${next.toLowerCase()}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Role change failed')
    }
  }

  const submitDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createDriver.mutateAsync(form)
      toast.success('Driver account created')
      setForm({ name: '', email: '', password: '', phone: '', licenseNumber: '' })
      setAddingDriver(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Create failed')
    }
  }

  const inputCls = 'mt-1 bg-paper border-hairline text-ink'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email"
              className="pl-8 w-56 bg-paper border-hairline text-ink"
            />
          </div>
          <Select value={role} onValueChange={(v) => setRole(v ?? 'all')}>
            <SelectTrigger className="w-36 bg-paper border-hairline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={() => setAddingDriver(true)}
          className="bg-ink text-paper hover:bg-slate-800"
        >
          <UserPlus className="h-4 w-4 mr-1" /> Create driver
        </Button>
      </div>

      {users.isLoading ? (
        <ListSkeleton rows={5} />
      ) : (users.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6 text-slate" />}
          title="No users match"
          description="Try a different search or role filter."
        />
      ) : (
        <Card className="border border-hairline overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-hairline">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data!.items.map((u) => (
                <TableRow key={u.id} className="border-hairline">
                  <TableCell className="font-medium text-ink">{u.name}</TableCell>
                  <TableCell className="text-slate">{u.email}</TableCell>
                  <TableCell className="text-slate">{u.phone ?? '—'}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => void changeRole(u.id, v as Role)}
                    >
                      <SelectTrigger
                        className={`w-28 h-7 rounded-full border text-[11px] font-medium ${rolePill(u.role)}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-slate">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={addingDriver} onOpenChange={setAddingDriver}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create driver account</DialogTitle>
            <DialogDescription>
              Password needs 8+ chars with a letter and a number
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitDriver} className="space-y-4">
            <div>
              <Label htmlFor="d-name" className="text-sm font-medium text-ink">
                Name
              </Label>
              <Input
                id="d-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="d-email" className="text-sm font-medium text-ink">
                Email
              </Label>
              <Input
                id="d-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="d-pass" className="text-sm font-medium text-ink">
                Password
              </Label>
              <Input
                id="d-pass"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="d-phone" className="text-sm font-medium text-ink">
                  Phone
                </Label>
                <Input
                  id="d-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+8801XXXXXXXXX"
                  className={inputCls}
                />
              </div>
              <div>
                <Label htmlFor="d-lic" className="text-sm font-medium text-ink">
                  License no.
                </Label>
                <Input
                  id="d-lic"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={
                createDriver.isPending ||
                !form.name.trim() ||
                !form.email.trim() ||
                form.password.length < 8 ||
                form.phone.trim().length < 6 ||
                form.licenseNumber.trim().length < 4
              }
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
