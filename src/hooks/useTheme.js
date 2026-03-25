// hooks/useTheme.js
import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('moneta_theme') || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    // Apply theme to <html> data attribute
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('moneta_theme', theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
