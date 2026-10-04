'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AmbulancesTable } from '@/components/admin/ambulances-table'
import { HospitalsTable } from '@/components/admin/hospitals-table'
import { UsersTable } from '@/components/admin/users-table'
import { AuditLogTable } from '@/components/admin/audit-log-table'

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
        <Tabs defaultValue="ambulances">
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
      </main>
    </div>
  )
}
