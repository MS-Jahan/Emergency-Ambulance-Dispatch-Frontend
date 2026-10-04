import { RoleShell } from '@/components/shell/role-shell'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleShell variant="rail">
      {children}
    </RoleShell>
  )
}
