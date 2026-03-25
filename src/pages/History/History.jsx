import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, startOfMonth } from 'date-fns'
import {
  RiDownloadLine, RiArrowDownSLine, RiArrowUpSLine,
  RiMoneyDollarCircleLine, RiArrowUpLine, RiArrowDownLine,
} from 'react-icons/ri'
import { useFinance } from '../../context/FinanceContext'
import { useCurrency } from '../../hooks/useCurrency'
import { CATEGORY_ICONS } from '../../utils/currencyFormatter'
import TransactionCard from '../../components/TransactionCard/TransactionCard'
import { exportToCSV } from '../Transactions/Transactions'

const f = (i) => ({
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: [0.4,0,0.2,1] } },
})

function MonthCard({ monthKey, monthLabel, transactions, index }) {
  const [open, setOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const { formatAmount, formatCompact } = useCurrency()

  const { income, expense, net, topCategory } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0)
    const exp = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0)
    const catMap = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount)||0)
    })
    const top = Object.entries(catMap).sort((a,b) => b[1]-a[1])[0]
    return { income: inc, expense: exp, net: inc - exp, topCategory: top }
  }, [transactions])

  return (
    <motion.div
      variants={f(index)}
      initial="hidden"
      animate="show"
      className="card"
      style={{ marginBottom: '0.875rem', overflow: 'visible', padding: 0 }}
    >
      {/* ── Month header — always visible ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
          borderRadius: open ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
          transition: 'background 0.15s ease',
          textAlign: 'left',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Month name + count */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              {monthLabel}
            </span>
            <span className="count-pill">{transactions.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 500 }}>
              <RiArrowUpLine style={{ verticalAlign: '-2px', fontSize: '0.8rem' }} /> {formatCompact(income)}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--red)', fontWeight: 500 }}>
              <RiArrowDownLine style={{ verticalAlign: '-2px', fontSize: '0.8rem' }} /> {formatCompact(expense)}
            </span>
            {topCategory && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Top: {CATEGORY_ICONS[topCategory[0]] || '📌'} {topCategory[0]}
              </span>
            )}
          </div>
        </div>

        {/* Net balance */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem',
            color: net >= 0 ? 'var(--green)' : 'var(--red)',
            letterSpacing: '-0.3px',
          }}>
            {net >= 0 ? '+' : '−'}{formatCompact(Math.abs(net))}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>net</div>
        </div>

        {/* Download button */}
        <button
          onClick={e => {
            e.stopPropagation()
            exportToCSV(transactions, `moneta-${monthKey}.csv`)
          }}
          title={`Download ${monthLabel} as CSV`}
          style={{
            background: 'var(--bg-input)', border: 'none', borderRadius: 8,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem',
            flexShrink: 0, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <RiDownloadLine />
        </button>

        {/* Expand chevron */}
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem', flexShrink: 0, transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <RiArrowDownSLine />
        </div>
      </button>

      {/* ── Expanded transaction list ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4,0,0.2,1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 0.5rem 0.75rem' }}>
              {transactions.map((t, i) => (
                <div key={t.id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <TransactionCard transaction={t} onEdit={setEditingTx} inList />
                </div>
              ))}
            </div>

            {/* Per-month summary bar */}
            <div style={{
              display: 'flex', gap: '0.75rem', padding: '0.875rem 1.5rem',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-input)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'Income',   value: formatAmount(income),  color: 'var(--green)'  },
                { label: 'Expenses', value: formatAmount(expense), color: 'var(--red)'    },
                { label: 'Saved',    value: formatAmount(Math.abs(net)), color: net >= 0 ? 'var(--accent)' : 'var(--red)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function History() {
  const { transactions } = useFinance()
  const { formatCompact } = useCurrency()
  const currentMonthKey = format(new Date(), 'yyyy-MM')

  // Group ALL transactions by month, sort descending, exclude current month
  const months = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      if (!t.date) return
      const key = format(startOfMonth(parseISO(t.date)), 'yyyy-MM')
      if (!map[key]) map[key] = { key, label: format(parseISO(t.date), 'MMMM yyyy'), transactions: [] }
      map[key].transactions.push(t)
    })
    return Object.values(map)
      .filter(m => m.key !== currentMonthKey)        // exclude current month
      .sort((a, b) => b.key.localeCompare(a.key))    // newest first
  }, [transactions, currentMonthKey])

  // Aggregate stats across all previous months
  const totals = useMemo(() => {
    const all = months.flatMap(m => m.transactions)
    return {
      income:  all.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0),
      expense: all.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0),
      count:   all.length,
      months:  months.length,
    }
  }, [months])

  return (
    <div>
      {/* ── Header ─────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <div className="page-title-wrap"><h1 className="page-title">History</h1></div>
          <p className="page-subtitle">Previous months' transactions — click any month to expand</p>
        </div>
      </motion.div>

      {months.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card empty-state">
            <div className="empty-state-icon">🗂️</div>
            <h3>No history yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Previous months will appear here once you have transactions from past months.
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* ── Summary banner ─────────────── */}
          <motion.div
            variants={f(0)} initial="hidden" animate="show"
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem', marginBottom: '1.75rem',
            }}
          >
            {[
              { label: 'Months recorded', value: totals.months, suffix: '', icon: '📅', cardClass: 'balance-card' },
              { label: 'Total income',    value: formatCompact(totals.income),  icon: '💰', cardClass: 'income-card'  },
              { label: 'Total expenses',  value: formatCompact(totals.expense), icon: '💸', cardClass: 'expense-card' },
              { label: 'Total transactions', value: totals.count, icon: '🧾', cardClass: 'top-cat-card' },
            ].map((s, i) => (
              <motion.div key={s.label} variants={f(i+1)} initial="hidden" animate="show" className={`stat-card ${s.cardClass}`}>
                <div className="stat-icon" style={{ background: 'var(--bg-input)', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Month accordion list ─────────── */}
          <div>
            {months.map((m, i) => (
              <MonthCard
                key={m.key}
                monthKey={m.key}
                monthLabel={m.label}
                transactions={m.transactions}
                index={i + 5}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
