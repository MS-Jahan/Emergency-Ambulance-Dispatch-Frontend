import { RoleShell } from '@/components/shell/role-shell'
import { patientNav } from '@/components/shell/nav-config'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleShell nav={patientNav} variant="sidebar">
      {children}
    </RoleShell>
  )
}
