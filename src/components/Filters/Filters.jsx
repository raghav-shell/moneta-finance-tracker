import React from 'react'
import { RiFilterLine, RiCloseLine, RiSortDesc } from 'react-icons/ri'
import { EXPENSE_CATEGORIES } from '../../utils/currencyFormatter'

const TYPE_LABELS   = { '': 'All Types', income: '💰 Income', expense: '💸 Expense' }
const SORT_LABELS   = { date: '📅 Date', amount: '💰 Amount', category: '🏷 Category' }
const DIR_LABELS    = { desc: '↓ Newest', asc: '↑ Oldest' }

export default function Filters({ filters, setFilters }) {
  const update = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))
  const hasActive = filters.category || filters.type || filters.dateFrom || filters.dateTo

  const selStyle = {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 99,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    fontWeight: 500,
    padding: '0.45rem 0.875rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.18s ease',
    appearance: 'none',
    WebkitAppearance: 'none',
  }

  const activeSelStyle = {
    ...selStyle,
    background: 'var(--accent-light)',
    border: '1.5px solid rgba(0,113,227,0.25)',
    color: 'var(--accent)',
    fontWeight: 600,
  }

  return (
    <div>
      {/* Row 1: Filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '0.25rem' }}>
          <RiFilterLine /> Filter
        </div>

        {/* Type filter */}
        <select
          style={filters.type ? activeSelStyle : selStyle}
          value={filters.type}
          onChange={e => update('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="income">💰 Income</option>
          <option value="expense">💸 Expense</option>
        </select>

        {/* Category filter */}
        <select
          style={filters.category ? activeSelStyle : selStyle}
          value={filters.category}
          onChange={e => update('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Date range */}
        <input
          type="date"
          style={{ ...selStyle, paddingRight: '0.875rem', ...(filters.dateFrom ? { background: 'var(--accent-light)', border: '1.5px solid rgba(0,113,227,0.25)', color: 'var(--accent)' } : {}) }}
          value={filters.dateFrom}
          onChange={e => update('dateFrom', e.target.value)}
          title="From date"
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
        <input
          type="date"
          style={{ ...selStyle, paddingRight: '0.875rem', ...(filters.dateTo ? { background: 'var(--accent-light)', border: '1.5px solid rgba(0,113,227,0.25)', color: 'var(--accent)' } : {}) }}
          value={filters.dateTo}
          onChange={e => update('dateTo', e.target.value)}
          title="To date"
        />

        {hasActive && (
          <button
            className="filter-pill-clear"
            onClick={() => setFilters(p => ({ ...p, category: '', type: '', dateFrom: '', dateTo: '' }))}
          >
            <RiCloseLine style={{ fontSize: '0.85rem' }} /> Clear filters
          </button>
        )}
      </div>

      {/* Row 2: Sort pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '0.25rem' }}>
          <RiSortDesc /> Sort
        </div>

        {['date', 'amount', 'category'].map(opt => (
          <button
            key={opt}
            className={`filter-pill ${filters.sortBy === opt ? 'active' : ''}`}
            onClick={() => update('sortBy', opt)}
          >
            {opt === 'date' ? '📅' : opt === 'amount' ? '₹' : '🏷'} {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.15rem' }} />

        <button
          className={`filter-pill ${filters.sortDir === 'desc' ? 'active' : ''}`}
          onClick={() => update('sortDir', 'desc')}
        >
          ↓ Newest
        </button>
        <button
          className={`filter-pill ${filters.sortDir === 'asc' ? 'active' : ''}`}
          onClick={() => update('sortDir', 'asc')}
        >
          ↑ Oldest
        </button>
      </div>
    </div>
  )
}
