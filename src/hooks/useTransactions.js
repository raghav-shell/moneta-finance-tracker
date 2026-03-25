// hooks/useTransactions.js
import { useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'

export function useTransactions({ search = '', category = '', type = '', sortBy = 'date', sortDir = 'desc', dateFrom = '', dateTo = '' } = {}) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance()

  const filtered = useMemo(() => {
    let result = [...transactions]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      )
    }

    // Filter by category
    if (category) {
      result = result.filter(t => t.category === category)
    }

    // Filter by type
    if (type) {
      result = result.filter(t => t.type === type)
    }

    // Filter by date range
    // Bug 6 fix: guard against transactions with null/missing dates
    if (dateFrom) {
      result = result.filter(t => t.date && new Date(t.date + 'T00:00:00') >= new Date(dateFrom + 'T00:00:00'))
    }
    if (dateTo) {
      result = result.filter(t => t.date && new Date(t.date + 'T00:00:00') <= new Date(dateTo + 'T00:00:00'))
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB
      if (sortBy === 'date') {
        valA = a.date ? new Date(a.date + 'T00:00:00') : new Date(0)
        valB = b.date ? new Date(b.date + 'T00:00:00') : new Date(0)
      } else if (sortBy === 'amount') {
        valA = a.amount
        valB = b.amount
      } else if (sortBy === 'category') {
        valA = a.category
        valB = b.category
      } else {
        valA = a[sortBy]
        valB = b[sortBy]
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [transactions, search, category, type, sortBy, sortDir, dateFrom, dateTo])

  return { transactions: filtered, addTransaction, updateTransaction, deleteTransaction }
}
