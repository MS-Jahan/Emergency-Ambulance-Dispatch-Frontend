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
  amber: 'bg-amber/10 text-amber-600',
  ink: 'bg-ink/5 text-ink',
}

export function StatCard({ label, value, hint, icon, accent = 'ink' }: StatCardProps) {
  return (
    <Card className="p-5 border border-hairline">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate">{label}</p>
          <p className="text-2xl font-bold text-ink mt-1 tabular-nums">{value}</p>
          {hint && <p className="text-xs text-slate mt-1">{hint}</p>}
        </div>
        {icon && (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg ${ACCENT_CLASS[accent]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
