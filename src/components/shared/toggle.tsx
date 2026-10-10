import { cn } from '@/lib/utils'

/** Small toggle switch (no shadcn switch installed; hand-rolled, same contract). */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 flex-shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        checked ? 'bg-brand' : 'border-2 border-slate bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-6 w-6 rounded-full shadow transition-transform',
          checked ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-slate',
        )}
      />
    </button>
  )
}
