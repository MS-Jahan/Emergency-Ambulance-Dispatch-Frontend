import { Badge } from '@/components/ui/badge'
import type { RequestPriority } from '@/types/api'

const PRIORITY_CONFIG: Record<
  RequestPriority,
  { label: string; className: string }
> = {
  CRITICAL: { label: 'Critical', className: 'bg-signal text-white border-signal rounded-full font-extrabold' },
  HIGH: { label: 'High', className: 'bg-amber text-white border-amber rounded-full font-extrabold' },
  NORMAL: { label: 'Normal', className: 'bg-muted text-slate border-hairline rounded-full font-bold' },
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const config = PRIORITY_CONFIG[priority] ?? {
    label: priority,
    className: 'bg-muted text-slate border-hairline rounded-full font-bold',
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
