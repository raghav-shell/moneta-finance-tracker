import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { RiEditLine, RiCheckLine, RiRepeatLine, RiAlertLine } from 'react-icons/ri'
import { useBudget } from '../../hooks/useBudget'
import { useCurrency } from '../../hooks/useCurrency'
import { useFinance } from '../../context/FinanceContext'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/currencyFormatter'

const f = (i) => ({ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.4,0,0.2,1] } } })

export default function Budget() {
  const { monthlyBudget, totalExpenses, allTimeExpenses, remaining, percentUsed, isOverBudget, updateBudget } = useBudget()
  const { formatAmount } = useCurrency()
  const { transactions } = useFinance()
  const [editing, setEditing] = useState(false)
  const [newBudget, setNewBudget] = useState(monthlyBudget)

  // Fix 4: Keep newBudget in sync with context value
  React.useEffect(() => {
    setNewBudget(monthlyBudget)
  }, [monthlyBudget])

  const categoryBreakdown = React.useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] || 0) + (Number(t.amount) || 0) })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [transactions])

  const { recurring, recurringTotal } = React.useMemo(() => {
    const rec = transactions.filter(t => t.recurring)
    return {
      recurring: rec,
      recurringTotal: rec.reduce((s, t) => s + (t.type === 'expense' ? (Number(t.amount) || 0) : 0), 0),
    }
  }, [transactions])

  const color = isOverBudget ? 'var(--red)' : percentUsed > 75 ? 'var(--orange)' : 'var(--green)'
  const bg    = isOverBudget ? 'var(--red-light)' : percentUsed > 75 ? 'var(--orange-light)' : 'var(--green-light)'

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <div className="page-title-wrap"><h1 className="page-title">Budget</h1></div>
          <p className="page-subtitle">Track your monthly spending limits</p>
        </div>
      </motion.div>

      {/* Main Budget */}
      <motion.div variants={f(1)} initial="hidden" animate="show" className="card" style={{ marginBottom: '1.25rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: '0.4rem' }}>
              Monthly Budget
            </div>
            {editing ? (
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <input type="number" className="form-input" value={newBudget}
                  onChange={e => { const v = parseFloat(e.target.value); setNewBudget(isNaN(v) ? '' : v) }}
                  onKeyDown={e => { if (e.key === 'Enter' && newBudget && !isNaN(newBudget) && newBudget > 0) { updateBudget(newBudget); setEditing(false) } if (e.key === 'Escape') { setNewBudget(monthlyBudget); setEditing(false) } }}
                  style={{ width: 160, fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 600 }}
                  autoFocus />
                <button className="btn btn-primary" onClick={() => { if (newBudget && !isNaN(newBudget) && newBudget > 0) { updateBudget(newBudget); setEditing(false) } }}
                  style={{ padding: '0.6rem 0.9rem' }}>
                  <RiCheckLine /> Save
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1.5px' }}>
                  {formatAmount(monthlyBudget)}
                </div>
                <button className="btn btn-ghost" onClick={() => setEditing(true)} style={{ padding: '0.4rem 0.6rem', borderRadius: 8 }}>
                  <RiEditLine />
                </button>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: '0.4rem' }}>
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color, letterSpacing: '-1.5px' }}>
              {isOverBudget ? '-' : ''}{formatAmount(Math.abs(remaining))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Spent <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{formatAmount(totalExpenses)}</span>
            </span>
            <span style={{ color, fontWeight: 600, background: bg, padding: '0.15rem 0.5rem', borderRadius: 99 }}>
              {percentUsed.toFixed(1)}% used
            </span>
          </div>
          <div className="progress-bar-track" style={{ height: 8 }}>
            <motion.div
              className="progress-bar-fill"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed}%` }}
              transition={{ duration: 1.2, ease: [0.4,0,0.2,1], delay: 0.3 }}
            />
          </div>
          {isOverBudget && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginTop: '0.875rem', padding: '0.65rem 1rem',
                background: 'var(--red-light)', borderRadius: 10,
                color: 'var(--red)', fontSize: '0.82rem', fontWeight: 500,
              }}>
              <RiAlertLine /> You've exceeded your budget by {formatAmount(Math.abs(remaining))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="grid-2">
        {/* Category Breakdown */}
        <motion.div variants={f(2)} initial="hidden" animate="show" className="card">
          <div className="section-title">Spending by Category</div>
          {categoryBreakdown.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">📊</div>
              <h3>No expenses yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categoryBreakdown.map(([cat, amt], i) => {
                const pct = allTimeExpenses > 0 ? (amt / allTimeExpenses) * 100 : 0
                const c = CATEGORY_COLORS[cat] || '#8E8E93'
                return (
                  <motion.div key={cat} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.04 } }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        {CATEGORY_ICONS[cat] || '📌'} {cat}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                        {formatAmount(amt)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${c}, ${c}80)`, boxShadow: `0 0 6px ${c}44` }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.04, ease: [0.4,0,0.2,1] }} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Recurring */}
        <motion.div variants={f(3)} initial="hidden" animate="show" className="card">
          <div className="section-title">
            <span style={{ color: 'var(--purple)' }}><RiRepeatLine /></span> Recurring
          </div>
          {recurring.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">🔁</div>
              <h3>No recurring items</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mark transactions as recurring when adding</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {recurring.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.65rem 0.875rem',
                    background: 'var(--purple-light)',
                    borderRadius: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <span>{CATEGORY_ICONS[t.category] || '📌'}</span> {t.title}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: t.type === 'income' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0.875rem',
                background: 'var(--bg-input)', borderRadius: 10, fontSize: '0.82rem',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly recurring expenses</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 600 }}>
                  -{formatAmount(recurringTotal)}
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
