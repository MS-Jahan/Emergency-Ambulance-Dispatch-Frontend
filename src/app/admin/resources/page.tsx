'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AmbulancesTable } from '@/components/admin/ambulances-table'
import { HospitalsTable } from '@/components/admin/hospitals-table'
import { UsersTable } from '@/components/admin/users-table'
import { AuditLogTable } from '@/components/admin/audit-log-table'
import { ListSkeleton } from '@/components/shared/skeletons'

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
      <TabsList className="mb-4 flex-wrap h-auto">
        <TabsTrigger value="ambulances">Ambulances</TabsTrigger>
        <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="audit">Audit logs</TabsTrigger>
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
      <TabsContent value="audit">
        <AuditLogTable />
      </TabsContent>
    </Tabs>
  )
}

export default function AdminResourcesPage() {
  return (
    <div className="min-h-screen bg-gauze">
      <header className="border-b border-hairline bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-slate hover:text-ink"
            >
              <ArrowLeft className="h-3 w-3" /> Admin
            </Link>
            <h1 className="text-lg font-semibold text-ink">Resources</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<ListSkeleton rows={6} />}>
          <ResourcesContent />
        </Suspense>
      </main>
    </div>
  )
}
