import { Card } from '@/components/ui/card'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="rounded-2xl p-10 border border-dashed border-hairline flex flex-col items-center justify-center text-center">
      {icon && <div className="text-3xl mb-3 text-slate">{icon}</div>}
      <p className="font-heading text-xl text-ink">{title}</p>
      {description && <p className="text-sm text-slate mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  )
}
