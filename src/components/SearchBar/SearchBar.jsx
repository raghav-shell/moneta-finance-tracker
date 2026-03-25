import React, { useState } from 'react'
import { RiSearchLine, RiCloseLine } from 'react-icons/ri'

export default function SearchBar({ value, onChange, placeholder = 'Search transactions…' }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <RiSearchLine style={{
        position: 'absolute', left: '0.9rem', top: '50%',
        transform: 'translateY(-50%)',
        color: focused ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: '1rem', pointerEvents: 'none',
        transition: 'color 0.2s ease',
      }} />
      <input
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          paddingLeft: '2.6rem',
          paddingRight: value ? '2.6rem' : '1rem',
        }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          position: 'absolute', right: '0.75rem', top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--text-muted)', border: 'none',
          color: '#fff', cursor: 'pointer',
          width: 18, height: 18, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--text-muted)'}
        >
          <RiCloseLine style={{ fontSize: '0.75rem' }} />
        </button>
      )}
    </div>
  )
}
