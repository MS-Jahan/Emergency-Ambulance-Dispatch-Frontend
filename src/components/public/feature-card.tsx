import { cn } from '@/lib/utils'

type AccentColor = 'signal' | 'oxygen' | 'amber' | 'ink'

const ACCENT_CLASSES: Record<AccentColor, string> = {
  signal: 'border-l-signal',
  oxygen: 'border-l-oxygen',
  amber: 'border-l-amber',
  ink: 'border-l-ink',
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor?: AccentColor
  className?: string
}

/**
 * Feature card with a colored left accent. 1px hairline border, no shadow.
 */
export function FeatureCard({
  icon,
  title,
  description,
  accentColor = 'oxygen',
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'bg-paper border border-hairline border-l-4 rounded-lg p-5 sm:p-6 space-y-3',
        ACCENT_CLASSES[accentColor],
        className,
      )}
    >
      <div className="text-oxygen">{icon}</div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="text-sm text-slate">{description}</p>
    </div>
  )
}
