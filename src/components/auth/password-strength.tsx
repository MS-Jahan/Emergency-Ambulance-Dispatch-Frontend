import { cn } from '@/lib/utils'

type Strength = 'weak' | 'ok' | 'strong' | null

const SEGMENTS: { key: Exclude<Strength, null>; label: string }[] = [
  { key: 'weak', label: 'Weak' },
  { key: 'ok', label: 'Ok' },
  { key: 'strong', label: 'Strong' },
]

const SEGMENT_COLOR: Record<Exclude<Strength, null>, string> = {
  weak: 'bg-signal',
  ok: 'bg-amber',
  strong: 'bg-oxygen',
}

function score(password: string): Strength {
  if (!password) return null
  let s = 0
  if (password.length >= 8) s += 1
  if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) s += 1
  if (password.length >= 12 || /[^a-zA-Z0-9]/.test(password)) s += 1
  if (s <= 1) return 'weak'
  if (s === 2) return 'ok'
  return 'strong'
}

/**
 * Color-coded password strength meter: 3 segments (weak / ok / strong).
 */
export function PasswordStrength({ password }: { password: string }) {
  const current = score(password)
  if (!current) return null

  const activeIndex = SEGMENTS.findIndex((seg) => seg.key === current)

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {SEGMENTS.map((seg, i) => (
          <div
            key={seg.key}
            className={cn(
              'h-2 flex-1 rounded-full bg-hairline',
              i <= activeIndex && SEGMENT_COLOR[current],
            )}
          />
        ))}
      </div>
      <p className="text-xs text-slate">
        Password strength: <span className="font-medium text-ink">{SEGMENTS[activeIndex].label}</span>
      </p>
    </div>
  )
}
