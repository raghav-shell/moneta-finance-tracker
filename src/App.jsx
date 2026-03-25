import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FinanceProvider } from './context/FinanceContext'
import Navbar from './components/Navbar/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'
import Transactions from './pages/Transactions/Transactions'
import AddTransaction from './pages/AddTransaction/AddTransaction'
import Budget from './pages/Budget/Budget'
import Analytics from './pages/Analytics/Analytics'
import History from './pages/History/History'
import TransactionForm from './pages/AddTransaction/TransactionForm'
import { useTheme } from './hooks/useTheme'
import KeyboardHelp from './components/KeyboardHelp/KeyboardHelp'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { RiCloseLine } from 'react-icons/ri'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
}

// Global Quick-Add modal — opened via N key or nav
function QuickAddModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            zIndex: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              width: '100%', maxWidth: 560,
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                Quick Add Entry
              </h2>
              <button onClick={onClose} style={{ background: 'var(--bg-input)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>
                <RiCloseLine />
              </button>
            </div>
            <TransactionForm onSuccess={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AppShell({ theme, toggleTheme }) {
  const location = useLocation()
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useKeyboardShortcuts({
    onAddNew: () => setQuickAddOpen(true),
    onToggleTheme: toggleTheme,
  })

  // Close quick add on Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setQuickAddOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="app-layout">
      <Navbar theme={theme} toggleTheme={toggleTheme} onQuickAdd={() => setQuickAddOpen(true)} />

      <main className="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="page-transition"
          >
            <Routes location={location}>
              <Route path="/"                 element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"        element={<Dashboard onQuickAdd={() => setQuickAddOpen(true)} />} />
              <Route path="/transactions"     element={<Transactions />} />
              <Route path="/transactions/new" element={<AddTransaction />} />
              <Route path="/budget"           element={<Budget />} />
              <Route path="/analytics"        element={<Analytics />} />
              <Route path="/history"          element={<History />} />
              <Route path="*"                 element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <KeyboardHelp />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme}
      />
    </div>
  )
}

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <FinanceProvider>
      <BrowserRouter>
        <AppShell theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </FinanceProvider>
  )
}
