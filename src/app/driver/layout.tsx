import { RoleShell } from '@/components/shell/role-shell'

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleShell variant="minimal">
      {children}
    </RoleShell>
  )
}
