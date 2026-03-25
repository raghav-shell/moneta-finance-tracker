import React from 'react'
import { motion } from 'framer-motion'
import { SpendingPieChart, MonthlyTrendChart, IncomeExpenseBar } from '../../components/Charts/Charts'
import { useBudget } from '../../hooks/useBudget'
import { useCurrency } from '../../hooks/useCurrency'
import { useFinance } from '../../context/FinanceContext'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/currencyFormatter'
import { format, parseISO, isSameMonth } from 'date-fns'

const f = (i) => ({
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.4,0,0.2,1] } },
})

// Rule-based spending insights
function generateInsights(transactions, allTimeExpenses, allTimeIncome) {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonthExp = (cat) => transactions
    .filter(t => t.type === 'expense' && t.date && isSameMonth(parseISO(t.date), now) && (!cat || t.category === cat))
    .reduce((s,t) => s + (Number(t.amount)||0), 0)
  const lastMonthExp = (cat) => transactions
    .filter(t => t.type === 'expense' && t.date && isSameMonth(parseISO(t.date), prevMonth) && (!cat || t.category === cat))
    .reduce((s,t) => s + (Number(t.amount)||0), 0)

  const insights = []

  // Insight 1: Top spending category this month
  const catMap = {}
  transactions.filter(t => t.type === 'expense' && t.date && isSameMonth(parseISO(t.date), now))
    .forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount)||0) })
  const topCat = Object.entries(catMap).sort((a,b) => b[1]-a[1])[0]
  if (topCat) {
    const pct = allTimeExpenses > 0 ? ((topCat[1] / allTimeExpenses) * 100).toFixed(0) : 0
    insights.push({ icon: CATEGORY_ICONS[topCat[0]] || '📊', color: CATEGORY_COLORS[topCat[0]] || '#8E8E93', text: `<strong>${topCat[0]}</strong> is your biggest spending category this month — ${pct}% of total expenses.` })
  }

  // Insight 2: MoM change in total spending
  const thisTotal = thisMonthExp(null)
  const lastTotal = lastMonthExp(null)
  if (lastTotal > 0) {
    const changePct = ((thisTotal - lastTotal) / lastTotal) * 100
    const higher = thisTotal > lastTotal
    insights.push({
      icon: higher ? '⚠️' : '🎉',
      color: higher ? '#FF3B30' : '#28CD41',
      text: higher
        ? `Total spending is <strong>${changePct.toFixed(1)}% higher</strong> this month compared to last month.`
        : `Great job! Spending is <strong>${Math.abs(changePct).toFixed(1)}% lower</strong> this month vs last month.`,
    })
  }

  // Insight 3: Recurring expenses impact
  const recurringAmt = transactions
    .filter(t => t.recurring && t.type === 'expense')
    .reduce((s,t) => s + (Number(t.amount)||0), 0)
  if (recurringAmt > 0 && allTimeExpenses > 0) {
    const rpct = ((recurringAmt / allTimeExpenses) * 100).toFixed(0)
    insights.push({ icon: '🔁', color: '#BF5AF2', text: `Recurring expenses make up <strong>${rpct}% of your total spending</strong>. Review subscriptions regularly.` })
  }

  // Insight 4: Savings rate message
  if (allTimeIncome > 0) {
    const savingsRate = ((allTimeIncome - allTimeExpenses) / allTimeIncome * 100).toFixed(1)
    const isGood = parseFloat(savingsRate) >= 20
    insights.push({
      icon: isGood ? '✅' : '💡',
      color: isGood ? '#28CD41' : '#FF9500',
      text: isGood
        ? `Your savings rate is <strong>${savingsRate}%</strong> — above the recommended 20%. Keep it up!`
        : `Your savings rate is <strong>${savingsRate}%</strong>. Aim for at least 20% to build a healthy financial buffer.`,
    })
  }

  return insights
}

export default function Analytics() {
  const { allTimeIncome, allTimeExpenses, netBalance } = useBudget()
  const { formatAmount, formatCompact } = useCurrency()
  const { transactions } = useFinance()

  const { momChange, savingsRate, nowLabel, lastMonthLabel } = React.useMemo(() => {
    const now = new Date()
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonthExp = transactions
      .filter(t => t.type === 'expense' && t.date && isSameMonth(parseISO(t.date), now))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0)
    const lastMonthExp = transactions
      .filter(t => t.type === 'expense' && t.date && isSameMonth(parseISO(t.date), lastMonthDate))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0)
    return {
      momChange:     lastMonthExp > 0 ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : 0,
      savingsRate:   allTimeIncome > 0 ? ((allTimeIncome - allTimeExpenses) / allTimeIncome) * 100 : 0,
      nowLabel:      format(now, 'MMMM'),
      lastMonthLabel: format(lastMonthDate, 'MMMM'),
    }
  }, [transactions, allTimeIncome, allTimeExpenses])

  const topCats = React.useMemo(() => {
    const catMap = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount) || 0)
    })
    return Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [transactions])

  const insights = React.useMemo(
    () => generateInsights(transactions, allTimeExpenses, allTimeIncome),
    [transactions, allTimeExpenses, allTimeIncome]
  )

  const summaryStats = [
    { label: 'Total Income',   value: formatCompact(allTimeIncome),   color: 'var(--green)',  bg: 'var(--green-light)',  icon: '💰', cardClass: 'income-card' },
    { label: 'Total Expenses', value: formatCompact(allTimeExpenses), color: 'var(--red)',    bg: 'var(--red-light)',    icon: '💸', cardClass: 'expense-card' },
    { label: 'Net Balance',    value: `${netBalance >= 0 ? '+' : '-'}${formatCompact(Math.abs(netBalance))}`, color: netBalance >= 0 ? 'var(--accent)' : 'var(--red)', bg: netBalance >= 0 ? 'var(--accent-light)' : 'var(--red-light)', icon: '🏦', cardClass: 'balance-card' },
    { label: 'Savings Rate',   value: `${savingsRate.toFixed(1)}%`,   color: 'var(--purple)', bg: 'var(--purple-light)', icon: savingsRate >= 20 ? '🏆' : '🎯', cardClass: 'top-cat-card' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <div className="page-title-wrap"><h1 className="page-title">Analytics</h1></div>
          <p className="page-subtitle">Detailed insights into your finances</p>
        </div>
      </motion.div>

      {/* ── Summary stat cards with icons ─── */}
      <div className="stats-grid">
        {summaryStats.map((s, i) => (
          <motion.div key={s.label} className={`stat-card ${s.cardClass}`} variants={f(i)} initial="hidden" animate="show">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: '1.05rem' }}>{s.icon}</span>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.6rem' }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* ── MoM Banner ─────────────────────── */}
      <motion.div variants={f(4)} initial="hidden" animate="show"
        style={{
          padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
          background: momChange > 0
            ? 'linear-gradient(135deg, rgba(255,59,48,0.08), rgba(255,59,48,0.04))'
            : 'linear-gradient(135deg, rgba(40,205,65,0.08), rgba(40,205,65,0.04))',
          borderRadius: 'var(--radius-lg)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${momChange > 0 ? 'rgba(255,59,48,0.15)' : 'rgba(40,205,65,0.15)'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '0.5rem',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Bg orb */}
        <div style={{
          position: 'absolute', right: -30, top: -30,
          width: 100, height: 100, borderRadius: '50%',
          background: momChange > 0 ? 'rgba(255,59,48,0.12)' : 'rgba(40,205,65,0.12)',
          filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: '0.2rem' }}>
            Month-over-Month Spending
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {nowLabel} vs {lastMonthLabel}
          </div>
        </div>
        <div style={{ textAlign: 'right', position: 'relative' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700,
            color: momChange > 0 ? 'var(--red)' : 'var(--green)',
            letterSpacing: '-1px', lineHeight: 1,
          }}>
            {momChange > 0 ? '▲' : '▼'} {Math.abs(momChange).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {momChange > 0 ? 'Higher' : 'Lower'} spending this month
          </div>
        </div>
      </motion.div>

      {/* ── Charts ─────────────────────────── */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <motion.div variants={f(5)} initial="hidden" animate="show" className="card">
          <div className="section-title">Spending by Category</div>
          <SpendingPieChart />
        </motion.div>
        <motion.div variants={f(6)} initial="hidden" animate="show" className="card">
          <div className="section-title">Monthly Trend</div>
          <MonthlyTrendChart />
        </motion.div>
      </div>

      <motion.div variants={f(7)} initial="hidden" animate="show" className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Income vs Expenses — Last 6 Months</div>
        <IncomeExpenseBar />
      </motion.div>

      {/* ── Spending Insights ─────────────── */}
      {insights.length > 0 && (
        <motion.div variants={f(8)} initial="hidden" animate="show" className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-title">💡 Spending Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {insights.map((ins, i) => (
              <motion.div
                key={ins.icon + i}
                className="insight-card"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.06 } }}
              >
                <div className="insight-icon" style={{ background: `${ins.color}15`, border: `1px solid ${ins.color}25` }}>
                  {ins.icon}
                </div>
                <div className="insight-text">
                  {ins.text.split(/(<strong>[^<]*<\/strong>)/).map((part, i) => {
                    const m = part.match(/^<strong>(.*)<\/strong>$/)
                    return m ? <strong key={`strong-${i}`}>{m[1]}</strong> : part
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Top Categories ────────────────── */}
      <motion.div variants={f(9)} initial="hidden" animate="show" className="card">
        <div className="section-title">Top Spending Categories</div>
        {topCats.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon">📊</div>
            <h3>No data yet</h3>
          </div>
        ) : (
          <div>
            {topCats.map(([cat, amt], i) => {
              const pct = allTimeExpenses > 0 ? (amt / allTimeExpenses) * 100 : 0
              const c = CATEGORY_COLORS[cat] || '#8E8E93'
              return (
                <motion.div key={cat}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.05 } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.9rem 0',
                    borderBottom: i < topCats.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: `linear-gradient(135deg, ${c}20, ${c}0c)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                    border: `1px solid ${c}22`,
                  }}>
                    {CATEGORY_ICONS[cat] || '📌'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600 }}>
                        {formatAmount(amt)}
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.78rem', marginLeft: '0.4rem' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        style={{
                          height: '100%', borderRadius: 99,
                          background: `linear-gradient(90deg, ${c}, ${c}80)`,
                          boxShadow: `0 0 6px ${c}44`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.05, ease: [0.4,0,0.2,1] }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
