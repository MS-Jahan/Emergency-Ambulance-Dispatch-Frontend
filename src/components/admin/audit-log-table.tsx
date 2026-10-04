'use client'

import { ClipboardList, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useAuditLogs } from '@/lib/hooks'
import type { RequestStatus } from '@/types/api'

function statusPill(status: RequestStatus) {
  if (status === 'CANCELLED') return 'bg-red-100 text-red-800 border-red-200'
  if (status === 'COMPLETED')
    return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (status === 'PENDING') return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-blue-100 text-blue-800 border-blue-200'
}

export function AuditLogTable() {
  const logs = useAuditLogs()

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate">
        Every status change, who made it, when
      </p>

      {logs.isLoading ? (
        <ListSkeleton rows={6} />
      ) : (logs.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6 text-slate" />}
          title="No audit entries"
          description="Status changes will appear here as they happen."
        />
      ) : (
        <Card className="border border-hairline overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-hairline">
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Transition</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Request</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.data!.items.map((log) => (
                <TableRow key={log.id} className="border-hairline">
                  <TableCell className="text-xs text-slate whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-ink">{log.actor.name}</span>
                    <span className="ml-1 text-xs text-slate lowercase">
                      ({log.actor.role.toLowerCase()})
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      {log.fromStatus ? (
                        <>
                          <span
                            className={`rounded-full border px-1.5 py-0.5 font-medium ${statusPill(log.fromStatus)}`}
                          >
                            {log.fromStatus.replaceAll('_', ' ').toLowerCase()}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate" />
                        </>
                      ) : (
                        <span className="text-slate">created →</span>
                      )}
                      <span
                        className={`rounded-full border px-1.5 py-0.5 font-medium ${statusPill(log.toStatus)}`}
                      >
                        {log.toStatus.replaceAll('_', ' ').toLowerCase()}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate max-w-48 truncate">
                    {log.note ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/requests/${log.requestId}`}
                      className="text-xs text-oxygen hover:underline"
                    >
                      {log.requestId.slice(0, 8)}…
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
