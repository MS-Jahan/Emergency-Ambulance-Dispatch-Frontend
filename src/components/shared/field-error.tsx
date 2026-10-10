import { AlertCircle } from 'lucide-react'

/**
 * Inline validation message. Red icon + ink text so the message keeps AA
 * contrast in both themes (signal red on navy is below 4.5:1 as small text).
 */
export function FieldError({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-xs font-medium text-ink">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-signal" aria-hidden />
      <span>{children}</span>
    </p>
  )
}
