// hooks/useBudget.js
import { useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'
import { format } from 'date-fns'

export function useBudget() {
  const { transactions, budget, updateBudget } = useFinance()

  const stats = useMemo(() => {
    const currentMonth = format(new Date(), 'yyyy-MM')
    // ── Current-month slices (for budget tracking) ──────────────
    const thisMonthExpenses = transactions.filter(t => {
      const tMonth = t.date ? t.date.substring(0, 7) : ''
      return t.type === 'expense' && tMonth === currentMonth
    })
    const thisMonthIncome = transactions.filter(t => {
      const tMonth = t.date ? t.date.substring(0, 7) : ''
      return t.type === 'income' && tMonth === currentMonth
    })

    // ── All-time slices (for dashboard stats and analytics) ──────
    const allExpenses = transactions.filter(t => t.type === 'expense')
    const allIncome   = transactions.filter(t => t.type === 'income')

    // Current month totals — used for budget progress bar
    const totalExpenses     = thisMonthExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0)
    const totalIncome       = thisMonthIncome.reduce((s, t) => s + (Number(t.amount) || 0), 0)

    // All-time totals — used for dashboard cards and analytics
    const allTimeExpenses   = allExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0)
    const allTimeIncome     = allIncome.reduce((s, t) => s + (Number(t.amount) || 0), 0)

    const remaining   = budget.monthlyBudget - totalExpenses
    const percentUsed = budget.monthlyBudget > 0
      ? Math.min((totalExpenses / budget.monthlyBudget) * 100, 100)
      : 0

    // Net balance is always all-time
    const netBalance = allTimeIncome - allTimeExpenses

    // Top category is all-time
    const categoryMap = {}
    allExpenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + (Number(t.amount) || 0)
    })
    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]

    return {
      // current-month (budget page)
      totalExpenses,
      totalIncome,
      remaining,
      percentUsed,
      monthlyBudget: budget.monthlyBudget,
      isOverBudget: totalExpenses > budget.monthlyBudget,

      // all-time (dashboard + analytics)
      allTimeIncome,
      allTimeExpenses,
      netBalance,
      topCategory:       topCategory ? topCategory[0] : 'N/A',
      topCategoryAmount: topCategory ? topCategory[1] : 0,
    }
  }, [transactions, budget])

  return { ...stats, updateBudget, budget }
}
