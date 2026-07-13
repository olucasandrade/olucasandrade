'use client'

import { useEffect, useState } from 'react'

/**
 * Scenes need dark/light to modulate opacity (dark = 1.0x, light = 0.45x).
 *
 * `components/theme/ThemeContext.tsx` only exposes `theme` ('light' | 'dark' | 'system')
 * and does not expose the resolved boolean — it applies the resolved theme by toggling
 * the `dark` class on `document.documentElement`. That class toggle is the actual
 * mechanism the rest of the site (Tailwind `dark:` variants) relies on, so scenes read
 * it directly via a MutationObserver rather than duplicating ThemeContext's system-preference
 * resolution logic.
 */
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    setIsDark(root.classList.contains('dark'))

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
