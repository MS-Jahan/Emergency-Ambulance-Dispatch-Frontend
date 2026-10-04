import { Badge } from '@/components/ui/badge'
import type { RequestPriority } from '@/types/api'

const PRIORITY_CONFIG: Record<
  RequestPriority,
  { label: string; className: string }
> = {
  CRITICAL: { label: 'Critical', className: 'bg-signal text-white border-signal' },
  HIGH: { label: 'High', className: 'bg-amber text-ink border-amber' },
  NORMAL: { label: 'Normal', className: 'bg-gauze text-slate border-hairline' },
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const config = PRIORITY_CONFIG[priority] ?? {
    label: priority,
    className: 'bg-gauze text-slate border-hairline',
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
