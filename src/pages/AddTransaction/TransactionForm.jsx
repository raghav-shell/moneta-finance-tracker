import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFinance } from '../../context/FinanceContext'
import { EXPENSE_CATEGORIES } from '../../utils/currencyFormatter'
import { format } from 'date-fns'

const schema = yup.object({
  title:     yup.string().trim().required('Title is required').min(2, 'Min 2 characters'),
  amount:    yup.number().typeError('Must be a number').positive('Must be positive').required('Amount is required'),
  category:  yup.string().required('Category is required'),
  type:      yup.string().oneOf(['income', 'expense']).required(),
  date:      yup.string().required('Date is required'),
  notes:     yup.string().optional(),
  recurring: yup.boolean(),
})

// Defined outside component to prevent remounting on every render (Bug 2 fix)
function TypeTab({ value, label, emoji, selectedType, register }) {
  const active = selectedType === value
  const isExp  = value === 'expense'
  return (
    <label style={{ flex: 1, cursor: 'pointer' }}>
      <input type="radio" value={value} {...register('type')} style={{ display: 'none' }} />
      <div style={{
        padding: '0.75rem 1rem', textAlign: 'center',
        borderRadius: 'var(--radius-sm)',
        border: `1.5px solid ${active ? (isExp ? 'rgba(255,59,48,0.3)' : 'rgba(52,199,89,0.3)') : 'var(--border)'}`,
        background: active ? (isExp ? 'var(--red-light)' : 'var(--green-light)') : 'var(--bg-input)',
        color: active ? (isExp ? 'var(--red)' : 'var(--green)') : 'var(--text-secondary)',
        fontWeight: active ? 600 : 400, fontSize: '0.875rem',
        transition: 'var(--transition)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
      }}>
        <span>{emoji}</span> {label}
      </div>
    </label>
  )
}

export default function TransactionForm({ defaultValues, isEditing = false, onSuccess }) {
  const { addTransaction, updateTransaction } = useFinance()
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues || {
      title: '', amount: '', category: '',
      type: 'expense', date: today, notes: '', recurring: false,
    },
  })

  const selectedType = watch('type')
  const isRecurring  = watch('recurring')

  // Reset category whenever type switches — always needed because
  // expense categories and income categories are completely different lists.
  // We track the previous type to only reset on actual changes, not on mount.
  const prevTypeRef = React.useRef(selectedType)
  useEffect(() => {
    if (prevTypeRef.current !== selectedType) {
      setValue('category', '')
      prevTypeRef.current = selectedType
    }
  }, [selectedType, setValue])

  const onSubmit = async (data) => {
    if (isEditing && defaultValues?.id) updateTransaction(defaultValues.id, data)
    else addTransaction(data)
    if (onSuccess) onSuccess()
    else navigate('/transactions')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Type selector */}
      <div className="form-group">
        <label className="form-label">Transaction Type</label>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <TypeTab value="expense" label="Expense" emoji="💸" selectedType={selectedType} register={register} />
          <TypeTab value="income"  label="Income"  emoji="💰" selectedType={selectedType} register={register} />
        </div>
      </div>

      {/* Title + Amount */}
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" placeholder="e.g. Netflix, Salary…" {...register('title')} />
          {errors.title && <span className="form-error">{errors.title.message}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input className="form-input" type="number" placeholder="0" step="1" min="1" {...register('amount')} />
          {errors.amount && <span className="form-error">{errors.amount.message}</span>}
        </div>
      </div>

      {/* Category + Date */}
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" {...register('category')}>
            <option value="">Select category</option>
            {selectedType === 'income'
              ? <option value="Income">💰 Income</option>
              : EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))
            }
          </select>
          {errors.category && <span className="form-error">{errors.category.message}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" {...register('date')} />
          {errors.date && <span className="form-error">{errors.date.message}</span>}
        </div>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label className="form-label">
          Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
        </label>
        <textarea className="form-textarea" placeholder="Any additional details…" {...register('notes')} />
      </div>

      {/* Recurring iOS toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" {...register('recurring')} style={{ display: 'none' }} />
        <div style={{
          width: 42, height: 24, borderRadius: 99,
          background: isRecurring ? 'var(--accent)' : 'var(--bg-input)',
          position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: 2, left: isRecurring ? 20 : 2,
            width: 20, height: 20, borderRadius: '50%', background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transition: 'left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Recurring transaction</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Repeats monthly (e.g. rent, subscriptions)</div>
        </div>
      </label>

      <motion.button
        type="submit" className="btn btn-primary" disabled={isSubmitting}
        whileTap={{ scale: 0.97 }}
        style={{ marginTop: '0.25rem', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 600, justifyContent: 'center', borderRadius: 'var(--radius)' }}
      >
        {isSubmitting ? 'Saving…' : isEditing ? '✓ Update Entry' : '+ Save Entry'}
      </motion.button>
    </form>
  )
}
