'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AmbulancesTable } from '@/components/admin/ambulances-table'
import { HospitalsTable } from '@/components/admin/hospitals-table'
import { UsersTable } from '@/components/admin/users-table'
import { AuditLogTable } from '@/components/admin/audit-log-table'
import { ContactMessagesTable } from '@/components/admin/contact-messages-table'
import { ListSkeleton } from '@/components/shared/skeletons'

const TAB =
  'h-9 flex-none rounded-full px-4 text-slate hover:text-ink data-active:bg-brand data-active:text-brand-foreground data-active:shadow-none'

function ResourcesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') ?? 'ambulances'

  const onTabChange = (val: string | null) => {
    if (!val) return
    const sp = new URLSearchParams()
    sp.set('tab', val)
    router.push(`/admin/resources?${sp.toString()}`)
  }

  return (
    <Tabs value={currentTab} onValueChange={onTabChange}>
      <TabsList className="mb-4 h-auto flex-wrap gap-1 rounded-full bg-paper p-1 ring-1 ring-hairline">
        <TabsTrigger value="ambulances" className={TAB}>Ambulances</TabsTrigger>
        <TabsTrigger value="hospitals" className={TAB}>Hospitals</TabsTrigger>
        <TabsTrigger value="users" className={TAB}>Users</TabsTrigger>
        <TabsTrigger value="messages" className={TAB}>Messages</TabsTrigger>
        <TabsTrigger value="audit" className={TAB}>Audit logs</TabsTrigger>
      </TabsList>
      <TabsContent value="ambulances">
        <AmbulancesTable />
      </TabsContent>
      <TabsContent value="hospitals">
        <HospitalsTable />
      </TabsContent>
      <TabsContent value="users">
        <UsersTable />
      </TabsContent>
      <TabsContent value="messages">
        <ContactMessagesTable />
      </TabsContent>
      <TabsContent value="audit">
        <AuditLogTable />
      </TabsContent>
    </Tabs>
  )
}

export default function AdminResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Resources</h1>
        <p className="mt-1 text-sm text-slate">
          Ambulances, hospitals, users, contact messages and the audit trail
        </p>
      </div>
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <ResourcesContent />
      </Suspense>
    </div>
  )
}
