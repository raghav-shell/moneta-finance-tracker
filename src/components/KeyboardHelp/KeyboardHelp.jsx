import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine, RiKeyboardLine } from 'react-icons/ri'

const shortcuts = [
  { group: 'Navigation', items: [
    { key: 'D', label: 'Go to Dashboard' },
    { key: 'T', label: 'Go to Transactions' },
    { key: 'B', label: 'Go to Budget' },
    { key: 'A', label: 'Go to Analytics' },
    { key: 'H', label: 'Go to History' },
  ]},
  { group: 'Actions', items: [
    { key: 'N', label: 'Quick add transaction' },
    { key: 'X', label: 'Toggle dark / light mode' },
    { key: '?', label: 'Show keyboard shortcuts' },
    { key: 'Esc', label: 'Close modal / overlay' },
  ]},
]

export default function KeyboardHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (e.key === '?') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        className="kbd-fab"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          backdropFilter: 'blur(16px)',
          color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          zIndex: 200, transition: 'all 0.18s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'rgba(0,113,227,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-glass)' }}
      >
        <RiKeyboardLine />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(14px)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              style={{ background: 'var(--bg-card)', backdropFilter: 'blur(32px)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-glass)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '1rem' }}>
                    <RiKeyboardLine />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: 'var(--bg-input)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>
                  <RiCloseLine />
                </button>
              </div>

              {shortcuts.map((group, gi) => (
                <div key={group.group} style={{ marginBottom: gi < shortcuts.length - 1 ? '1.25rem' : 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '0.6rem' }}>
                    {group.group}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {group.items.map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                        <kbd className="kbd-hint" style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>{item.key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--accent-lighter)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-light)', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Shortcuts are disabled while typing in form fields
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media (max-width: 960px) { .kbd-fab { display: none !important; } }`}</style>
    </>
  )
}
