# FinTrack — Personal Finance & Expense Analytics App

A premium React-based Personal Finance app built for the classroom project.

---

## 🚀 Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:5173
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar/          — Sidebar navigation (desktop + mobile drawer)
│   ├── TransactionCard/ — Individual transaction row with edit/delete
│   ├── Charts/          — Pie, Line, Bar charts (Recharts)
│   ├── SearchBar/       — Live search input
│   ├── Filters/         — Category, type, date range, sort filters
│   └── BudgetCard/      — Animated budget progress bar
├── pages/
│   ├── Dashboard/       — Overview: stats, charts, recent transactions
│   ├── Transactions/    — Full list with search, filter, edit modal
│   ├── AddTransaction/  — Form page with react-hook-form + yup
│   ├── Budget/          — Budget tracker + category breakdown + recurring
│   └── Analytics/       — Full analytics: all 3 charts + MoM comparison
├── context/
│   └── FinanceContext.jsx — Global state (Context API + localStorage)
├── hooks/
│   ├── useTransactions.js — Filtered/sorted transaction list
│   ├── useBudget.js        — Budget calculations
│   ├── useDebounce.js      — Search debounce (350ms)
│   └── useCurrency.js      — Currency formatting + conversion
├── services/
│   └── api.js             — Exchange rate API (exchangerate-api.com)
└── utils/
    └── currencyFormatter.js — Categories, colors, icons config
```

---

## ✅ Features Implemented

| Feature | Status |
|---|---|
| Add / Edit / Delete Transactions | ✅ |
| Income & Expense types | ✅ |
| All 8 expense categories | ✅ |
| react-hook-form + yup validation | ✅ |
| Search by title/notes (debounced) | ✅ |
| Filter by category, type, date range | ✅ |
| Sort by date, amount, category | ✅ |
| Monthly budget tracking | ✅ |
| Remaining budget + % used | ✅ |
| Pie chart (spending by category) | ✅ |
| Line chart (monthly trend) | ✅ |
| Bar chart (income vs expense) | ✅ |
| Recurring expense marking | ✅ |
| Context API global state | ✅ |
| Custom hooks (4 hooks) | ✅ |
| React Router DOM (5 routes) | ✅ |
| Currency exchange API | ✅ |
| Mobile responsive | ✅ |
| Framer Motion animations | ✅ |
| localStorage persistence | ✅ |

---

## 📦 npm Packages Used

| Package | Purpose |
|---|---|
| react-router-dom | Page routing |
| axios | API requests |
| react-icons | Icon library |
| react-toastify | Toast notifications |
| react-hook-form | Form handling |
| yup | Validation schema |
| recharts | Charts (Pie, Line, Bar) |
| date-fns | Date formatting |
| uuid | Unique transaction IDs |
| framer-motion | Animations |

---

## 🎨 Design

- **Theme**: Dark luxury fintech (inspired by Robinhood + Bloomberg)
- **Fonts**: Syne (display) + DM Sans (body) + JetBrains Mono (numbers)
- **Colors**: Deep space black background, electric teal accent, gold for income, red for expenses
- **Animations**: Staggered page-load reveals, progress bar transitions, card hover effects
