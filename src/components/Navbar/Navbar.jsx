import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiDashboardLine, RiExchangeDollarLine, RiAddCircleLine,
  RiPieChartLine, RiBarChartBoxLine, RiMenuLine, RiCloseLine,
  RiSparklingLine, RiSunLine, RiMoonLine, RiTimeLine,
} from 'react-icons/ri'

const navItems = [
  { path: '/dashboard',        label: 'Dashboard',    icon: RiDashboardLine,      group: 'Overview', shortcut: 'D' },
  { path: '/transactions',     label: 'Transactions', icon: RiExchangeDollarLine, group: 'Manage',   shortcut: 'T' },
  { path: '/transactions/new', label: 'Add Entry',    icon: RiAddCircleLine,      group: 'Manage',   shortcut: 'N' },
  { path: '/budget',           label: 'Budget',       icon: RiPieChartLine,       group: 'Insights', shortcut: 'B' },
  { path: '/analytics',        label: 'Analytics',    icon: RiBarChartBoxLine,    group: 'Insights', shortcut: 'A' },
  { path: '/history',          label: 'History',      icon: RiTimeLine,           group: 'Insights', shortcut: 'H' },
]

const groups = ['Overview', 'Manage', 'Insights']

function NavItem({ item, onClose }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/transactions'}
      onClick={onClose}
      style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
    >
      {({ isActive }) => (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.58rem 0.875rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem',
          fontWeight: isActive ? 600 : 450,
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          background: isActive
            ? 'linear-gradient(135deg, rgba(0,113,227,0.09), rgba(0,113,227,0.04))'
            : 'transparent',
          border: isActive ? '1px solid rgba(0,113,227,0.12)' : '1px solid transparent',
          transition: 'all 0.18s ease',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Active accent bar */}
          {isActive && (
            <div style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%',
              width: 3, borderRadius: '0 3px 3px 0',
              background: 'linear-gradient(180deg, var(--accent), #42A5FF)',
              boxShadow: '0 0 8px rgba(0,113,227,0.5)',
            }} />
          )}

          {/* Icon */}
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.95rem',
            background: isActive
              ? 'linear-gradient(135deg, rgba(0,113,227,0.15), rgba(0,113,227,0.08))'
              : 'var(--bg-input)',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all 0.18s ease', flexShrink: 0,
            boxShadow: isActive ? '0 2px 8px rgba(0,113,227,0.2)' : 'none',
          }}>
            <item.icon />
          </div>

          <span style={{ flex: 1 }}>{item.label}</span>

          {/* Keyboard shortcut hint */}
          <span className="kbd-hint" style={{ opacity: isActive ? 0.7 : 0.4 }}>{item.shortcut}</span>
        </div>
      )}
    </NavLink>
  )
}

function ThemeToggle({ theme, toggleTheme }) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode (X)`}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        width: '100%',
        padding: '0.55rem 0.875rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        background: 'var(--bg-input)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.82rem', fontWeight: 500,
        fontFamily: 'var(--font-body)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-hover)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-input)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {/* Animated toggle track */}
      <div style={{
        width: 36, height: 20, borderRadius: 99,
        background: isDark
          ? 'linear-gradient(135deg, #1a1a3e, #2d2d5e)'
          : 'linear-gradient(135deg, #e8f4ff, #b3d4ff)',
        border: `1px solid ${isDark ? 'rgba(120,120,200,0.3)' : 'rgba(0,113,227,0.25)'}`,
        position: 'relative', flexShrink: 0,
        transition: 'all 0.3s ease',
      }}>
        <motion.div
          animate={{ x: isDark ? 17 : 2 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'absolute', top: 2,
            width: 14, height: 14, borderRadius: '50%',
            background: isDark ? '#a0a0ff' : '#0071E3',
            boxShadow: isDark ? '0 0 6px rgba(160,160,255,0.6)' : '0 0 6px rgba(0,113,227,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', color: 'white',
          }}
        >
          {isDark ? <RiMoonLine /> : <RiSunLine />}
        </motion.div>
      </div>

      <span>{isDark ? 'Dark mode' : 'Light mode'}</span>
      <span className="kbd-hint" style={{ marginLeft: 'auto' }}>X</span>
    </button>
  )
}

function SidebarContent({ onClose, theme, toggleTheme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Logo ─────────────────────────────── */}
      <div style={{ padding: '1.625rem 1.25rem 1.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              position: 'absolute', inset: -3, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(0,113,227,0.35), rgba(66,165,255,0.2))',
              filter: 'blur(6px)',
            }} />
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(145deg, #0071E3 0%, #40A0FF 100%)',
              borderRadius: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,113,227,0.40), inset 0 1px 0 rgba(255,255,255,0.25)',
              fontSize: '1.05rem', color: 'white',
              fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-1px',
              position: 'relative', zIndex: 1,
            }}>
              M
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.18rem', letterSpacing: '-0.5px', color: 'var(--text-primary)', lineHeight: 1.15 }}>
              Moneta
            </div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px', letterSpacing: '0.3px' }}>
              Personal Finance
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)', margin: '0 1.25rem' }} />

      {/* ── Navigation ───────────────────────── */}
      <nav style={{ flex: 1, padding: '0.875rem 0.75rem', overflowY: 'auto' }}>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: '0.125rem' }}>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.9px', padding: '0.875rem 0.875rem 0.3rem' }}>
              {group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navItems.filter(n => n.group === group).map(item => (
                <NavItem key={item.path} item={item} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)', margin: '0 1.25rem' }} />

      {/* ── Footer ───────────────────────────── */}
      <div style={{ padding: '0.875rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Dark mode toggle */}
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        {/* User pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.625rem 0.875rem',
          background: 'linear-gradient(135deg, rgba(0,113,227,0.07), rgba(0,113,227,0.03))',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(0,113,227,0.1)',
        }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #0071E3, #42A5FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white', fontWeight: 700, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,113,227,0.3)' }}>
            You
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>My Finances</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Personal account</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <RiSparklingLine style={{ fontSize: '0.85rem', color: 'var(--accent)', opacity: 0.7 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Navbar({ theme, toggleTheme, onQuickAdd }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop" style={{
        width: 'var(--sidebar-width)', position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        borderRight: '1px solid var(--border)',
        zIndex: 100, display: 'flex', flexDirection: 'column',
      }}>
        <SidebarContent onClose={() => {}} theme={theme} toggleTheme={toggleTheme} />
      </aside>

      {/* Mobile Top Bar */}
      <div className="mobile-bar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
        zIndex: 200, alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
          Moneta
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-secondary)', width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' }}>
            {theme === 'dark' ? <RiSunLine /> : <RiMoonLine />}
          </button>
          <button onClick={() => setMobileOpen(true)} style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-primary)', width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}>
            <RiMenuLine />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 300 }}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: 'var(--bg-sidebar)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderRight: '1px solid var(--border)', zIndex: 400 }}
            >
              <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-input)', border: 'none', color: 'var(--text-secondary)', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}>
                <RiCloseLine />
              </button>
              <SidebarContent onClose={() => setMobileOpen(false)} theme={theme} toggleTheme={toggleTheme} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile FAB — quick add */}
      <button
        className="mobile-fab"
        onClick={onQuickAdd}
        style={{
          display: 'none',
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0071E3, #40A0FF)',
          border: 'none', color: 'white',
          fontSize: '1.5rem', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,113,227,0.45)',
          zIndex: 250,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        +
      </button>

      <style>{`
        @media (max-width: 960px) {
          .sidebar-desktop { display: none !important; }
          .mobile-bar { display: flex !important; }
          .mobile-fab { display: flex !important; }
        }
      `}</style>
    </>
  )
}
