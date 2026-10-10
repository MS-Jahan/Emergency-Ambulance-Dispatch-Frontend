'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/skeletons'
import { useAdminContactMessages, useUpdateContactMessageStatus } from '@/lib/hooks'
import type { ContactCategory, ContactStatus } from '@/types/api'

const STATUS_PILL: Record<ContactStatus, string> = {
  NEW: 'bg-amber/15 text-amber border-amber/30',
  READ: 'bg-ink/10 text-ink border-hairline',
  RESOLVED: 'bg-oxygen/15 text-oxygen border-oxygen/30',
}

const CATEGORY_LABEL: Record<ContactCategory, string> = {
  GENERAL: 'General',
  BILLING: 'Billing',
  DRIVER: 'Driver',
  HOSPITAL: 'Hospital',
  FEEDBACK: 'Feedback',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function ContactMessagesTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const statusFilter = searchParams.get('status') ?? 'all'
  const qFilter = searchParams.get('q') ?? ''

  const [searchInput, setSearchInput] = useState(qFilter)

  const messagesQuery = useAdminContactMessages(page, {
    status: statusFilter,
    q: qFilter,
  })

  const updateStatus = useUpdateContactMessageStatus()

  const setParam = (key: string, val: string | null) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('tab', 'messages')
    if (!val || val === 'all' || (key === 'page' && val === '1')) {
      sp.delete(key)
    } else {
      sp.set(key, val)
    }
    // Reset page if filtering
    if (key !== 'page') {
      sp.delete('page')
    }
    router.push(`/admin/resources?${sp.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setParam('q', searchInput.trim() || null)
  }

  const handleStatusChange = async (id: string, newStatus: ContactStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus })
      toast.success(`Message marked as ${newStatus.toLowerCase()}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const data = messagesQuery.data
  const items = data?.items ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="pl-9 bg-paper border-hairline text-ink"
          />
        </form>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => setParam('status', val ?? 'all')}
          >
            <SelectTrigger className="w-36 bg-paper border-hairline text-ink" aria-label="Filter by status">
              <SelectValue>
                {{
                  all: 'All statuses',
                  NEW: 'New',
                  READ: 'Read',
                  RESOLVED: 'Resolved',
                }[statusFilter] ?? statusFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {messagesQuery.isLoading ? (
        <ListSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-6 w-6 text-slate" />}
          title="No contact messages"
          description={
            statusFilter !== 'all' || qFilter
              ? 'No messages matched your current filters.'
              : 'Messages sent via the public contact form will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((msg) => (
            <Card
              key={msg.id}
              className="p-4 sm:p-5 border border-hairline bg-paper space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-ink">{msg.name}</span>
                  <a
                    href={`mailto:${encodeURIComponent(msg.email)}`}
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    {msg.email}
                  </a>
                  {msg.phone && (
                    <span className="text-xs text-slate">· {msg.phone}</span>
                  )}
                  <span className="rounded-full border border-hairline bg-gauze px-2 py-0.5 text-xs font-medium text-slate">
                    {CATEGORY_LABEL[msg.category] ?? msg.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate">
                    {formatDate(msg.createdAt)}
                  </span>
                  <Select
                    value={msg.status}
                    onValueChange={(val) => {
                      if (val) handleStatusChange(msg.id, val as ContactStatus)
                    }}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger
                      className={`h-7 text-xs border rounded-full px-2.5 font-semibold ${
                        STATUS_PILL[msg.status] ?? ''
                      }`}
                      aria-label="Change status"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="READ">Read</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl bg-gauze border border-hairline p-3 text-sm text-ink whitespace-pre-wrap break-words">
                {msg.message}
              </div>
            </Card>
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate">
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setParam('page', String(meta.page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setParam('page', String(meta.page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
