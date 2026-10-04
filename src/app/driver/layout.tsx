import { RoleShell } from '@/components/shell/role-shell'
import { driverNav } from '@/components/shell/nav-config'

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleShell nav={driverNav} variant="minimal">
      {children}
    </RoleShell>
  )
}
