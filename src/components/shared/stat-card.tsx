import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: React.ReactNode
  accent?: 'signal' | 'oxygen' | 'amber' | 'ink'
}

const ACCENT_CLASS: Record<NonNullable<StatCardProps['accent']>, string> = {
  signal: 'bg-signal/10 text-signal',
  oxygen: 'bg-oxygen/10 text-oxygen',
  amber: 'bg-amber/10 text-amber',
  ink: 'bg-brand-soft text-brand',
}

export function StatCard({ label, value, hint, icon, accent = 'ink' }: StatCardProps) {
  return (
    <Card className="rounded-2xl border border-hairline p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-3xl text-ink tabular-nums">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate">{label}</p>
          {hint && <p className="text-xs text-slate mt-1">{hint}</p>}
        </div>
        {icon && (
          <div
            aria-hidden
            className={`flex items-center justify-center w-10 h-10 rounded-full ${ACCENT_CLASS[accent]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
