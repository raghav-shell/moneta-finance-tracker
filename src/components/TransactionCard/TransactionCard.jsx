import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { RiEditLine, RiDeleteBinLine, RiRepeatLine } from 'react-icons/ri'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../../utils/currencyFormatter'
import { useCurrency } from '../../hooks/useCurrency'
import { useFinance } from '../../context/FinanceContext'

export default function TransactionCard({ transaction, onEdit, inList = false }) {
  const { deleteTransaction } = useFinance()
  const { formatAmount } = useCurrency()
  const [confirming, setConfirming] = useState(false)
  const [hovered, setHovered]       = useState(false)
  const timeoutRef = useRef(null)

  const { id, title, amount, category, type, date, notes, recurring } = transaction
  const icon     = CATEGORY_ICONS[category] || '💳'
  const color    = CATEGORY_COLORS[category] || '#8E8E93'
  const isIncome = type === 'income'

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const handleDelete = () => {
    if (confirming) {
      deleteTransaction(id)
    } else {
      setConfirming(true)
      timeoutRef.current = setTimeout(() => setConfirming(false), 2800)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        padding: '0.875rem 1rem',
        background: hovered
          ? (inList ? 'var(--bg-hover)' : 'var(--bg-card-solid)')
          : (inList ? 'transparent' : 'var(--bg-card)'),
        borderRadius: inList ? 0 : 'var(--radius-lg)',
        border: inList ? 'none' : '1px solid var(--border-glass)',
        boxShadow: inList ? 'none' : (hovered ? 'var(--shadow-md)' : 'var(--shadow-glass)'),
        backdropFilter: inList ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: inList ? 'none' : 'blur(16px)',
        transition: 'background 0.18s ease, box-shadow 0.18s ease',
        cursor: 'default',
        position: 'relative',
      }}
    >

      {/* ── Category icon — soft background, no border or shadow ── */}
      <div style={{
        width: 42, height: 42,
        borderRadius: 13,
        background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.15rem',
        flexShrink: 0,
        transition: 'background 0.18s ease',
      }}>
        {icon}
      </div>

      {/* ── Info column ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Row 1: title  +  recurring pill (only if recurring) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '0.22rem',
        }}>
          <span style={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}>
            {title}
          </span>

          {recurring && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.22rem',
              fontSize: '0.62rem', fontWeight: 600,
              color: 'var(--purple)',
              background: 'var(--purple-light)',
              padding: '0.1rem 0.42rem',
              borderRadius: 99,
              letterSpacing: '0.3px',
              flexShrink: 0,
              textTransform: 'uppercase',
            }}>
              <RiRepeatLine style={{ fontSize: '0.65rem' }} />
              Recurring
            </span>
          )}
        </div>

        {/* Row 2: category chip  ·  date  ·  notes */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          overflow: 'hidden',
        }}>
          {/* Category — one soft chip, category color text on neutral bg */}
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 500,
            color: color,
            background: `${color}14`,
            padding: '0.1rem 0.5rem',
            borderRadius: 99,
            flexShrink: 0,
          }}>
            {category}
          </span>

          <span style={{ color: 'var(--border-strong)', fontSize: '0.7rem', flexShrink: 0 }}>·</span>

          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}>
            {date ? format(new Date(date + 'T00:00:00'), 'MMM d, yyyy') : ''}
          </span>

          {notes && (
            <>
              <span style={{ color: 'var(--border-strong)', fontSize: '0.7rem', flexShrink: 0 }}>·</span>
              <span style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {notes}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Amount — income=green, expense=red, both strong ── */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        fontSize: '0.92rem',
        color: isIncome ? 'var(--green)' : 'var(--red)',
        flexShrink: 0,
        textAlign: 'right',
        letterSpacing: '-0.2px',
        minWidth: 76,
      }}>
        {isIncome ? '+' : '−'}{formatAmount(amount)}
      </div>

      {/* ── Action buttons — fade in on hover ── */}
      <motion.div
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }}
        transition={{ duration: 0.15 }}
        style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}
      >
        <button
          onClick={() => onEdit(transaction)}
          className="btn btn-ghost"
          style={{ padding: '0.3rem 0.45rem', fontSize: '0.82rem', borderRadius: 7 }}
        >
          <RiEditLine />
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-danger"
          style={{
            padding: '0.3rem 0.45rem',
            borderRadius: 7,
            fontSize: confirming ? '0.62rem' : '0.82rem',
            minWidth: confirming ? 64 : 'auto',
          }}
        >
          {confirming ? 'Confirm?' : <RiDeleteBinLine />}
        </button>
      </motion.div>
    </motion.div>
  )
}
