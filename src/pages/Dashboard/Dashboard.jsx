import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { RiAddLine, RiArrowRightSLine, RiCloseLine, RiLoader4Line,
         RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri'
import { useBudget } from '../../hooks/useBudget'
import { useCurrency } from '../../hooks/useCurrency'
import { useFinance } from '../../context/FinanceContext'
import { useTransactions } from '../../hooks/useTransactions'
import { SpendingPieChart, IncomeExpenseBar } from '../../components/Charts/Charts'
import BudgetCard from '../../components/BudgetCard/BudgetCard'
import TransactionCard from '../../components/TransactionCard/TransactionCard'
import TransactionForm from '../AddTransaction/TransactionForm'
import { CURRENCIES, CATEGORY_ICONS } from '../../utils/currencyFormatter'
import { format, parseISO, isSameMonth } from 'date-fns'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: [0.4, 0, 0.2, 1] },
  }),
}

// Animated stat card with CountUp
function StatCard({ stat, index }) {
  const raw = stat.rawValue ?? 0

  return (
    <motion.div
      className={`stat-card ${stat.cardClass}`}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      {/* Decorative orb */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80,
        background: stat.orbColor,
        borderRadius: '50%',
        filter: 'blur(24px)',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      <div className="stat-icon" style={{ background: stat.iconBg, position: 'relative' }}>
        <span style={{ fontSize: '1.05rem' }}>{stat.iconEmoji}</span>
      </div>

      <div className="stat-label">{stat.label}</div>

      <div className="stat-value" style={{ color: stat.valueColor, position: 'relative' }}>
        {stat.isText ? (
          <span style={{ fontSize: '1.35rem' }}>{stat.value}</span>
        ) : (
          <>
            {stat.prefix && <span style={{ fontSize: '1rem', fontWeight: 500 }}>{stat.prefix}</span>}
            {stat.symbol}
            <CountUp
              end={raw}
              duration={1.6}
              separator=","
              decimals={stat.suffix ? 2 : 0}
              useEasing
              preserveValue
            />
            {stat.suffix && <span style={{ fontSize: '1rem' }}>{stat.suffix}</span>}
          </>
        )}
      </div>

      {/* Sub label for top category */}
      {stat.sub && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
          color: 'var(--text-muted)', marginTop: '0.3rem',
        }}>
          {stat.sub} spent
        </div>
      )}

      {/* MoM trend badge */}
      {stat.trend !== undefined && (
        <div className={`trend-badge ${stat.trend > 0 ? 'trend-up' : stat.trend < 0 ? 'trend-down' : 'trend-flat'}`}>
          {stat.trend > 0
            ? <RiArrowUpLine style={{ fontSize: '0.75rem' }} />
            : stat.trend < 0
            ? <RiArrowDownLine style={{ fontSize: '0.75rem' }} />
            : null}
          {stat.trend === 0 ? 'No change' : `${Math.abs(stat.trend).toFixed(1)}% vs last month`}
        </div>
      )}
    </motion.div>
  )
}

export default function Dashboard({ onQuickAdd }) {
  const { allTimeIncome, allTimeExpenses, netBalance, topCategory, topCategoryAmount } = useBudget()
  const { formatCompact, symbol } = useCurrency()
  const { currency, setCurrency, ratesLoading, transactions: allTx } = useFinance()
  const { transactions } = useTransactions({ sortBy: 'date', sortDir: 'desc' })
  const recent = transactions.slice(0, 5)
  const [editingTransaction, setEditingTransaction] = useState(null)

  // MoM trend calculations
  const trends = useMemo(() => {
    const now = new Date()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisIncome  = allTx.filter(t => t.type === 'income'  && t.date && isSameMonth(parseISO(t.date), now)).reduce((s,t) => s + (Number(t.amount)||0), 0)
    const prevIncome  = allTx.filter(t => t.type === 'income'  && t.date && isSameMonth(parseISO(t.date), prev)).reduce((s,t) => s + (Number(t.amount)||0), 0)
    const thisExp     = allTx.filter(t => t.type === 'expense' && t.date && isSameMonth(parseISO(t.date), now)).reduce((s,t) => s + (Number(t.amount)||0), 0)
    const prevExp     = allTx.filter(t => t.type === 'expense' && t.date && isSameMonth(parseISO(t.date), prev)).reduce((s,t) => s + (Number(t.amount)||0), 0)

    const pct = (cur, pre) => pre > 0 ? ((cur - pre) / pre) * 100 : 0

    return {
      income:  pct(thisIncome, prevIncome),
      expense: pct(thisExp, prevExp),
    }
  }, [allTx])

  // Raw numeric values for CountUp
  // Divide by the correct base so suffix matches (₹1.03L not ₹103L)
  const toRaw = (v) => v >= 100000 ? v / 100000 : v >= 1000 ? v / 1000 : v
  const suffix = (v) => v >= 100000 ? 'L' : v >= 1000 ? 'K' : ''
  const rawIncome  = toRaw(allTimeIncome)
  const rawExpense = toRaw(allTimeExpenses)
  const rawBalance = toRaw(Math.abs(netBalance))

  const stats = [
    {
      label: 'Total Income',
      rawValue: rawIncome,
      symbol,
      suffix: suffix(allTimeIncome),
      iconEmoji: '💰',
      iconBg: 'var(--green-light)',
      valueColor: 'var(--green)',
      cardClass: 'income-card',
      orbColor: 'var(--green-glow)',
      trend: trends.income,
    },
    {
      label: 'Total Expenses',
      rawValue: rawExpense,
      symbol,
      suffix: suffix(allTimeExpenses),
      iconEmoji: '💸',
      iconBg: 'var(--red-light)',
      valueColor: 'var(--red)',
      cardClass: 'expense-card',
      orbColor: 'var(--red-glow)',
      trend: trends.expense,
    },
    {
      label: 'Net Balance',
      rawValue: rawBalance,
      symbol,
      suffix: suffix(Math.abs(netBalance)),
      prefix: netBalance < 0 ? '−' : '+',
      iconEmoji: '🏦',
      iconBg: 'var(--accent-light)',
      valueColor: netBalance >= 0 ? 'var(--accent)' : 'var(--red)',
      cardClass: 'balance-card',
      orbColor: 'var(--accent-glow)',
    },
    {
      label: 'Top Category',
      value: topCategory,
      sub: formatCompact(topCategoryAmount),
      isText: true,
      iconEmoji: CATEGORY_ICONS[topCategory] || '📊',
      iconBg: 'var(--purple-light)',
      valueColor: 'var(--text-primary)',
      cardClass: 'top-cat-card',
      orbColor: 'var(--purple-glow)',
    },
  ]

  return (
    <div>
      {/* ── Hero Header ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="hero-banner"
        style={{ marginBottom: '1.75rem' }}
      >
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '0.3rem' }}>
              Good day 👋
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: '0.3rem' }}>
              Financial Overview
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
              Here's a summary of your money activity
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={currency} onChange={e => setCurrency(e.target.value)}
                disabled={ratesLoading}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  padding: '0.5rem 2rem 0.5rem 0.75rem',
                  cursor: 'pointer',
                  outline: 'none',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>)}
              </select>
              {ratesLoading && (
                <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: '0.85rem', animation: 'spin 0.7s linear infinite' }}>
                  <RiLoader4Line />
                </div>
              )}
            </div>
            <button onClick={onQuickAdd} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.65rem 1.2rem',
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'var(--transition)',
              cursor: 'pointer',
            }}>
              <RiAddLine style={{ fontSize: '1rem' }} /> Add Entry
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────── */}
      <div className="stats-grid">
        {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>

      {/* ── Budget Card ─────────────────────────── */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
        <BudgetCard />
      </motion.div>

      {/* ── Charts ──────────────────────────────── */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show" className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <div className="card">
          <div className="section-title">Spending by Category</div>
          <SpendingPieChart />
        </div>
        <div className="card">
          <div className="section-title">Income vs Expenses</div>
          <IncomeExpenseBar />
        </div>
      </motion.div>

      {/* ── Recent Transactions ─────────────────── */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="section-title" style={{ margin: 0 }}>Recent Activity</div>
          <Link to="/transactions" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            View all <RiArrowRightSLine style={{ fontSize: '1.1rem' }} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🧾</div>
            <h3>No transactions yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Start by recording your first income or expense
            </p>
            <Link to="/transactions/new" className="btn btn-primary">
              <RiAddLine /> Add First Entry
            </Link>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-glass)', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
            {recent.map((t, idx) => (
              <div key={t.id} style={{ borderBottom: idx < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <TransactionCard transaction={t} onEdit={setEditingTransaction} inList />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Edit Modal ───────────────────────────── */}
      <AnimatePresence>
        {editingTransaction && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setEditingTransaction(null) }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: 'var(--bg-card)', backdropFilter: 'blur(30px)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-glass)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Edit Transaction</h2>
                <button onClick={() => setEditingTransaction(null)} style={{ background: 'var(--bg-input)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>
                  <RiCloseLine />
                </button>
              </div>
              <TransactionForm defaultValues={editingTransaction} isEditing onSuccess={() => setEditingTransaction(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
