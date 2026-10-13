'use client'

import { useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAvatars } from '@/lib/store'
import { UserAvatar } from './user-avatar'

const MAX_BYTES = 5 * 1024 * 1024
const SIZE = 256

/** Centre-crop to a square and re-encode small so it fits in localStorage. */
async function toSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE,
  )
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function AvatarUpload({
  userId,
  name,
}: {
  userId?: string
  name?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const hasPhoto = useAvatars((s) => (userId ? !!s.byUser[userId] : false))
  const setAvatar = useAvatars((s) => s.setAvatar)
  const clearAvatar = useAvatars((s) => s.clearAvatar)

  const onFile = async (file: File | undefined) => {
    if (!file || !userId) return
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file (JPG, PNG or WebP)')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('Image is too large. Use one under 5 MB.')
      return
    }
    setBusy(true)
    try {
      setAvatar(userId, await toSquareDataUrl(file))
      toast.success('Profile photo updated')
    } catch {
      toast.error('Could not read that image. Try another one.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar
          userId={userId}
          name={name}
          className="h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!userId || busy}
          aria-label="Upload profile photo"
          className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-paper bg-brand text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" aria-hidden />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={!userId || busy}
          >
            {busy ? 'Processing...' : hasPhoto ? 'Change photo' : 'Upload photo'}
          </Button>
          {hasPhoto && userId && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => clearAvatar(userId)}
              className="text-signal hover:bg-signal/10"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-slate">
          JPG, PNG or WebP up to 5 MB. Saved on this device.
        </p>
      </div>
    </div>
  )
}
