import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiArrowLeftLine } from 'react-icons/ri'
import TransactionForm from './TransactionForm'

export default function AddTransaction() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/transactions" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          color: 'var(--accent)', textDecoration: 'none',
          fontSize: '0.875rem', fontWeight: 500,
          marginBottom: '1.75rem',
        }}>
          <RiArrowLeftLine /> Back
        </Link>

        <div className="page-header">
          <div className="page-title-wrap"><h1 className="page-title">New Entry</h1></div>
          <p className="page-subtitle">Record an income or expense transaction</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        style={{ maxWidth: 580 }}
      >
        <div className="card" style={{ padding: '2rem' }}>
          <TransactionForm />
        </div>
      </motion.div>
    </div>
  )
}
