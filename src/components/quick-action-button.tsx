'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionButtonProps {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  /** primary = signal red (emergency actions only); brand = ordinary next step. */
  variant?: 'primary' | 'brand' | 'outline'
  className?: string
}

/**
 * Big full-width call-to-action (56–64px) for the single most important
 * action on a screen — "Request now" on the patient dashboard.
 */
export function QuickActionButton({
  label,
  icon,
  onClick,
  loading,
  disabled,
  variant = 'primary',
  className,
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-lg font-extrabold transition-all sm:h-16',
        'active:scale-[0.99]',
        variant === 'primary' &&
          'bg-signal text-white shadow-sm hover:bg-signal/90',
        variant === 'brand' &&
          'bg-brand text-brand-foreground shadow-sm hover:bg-brand/90',
        variant === 'outline' &&
          'border-2 border-ink bg-transparent text-ink hover:bg-ink/5',
        (disabled || loading) && 'cursor-not-allowed opacity-60 active:scale-100',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        icon
      )}
      {label}
    </button>
  )
}
