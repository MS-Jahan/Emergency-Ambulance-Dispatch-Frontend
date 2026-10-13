import { cn } from '@/lib/utils'

export function initialsOf(name: string | undefined): string {
  const letters = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
  return letters || '?'
}

/** Round avatar: the saved photo (a data URL from the API) or initials. */
export function UserAvatar({
  src,
  name,
  className,
}: {
  src?: string | null
  name?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-heading text-brand-foreground',
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL from the API, not optimisable
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}
