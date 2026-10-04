'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/store'
import { useMe } from '@/lib/hooks'

/**
 * Restores the session on app load: validates the HTTP-only cookie against
 * GET /users/me, syncs the result into the auth store, and toasts once when
 * a persisted session turns out to be expired.
 */
export function SessionBootstrap() {
  const user = useAuth((s) => s.user)
  const setUser = useAuth((s) => s.setUser)
  const logout = useAuth((s) => s.logout)

  // Persisted store user could be stale (localStorage survives server-side
  // logout); /users/me is the source of truth. Queries run on client mount.
  const me = useMe()

  useEffect(() => {
    if (me.data) setUser(me.data)
  }, [me.data, setUser])

  useEffect(() => {
    if (!(me.error instanceof ApiError)) return
    if (me.error.status === 401 && user) {
      logout()
      toast.error('Session expired. Please sign in again.')
    }
  }, [me.error, user, logout])

  return null
}
