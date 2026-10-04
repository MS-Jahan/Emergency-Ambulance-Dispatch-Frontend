import { RoleShell } from '@/components/shell/role-shell'
import { adminNav } from '@/components/shell/nav-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleShell nav={adminNav} variant="rail">
      {children}
    </RoleShell>
  )
}
