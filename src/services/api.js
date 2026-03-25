// services/api.js
import axios from 'axios'

const EXCHANGE_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/INR'

export const fetchExchangeRates = async () => {
  try {
    const res = await axios.get(EXCHANGE_BASE_URL)
    return res.data.rates
  } catch (err) {
    console.error('Failed to fetch exchange rates:', err)
    // Return fallback approximate rates
    return { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.77, INR: 1 }
  }
}

export const fetchFinancialNews = async () => {
  // Optional: integrate newsapi.org here
  return []
}
