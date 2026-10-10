import { RoleShell } from '@/components/shell/role-shell'

// Follows the theme the user picked (html[data-theme]); no forced wrapper.
export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleShell variant="minimal">{children}</RoleShell>
}
