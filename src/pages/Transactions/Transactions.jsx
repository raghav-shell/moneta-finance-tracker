import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RiAddCircleLine, RiCloseLine, RiDownloadLine, RiHistoryLine, RiCalendarLine } from 'react-icons/ri'
import { useTransactions } from '../../hooks/useTransactions'
import { useDebounce } from '../../hooks/useDebounce'
import TransactionCard from '../../components/TransactionCard/TransactionCard'
import SearchBar from '../../components/SearchBar/SearchBar'
import Filters from '../../components/Filters/Filters'
import TransactionForm from '../AddTransaction/TransactionForm'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

// ── CSV Export ──────────────────────────────────────────
export function exportToCSV(transactions, filename) {
  if (!transactions.length) {
    toast.info('No transactions to export.')
    return
  }

  const headers = ['Title', 'Type', 'Category', 'Amount (₹)', 'Date', 'Recurring', 'Notes']

  const rows = transactions.map(t => {
    const sign = t.type === 'income' ? '+' : '-'
    const amt  = `${sign}${Number(t.amount) || 0}`
    return [
      `"${(t.title  || '').replace(/"/g, '""')}"`,
      t.type       || '',
      t.category   || '',
      amt,
      t.date       || '',
      t.recurring ? 'Yes' : 'No',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]
  })

  const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `moneta-transactions-${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success(`Exported ${transactions.length} transactions ✓`)
}

export default function Transactions() {
  const currentMonthKey   = format(new Date(), 'yyyy-MM')
  const currentMonthLabel = format(new Date(), 'MMMM yyyy')

  const [rawSearch, setRawSearch]     = useState('')
  const [filters, setFilters]         = useState({ category: '', type: '', sortBy: 'date', sortDir: 'desc', dateFrom: '', dateTo: '' })
  const [editingTx, setEditingTx]     = useState(null)
  const [showAll, setShowAll]         = useState(false)

  const search = useDebounce(rawSearch, 350)

  // When not showing all, inject current-month date range into filters
  const effectiveFilters = useMemo(() => {
    if (showAll) return filters
    const firstDay = `${currentMonthKey}-01`
    const lastDay  = (() => {
      const d = new Date()
      d.setMonth(d.getMonth() + 1, 0)
      return format(d, 'yyyy-MM-dd')
    })()
    return { ...filters, dateFrom: firstDay, dateTo: lastDay }
  }, [filters, showAll, currentMonthKey])

  const { transactions } = useTransactions({ search, ...effectiveFilters })

  return (
    <div>
      {/* ── Header ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div className="page-title-wrap">
            <h1 className="page-title">Transactions</h1>
          </div>
          <p className="page-subtitle">
            {showAll ? 'All time' : currentMonthLabel}
            {' — '}
            <span className="count-pill">{transactions.length}</span>{' '}
            transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Month / All toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '0.2rem', gap: '0.2rem' }}>
            <button
              onClick={() => setShowAll(false)}
              style={{
                padding: '0.38rem 0.85rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-body)',
                background: !showAll ? 'var(--bg-primary)' : 'transparent',
                color: !showAll ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: !showAll ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <RiCalendarLine style={{ fontSize: '0.8rem', marginRight: '0.3rem', verticalAlign: '-1px' }} />
              This Month
            </button>
            <button
              onClick={() => setShowAll(true)}
              style={{
                padding: '0.38rem 0.85rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-body)',
                background: showAll ? 'var(--bg-primary)' : 'transparent',
                color: showAll ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: showAll ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => exportToCSV(transactions, `moneta-${showAll ? 'all' : currentMonthKey}.csv`)}
            className="btn btn-ghost"
            style={{ gap: '0.4rem' }}
          >
            <RiDownloadLine style={{ fontSize: '0.95rem' }} /> Export CSV
          </button>

          <Link to="/transactions/new" className="btn btn-primary">
            <RiAddCircleLine /> Add New
          </Link>
        </div>
      </motion.div>

      {/* ── Search + Filters ───────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}
      >
        <div style={{ marginBottom: '0.875rem' }}>
          <SearchBar value={rawSearch} onChange={setRawSearch} />
        </div>
        <Filters filters={filters} setFilters={setFilters} />
      </motion.div>

      {/* ── List ────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {transactions.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card empty-state">
              <div className="empty-state-icon">{showAll ? '🧾' : '📅'}</div>
              <h3>{showAll ? 'No transactions yet' : `No transactions in ${currentMonthLabel}`}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {showAll ? 'Add your first transaction to get started.' : 'Switch to "All Time" to see past months.'}
              </p>
              {!showAll && (
                <button onClick={() => setShowAll(true)} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                  <RiHistoryLine /> View All Time
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            {transactions.map(t => (
              <TransactionCard key={t.id} transaction={t} onEdit={setEditingTx} />
            ))}

            {transactions.length >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '1.25rem 0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
              >
                <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </span>
                <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ─────────────────────── */}
      <AnimatePresence>
        {editingTx && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setEditingTx(null) }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: 'var(--bg-card)', backdropFilter: 'blur(30px)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-glass)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>Edit Transaction</h2>
                <button onClick={() => setEditingTx(null)} style={{ background: 'var(--bg-input)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>
                  <RiCloseLine />
                </button>
              </div>
              <TransactionForm defaultValues={editingTx} isEditing onSuccess={() => setEditingTx(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
