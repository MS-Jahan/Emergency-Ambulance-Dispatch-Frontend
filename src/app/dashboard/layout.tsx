import { RoleShell } from '@/components/shell/role-shell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleShell variant="sidebar">
      {children}
    </RoleShell>
  )
}
