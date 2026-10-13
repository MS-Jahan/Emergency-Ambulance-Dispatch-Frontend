'use client'

import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUI } from '@/lib/store'

/** Mirrors the persisted theme onto <html data-theme> on every route. */
export function ThemeSync() {
  const theme = useUI((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return null
}

/**
 * Header switch for light/dark. The icon follows the html[data-theme]
 * attribute through CSS only (set before first paint), so server and client
 * markup match and there is no icon flash.
 */
export function ThemeToggle() {
  const theme = useUI((s) => s.theme)
  const setTheme = useUI((s) => s.setTheme)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className="h-9 w-9 rounded-full text-ink hover:bg-brand-soft"
    >
      <Moon className="h-4 w-4 dark:hidden" aria-hidden />
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden />
    </Button>
  )
}
