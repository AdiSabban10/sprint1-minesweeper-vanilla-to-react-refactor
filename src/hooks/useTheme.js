import { useCallback, useState } from 'react'

/** Toggles legacy dark mode on `document.body` (`.dark-mode`). */
export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      document.body.classList.toggle('dark-mode', next)
      return next
    })
  }, [])

  const darkModeLabel = isDark ? 'Un Dark' : 'Dark-Mode'

  return { isDark, toggleTheme, darkModeLabel }
}
