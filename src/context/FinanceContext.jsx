import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-toastify'
import { fetchExchangeRates } from '../services/api'

const FinanceContext = createContext(null)

const STORAGE_KEYS = {
  TRANSACTIONS: 'moneta_transactions',
  BUDGET: 'moneta_budget',
}

const SEED_TRANSACTIONS = [
  { id: uuidv4(), title: 'Salary', amount: 75000, category: 'Income', type: 'income', date: '2024-11-01', notes: 'Monthly salary', recurring: true },
  { id: uuidv4(), title: 'Apartment Rent', amount: 18000, category: 'Rent', type: 'expense', date: '2024-11-02', notes: '', recurring: true },
  { id: uuidv4(), title: 'Swiggy Food Order', amount: 850, category: 'Food', type: 'expense', date: '2024-11-03', notes: 'Dinner with friends', recurring: false },
  { id: uuidv4(), title: 'Netflix Subscription', amount: 649, category: 'Subscriptions', type: 'expense', date: '2024-11-04', notes: '', recurring: true },
  { id: uuidv4(), title: 'Grocery Shopping', amount: 3200, category: 'Shopping', type: 'expense', date: '2024-11-05', notes: 'Big Bazaar monthly', recurring: false },
  { id: uuidv4(), title: 'Freelance Project', amount: 20000, category: 'Income', type: 'income', date: '2024-11-10', notes: 'React dashboard project', recurring: false },
  { id: uuidv4(), title: 'Gym Membership', amount: 1500, category: 'Health', type: 'expense', date: '2024-11-11', notes: '', recurring: true },
  { id: uuidv4(), title: 'Uber Rides', amount: 1200, category: 'Travel', type: 'expense', date: '2024-11-12', notes: 'Weekly commute', recurring: false },
  { id: uuidv4(), title: 'Electricity Bill', amount: 2200, category: 'Utilities', type: 'expense', date: '2024-11-13', notes: '', recurring: true },
  { id: uuidv4(), title: 'Movie Tickets', amount: 600, category: 'Entertainment', type: 'expense', date: '2024-11-15', notes: 'PVR IMAX', recurring: false },
  { id: uuidv4(), title: 'Zomato Order', amount: 450, category: 'Food', type: 'expense', date: '2024-11-17', notes: 'Lunch', recurring: false },
  { id: uuidv4(), title: 'Amazon Shopping', amount: 2800, category: 'Shopping', type: 'expense', date: '2024-11-18', notes: 'Electronics', recurring: false },
  { id: uuidv4(), title: 'Spotify Premium', amount: 119, category: 'Subscriptions', type: 'expense', date: '2024-11-20', notes: '', recurring: true },
  { id: uuidv4(), title: 'Doctor Visit', amount: 800, category: 'Health', type: 'expense', date: '2024-11-22', notes: 'Annual checkup', recurring: false },
  { id: uuidv4(), title: 'Internet Bill', amount: 999, category: 'Utilities', type: 'expense', date: '2024-11-25', notes: 'Jio Fiber', recurring: true },
  { id: uuidv4(), title: 'Side Income', amount: 8000, category: 'Income', type: 'income', date: '2024-11-28', notes: 'Tutoring sessions', recurring: false },
]

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      if (!stored) return SEED_TRANSACTIONS
      const parsed = JSON.parse(stored)
      // Guard: ensure it's a valid non-empty array of objects
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_TRANSACTIONS
    } catch {
      return SEED_TRANSACTIONS
    }
  })

  const [budget, setBudget] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGET)
      if (!stored) return { monthlyBudget: 50000 }
      const parsed = JSON.parse(stored)
      // Guard: ensure monthlyBudget is a valid positive number
      const val = parseFloat(parsed?.monthlyBudget)
      return (!isNaN(val) && val > 0) ? { monthlyBudget: val } : { monthlyBudget: 50000 }
    } catch {
      return { monthlyBudget: 50000 }
    }
  })

  const [currency, setCurrency] = useState(() => {
    try { return localStorage.getItem('moneta_currency') || 'INR' } catch { return 'INR' }
  })
  const [exchangeRates, setExchangeRates] = useState({})
  const [ratesLoading, setRatesLoading] = useState(false)

  // Persist currency preference
  useEffect(() => {
    try { localStorage.setItem('moneta_currency', currency) } catch {}
  }, [currency])

  // Fetch exchange rates whenever currency changes (or on mount)
  useEffect(() => {
    if (currency === 'INR') {
      // INR is the base — no conversion needed, clear rates loading
      setExchangeRates({})
      setRatesLoading(false)
      return
    }
    let cancelled = false
    setRatesLoading(true)
    fetchExchangeRates().then(rates => {
      if (!cancelled) {
        setExchangeRates(rates)
        setRatesLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setRatesLoading(false)
    })
    return () => { cancelled = true }
  }, [currency])

  // Persist transactions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget))
  }, [budget])

  // Add a transaction
  const addTransaction = useCallback((data) => {
    const newTransaction = {
      id: uuidv4(),
      ...data,
      amount: parseFloat(data.amount),
    }
    setTransactions(prev => [newTransaction, ...prev])
    toast.success('Transaction added successfully!')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update a transaction
  const updateTransaction = useCallback((id, data) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...data, amount: parseFloat(data.amount) } : t)
    )
    toast.success('Transaction updated!')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Delete a transaction
  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
    toast.info('Transaction deleted.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update budget
  const updateBudget = useCallback((newBudget) => {
    const parsed = parseFloat(newBudget)
    if (isNaN(parsed) || parsed <= 0) return
    setBudget({ monthlyBudget: parsed })
    toast.success('Budget updated!')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    budget,
    updateBudget,
    currency,
    setCurrency,
    exchangeRates,
    setExchangeRates,
    ratesLoading,
    setRatesLoading,
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) throw new Error('useFinance must be used within FinanceProvider')
  return context
}

export default FinanceContext
