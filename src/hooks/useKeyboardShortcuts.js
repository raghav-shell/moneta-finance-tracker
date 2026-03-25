// hooks/useKeyboardShortcuts.js
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts({ onAddNew, onToggleTheme }) {
  const navigate = useNavigate()

  // Store callbacks in refs so the effect never needs to re-register
  const onAddNewRef      = useRef(onAddNew)
  const onToggleThemeRef = useRef(onToggleTheme)

  useEffect(() => { onAddNewRef.current      = onAddNew      }, [onAddNew])
  useEffect(() => { onToggleThemeRef.current = onToggleTheme }, [onToggleTheme])

  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in form fields
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      // Ignore modifier combos
      if (e.ctrlKey || e.metaKey || e.altKey) return

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          onAddNewRef.current?.()
          break
        case 'd':
          e.preventDefault()
          navigate('/dashboard')
          break
        case 't':
          e.preventDefault()
          navigate('/transactions')
          break
        case 'b':
          e.preventDefault()
          navigate('/budget')
          break
        case 'a':
          e.preventDefault()
          navigate('/analytics')
          break
        case 'h':
          e.preventDefault()
          navigate('/history')
          break
        case 'x':
          e.preventDefault()
          onToggleThemeRef.current?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate]) // only navigate is a stable dep — callbacks go through refs
}
