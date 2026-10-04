import { RoleShell } from '@/components/shell/role-shell'

// Admin is a command center: dark by default. The .dark class wrapper flips
// the brand tokens below this point regardless of the profile toggle.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark">
      <RoleShell variant="rail">{children}</RoleShell>
    </div>
  )
}
