import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useBudget } from '../../hooks/useBudget'
import { useCurrency } from '../../hooks/useCurrency'
import { RiArrowRightSLine, RiAlertLine } from 'react-icons/ri'

export default function BudgetCard() {
  const { monthlyBudget, totalExpenses, remaining, percentUsed, isOverBudget } = useBudget()
  const { formatAmount } = useCurrency()

  const color   = isOverBudget ? 'var(--red)'    : percentUsed > 75 ? 'var(--orange)'    : 'var(--green)'
  const bgColor = isOverBudget ? 'var(--red-light)' : percentUsed > 75 ? 'var(--orange-light)' : 'var(--green-light)'
  const glowColor = isOverBudget ? 'var(--red-glow)' : percentUsed > 75 ? 'var(--orange-glow)'  : 'var(--green-glow)'

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem 1.75rem',
      boxShadow: 'var(--shadow-glass)',
      border: '1px solid var(--border-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      overflow: 'hidden',
    }}>
      {/* Ambient glow orb */}
      <div style={{ position: 'absolute', bottom: -30, right: -20, width: 120, height: 120, background: glowColor, borderRadius: '50%', filter: 'blur(40px)', opacity: 0.7, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '0.3rem' }}>
              Monthly Budget
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
              {formatAmount(monthlyBudget)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '0.3rem' }}>
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 600, color, letterSpacing: '-0.8px' }}>
              {isOverBudget ? '−' : ''}{formatAmount(Math.abs(remaining))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.65rem' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${color}, ${color}bb)`, boxShadow: `0 0 8px ${color}66` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Spent{' '}
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatAmount(totalExpenses)}
            </span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isOverBudget && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--red)', background: 'var(--red-light)', padding: '0.2rem 0.55rem', borderRadius: 99, fontWeight: 600 }}>
                <RiAlertLine /> Over budget
              </span>
            )}
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color, background: bgColor, padding: '0.18rem 0.6rem', borderRadius: 99 }}>
              {percentUsed.toFixed(1)}% used
            </span>
            <Link to="/budget" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Manage <RiArrowRightSLine />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
