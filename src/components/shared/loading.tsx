import { cn } from '@/lib/utils'

/** Ring spinner. Announces itself to screen readers; hidden motion under reduced-motion. */
export function Spinner({
  className,
  label = 'Loading',
}: {
  className?: string
  label?: string
}) {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        aria-hidden
        className={cn(
          'h-4 w-4 animate-spin rounded-full border-2 border-hairline border-t-brand motion-reduce:animate-none',
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/** Spinner plus a short caption, for inline waits. */
export function InlineLoading({
  label = 'Loading…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <p className={cn('flex items-center gap-2 text-sm text-slate', className)}>
      <Spinner label={label} />
      <span aria-hidden>{label}</span>
    </p>
  )
}

const BAR_HEIGHTS = ['45%', '70%', '55%', '85%', '60%', '75%', '50%']

/** Placeholder for a chart: pulsing ghost bars with a centred spinner caption. */
export function ChartSkeleton({
  className,
  label = 'Loading chart…',
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={cn('relative flex h-40 items-end gap-2', className)}
      aria-busy="true"
    >
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          aria-hidden
          style={{ height: h, animationDelay: `${i * 90}ms` }}
          className="flex-1 animate-pulse rounded-t-lg bg-muted"
        />
      ))}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center gap-2 rounded-full bg-paper/90 px-3 py-1.5 text-sm text-slate shadow-sm ring-1 ring-hairline">
          <Spinner label={label} />
          <span aria-hidden>{label}</span>
        </span>
      </span>
    </div>
  )
}
