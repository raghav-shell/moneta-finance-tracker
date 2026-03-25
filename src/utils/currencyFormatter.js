export const CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Subscriptions', 'Income', 'Other',
]

export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c !== 'Income')

export const CATEGORY_COLORS = {
  Food:           '#FF9500',
  Travel:         '#5AC8FA',
  Rent:           '#AF52DE',
  Shopping:       '#FF2D55',
  Entertainment:  '#5E5CE6',
  Health:         '#34C759',
  Utilities:      '#FFCC00',
  Subscriptions:  '#FF6B35',
  Income:         '#0071E3',
  Other:          '#8E8E93',
}

export const CATEGORY_BG = {
  Food:           'rgba(255,149,0,0.1)',
  Travel:         'rgba(90,200,250,0.1)',
  Rent:           'rgba(175,82,222,0.1)',
  Shopping:       'rgba(255,45,85,0.1)',
  Entertainment:  'rgba(94,92,230,0.1)',
  Health:         'rgba(52,199,89,0.1)',
  Utilities:      'rgba(255,204,0,0.1)',
  Subscriptions:  'rgba(255,107,53,0.1)',
  Income:         'rgba(0,113,227,0.1)',
  Other:          'rgba(142,142,147,0.1)',
}

export const CATEGORY_ICONS = {
  Food:           '🍔',
  Travel:         '✈️',
  Rent:           '🏠',
  Shopping:       '🛍️',
  Entertainment:  '🎬',
  Health:         '💊',
  Utilities:      '⚡',
  Subscriptions:  '📱',
  Income:         '💰',
  Other:          '📌',
}

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY']

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0,
  }).format(amount)
}
