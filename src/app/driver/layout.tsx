import { RoleShell } from '@/components/shell/role-shell'

// Driver console is used at night on the road: dark by default.
export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark">
      <RoleShell variant="minimal">{children}</RoleShell>
    </div>
  )
}
