import { cn } from '@/lib/utils'

type AccentColor = 'signal' | 'oxygen' | 'amber' | 'ink'

const ACCENT_CLASSES: Record<AccentColor, string> = {
  signal: 'text-signal',
  oxygen: 'text-oxygen',
  amber: 'text-amber',
  ink: 'text-brand',
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor?: AccentColor
  className?: string
}

/**
 * Rounded feature card with a tinted icon chip.
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
        'h-full bg-paper border border-hairline rounded-2xl p-5 sm:p-6 space-y-3',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft',
          ACCENT_CLASSES[accentColor],
        )}
      >
        {icon}
      </div>
      <h3 className="text-lg text-ink">{title}</h3>
      <p className="text-sm text-slate">{description}</p>
    </div>
  )
}
