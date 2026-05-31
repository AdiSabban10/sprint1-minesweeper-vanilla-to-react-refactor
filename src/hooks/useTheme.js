import { useCallback, useEffect, useState } from 'react'

/**
 * Toggles dark mode on `document.body` via `.dark-mode` only
 * (legacy used both `.dark` on buttons and `.dark-mode` on body — unified in CSS).
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    return () => {
      document.body.classList.remove('dark-mode')
    }
  }, [])

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
