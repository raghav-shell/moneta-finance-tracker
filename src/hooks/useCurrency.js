// hooks/useCurrency.js
import { useCallback } from 'react'
import { useFinance } from '../context/FinanceContext'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

export function useCurrency() {
  const { currency, exchangeRates } = useFinance()

  const formatAmount = useCallback((amount, targetCurrency = currency) => {
    let converted = amount
    if (targetCurrency !== 'INR' && exchangeRates[targetCurrency]) {
      converted = amount * exchangeRates[targetCurrency]
    }

    const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency

    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(converted)
    } catch {
      return `${symbol}${converted.toLocaleString('en-IN')}`
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, exchangeRates])

  const formatCompact = useCallback((amount) => {
    // Convert from INR to target currency
    const converted = currency !== 'INR' && exchangeRates[currency]
      ? amount * exchangeRates[currency]
      : amount

    const sym = CURRENCY_SYMBOLS[currency] || currency

    if (converted >= 100000) return `${sym}${(converted / 100000).toFixed(1)}L`
    if (converted >= 1000)   return `${sym}${(converted / 1000).toFixed(1)}K`

    // For small values: format with Intl but pass amount as-is since it's already converted
    // Avoid calling formatAmount() which would convert AGAIN
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(converted)
    } catch {
      return `${sym}${converted.toLocaleString('en-IN')}`
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, exchangeRates])

  return { formatAmount, formatCompact, currency, symbol: CURRENCY_SYMBOLS[currency] || '₹' }
}
