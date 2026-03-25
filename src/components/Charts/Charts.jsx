import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'
import { useFinance } from '../../context/FinanceContext'
import { useCurrency } from '../../hooks/useCurrency'
import { CATEGORY_COLORS } from '../../utils/currencyFormatter'
import { format, parseISO, startOfMonth } from 'date-fns'

// Premium glassmorphism tooltip
const TooltipBox = ({ active, payload, label, fmtFn }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border-glass)',
      borderRadius: 12,
      padding: '0.65rem 1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.8rem',
      minWidth: 130,
    }}>
      {label && <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.75rem' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: i > 0 ? '0.2rem' : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {fmtFn ? fmtFn(p.value) : p.value}
          </span>
          {p.name && <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{p.name}</span>}
        </div>
      ))}
    </div>
  )
}

const AXIS_STYLE = { fill: 'var(--text-muted)', fontSize: 11, fontFamily: "'Outfit', sans-serif" }

function EmptyChart() {
  return (
    <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>📊</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>No data yet</span>
    </div>
  )
}

/* ── Spending Pie Chart ─────────────────────────────── */
export function SpendingPieChart() {
  const { transactions } = useFinance()
  const { formatAmount } = useCurrency()

  const data = React.useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + (Number(t.amount) || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))
  }, [transactions])

  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height={268}>
      <PieChart>
        <defs>
          {data.map(entry => (
            <radialGradient key={entry.name} id={`grad-${entry.name.replace(/\s/g,'-')}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={CATEGORY_COLORS[entry.name] || '#8E8E93'} stopOpacity={1} />
              <stop offset="100%" stopColor={CATEGORY_COLORS[entry.name] || '#8E8E93'} stopOpacity={0.75} />
            </radialGradient>
          ))}
        </defs>
        <Pie data={data} cx="50%" cy="50%" innerRadius={62} outerRadius={104} paddingAngle={3} dataKey="value" strokeWidth={0}>
          {data.map(entry => (
            <Cell key={entry.name} fill={`url(#grad-${entry.name.replace(/\s/g,'-')})`} />
          ))}
        </Pie>
        <Tooltip content={<TooltipBox fmtFn={(v) => formatAmount(v)} />} />
        <Legend
          iconType="circle" iconSize={8}
          formatter={val => <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: "'Outfit', sans-serif" }}>{val}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

/* ── Monthly Trend Line Chart ───────────────────────── */
export function MonthlyTrendChart() {
  const { transactions } = useFinance()
  const { formatAmount, symbol } = useCurrency()

  const data = React.useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      if (!t.date) return
      const sortKey    = format(startOfMonth(parseISO(t.date)), 'yyyy-MM') // ISO for reliable sort
      const displayKey = format(startOfMonth(parseISO(t.date)), 'MMM yy')  // human-readable label
      if (!map[sortKey]) map[sortKey] = { month: displayKey, sortKey, income: 0, expense: 0 }
      if (t.type === 'income') map[sortKey].income += (Number(t.amount) || 0)
      else map[sortKey].expense += (Number(t.amount) || 0)
    })
    return Object.values(map).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-8)
  }, [transactions])

  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height={268}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 5, left: 4 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#28CD41" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#28CD41" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF3B30" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#FF3B30" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} dy={6} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={v => `${symbol}${(v/1000).toFixed(0)}K`} width={45} />
        <Tooltip content={<TooltipBox fmtFn={formatAmount} />} />
        <Legend iconType="circle" iconSize={8}
          formatter={val => <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: "'Outfit'" }}>{val}</span>} />
        <Line type="monotone" dataKey="income"  name="Income"  stroke="#28CD41" strokeWidth={2.5}
          dot={{ fill: '#28CD41', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#28CD41', strokeWidth: 2, stroke: '#fff' }} />
        <Line type="monotone" dataKey="expense" name="Expense" stroke="#FF3B30" strokeWidth={2.5}
          dot={{ fill: '#FF3B30', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#FF3B30', strokeWidth: 2, stroke: '#fff' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ── Income vs Expense Bar Chart ────────────────────── */
export function IncomeExpenseBar() {
  const { transactions } = useFinance()
  const { formatAmount, symbol } = useCurrency()

  const data = React.useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      if (!t.date) return
      const key   = format(startOfMonth(parseISO(t.date)), 'MMM yy')
      const label = format(startOfMonth(parseISO(t.date)), 'MMM')
      if (!map[key]) map[key] = { month: label, key, Income: 0, Expense: 0 }
      if (t.type === 'income') map[key].Income += (Number(t.amount) || 0)
      else map[key].Expense += (Number(t.amount) || 0)
    })
    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
  }, [transactions])

  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height={268}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 5, left: 4 }} barGap={5}>
        <defs>
          <linearGradient id="barIncomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#28CD41" />
            <stop offset="100%" stopColor="rgba(40,205,65,0.6)" />
          </linearGradient>
          <linearGradient id="barExpenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="100%" stopColor="rgba(255,59,48,0.6)" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} dy={6} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={v => `${symbol}${(v/1000).toFixed(0)}K`} width={45} />
        <Tooltip content={<TooltipBox fmtFn={formatAmount} />} />
        <Legend iconType="circle" iconSize={8}
          formatter={val => <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: "'Outfit'" }}>{val}</span>} />
        <Bar dataKey="Income"  fill="url(#barIncomeGrad)"  radius={[6, 6, 0, 0]} maxBarSize={34} />
        <Bar dataKey="Expense" fill="url(#barExpenseGrad)" radius={[6, 6, 0, 0]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
  )
}
