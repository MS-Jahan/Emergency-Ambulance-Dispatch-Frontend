'use client'

import { useAvatars } from '@/lib/store'
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

/** Round avatar: the user's photo when one is saved on this device, else initials. */
export function UserAvatar({
  userId,
  name,
  className,
}: {
  userId?: string
  name?: string
  className?: string
}) {
  const photo = useAvatars((s) => (userId ? s.byUser[userId] : undefined))

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-heading text-brand-foreground',
        className,
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- local data URL, not optimisable
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}
