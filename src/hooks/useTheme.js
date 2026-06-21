import { useCallback, useEffect, useState } from 'react'
import { CACHE_KEYS } from '../config/constants'

/**
 * Dark/light theme. Dark is the default; the inline script in index.html
 * applies the persisted choice before first paint to avoid a flash.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  // Sync the DOM class and persistence outside the updater — side effects in
  // a setState updater run twice under StrictMode and would cancel out.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(CACHE_KEYS.theme, theme)
    } catch {
      /* persistence unavailable — theme still applies for this session */
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
