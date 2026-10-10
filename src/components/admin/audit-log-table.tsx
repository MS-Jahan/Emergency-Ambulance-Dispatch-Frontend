'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ScrollText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { StatusBadge } from '@/components/shared/status-badge'
import { useAuditLogs } from '@/lib/hooks'
import type { Role } from '@/types/api'

const ACTOR_PILL: Record<Role, string> = {
  PATIENT: 'bg-oxygen/10 text-oxygen border-oxygen/30',
  DRIVER: 'bg-amber/10 text-amber-700 dark:text-amber border-amber/30',
  ADMIN: 'bg-ink/5 text-ink border-hairline',
}

/** Coarse human age for a timestamp; parent clock keeps render pure. */
function ageLabel(iso: string, now: number): string {
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AuditLogTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const kind = searchParams.get('actor') ?? 'all'
  const logs = useAuditLogs()

  // Parent-owned clock for relative times; interval callback is async so
  // the render stays pure.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const items = logs.data?.items ?? []
  const rows = kind === 'all' ? items : items.filter((l) => l.actor.role === kind)

  const setKind = (val: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (val === 'all') {
      sp.delete('actor')
    } else {
      sp.set('actor', val)
    }
    router.push(`/admin/resources?${sp.toString()}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <p className="text-sm text-slate">Audit log ({rows.length} shown)</p>
        <Select value={kind} onValueChange={(v) => setKind(v ?? 'all')}>
          <SelectTrigger className="w-32 bg-paper border-hairline" aria-label="Filter by actor role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            <SelectItem value="PATIENT">Patients</SelectItem>
            <SelectItem value="DRIVER">Drivers</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logs.isLoading ? (
        <ListSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-6 w-6 text-slate" />}
          title="No audit entries"
          description="Status changes land here as they happen."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((l) => (
            <li key={l.id}>
              <Card className="p-3 border border-hairline transition-colors hover:border-ink/30">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate w-16 flex-shrink-0">
                    {ageLabel(l.createdAt, now)}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ACTOR_PILL[l.actor.role]}`}
                  >
                    {l.actor.role}
                  </span>
                  <span className="text-xs font-medium text-ink truncate">
                    {l.actor.name}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs text-slate">
                  <span>
                    {l.fromStatus ? (
                      <>
                        moved request{' '}
                        <a
                          href={`/admin/dispatch`}
                          className="font-mono text-oxygen hover:underline"
                        >
                          {l.requestId.slice(0, 8)}
                        </a>{' '}
                        from <StatusBadge status={l.fromStatus} />
                      </>
                    ) : (
                      <>
                        created request{' '}
                        <a
                          href={`/admin/dispatch`}
                          className="font-mono text-oxygen hover:underline"
                        >
                          {l.requestId.slice(0, 8)}
                        </a>{' '}
                        as <StatusBadge status={l.toStatus} />
                      </>
                    )}
                  </span>
                </div>
                {l.note && (
                  <p className="mt-1 truncate text-xs text-slate italic">{l.note}</p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
