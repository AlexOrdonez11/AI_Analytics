import React from 'react'
export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-lg ${className}`}>{children}</div>
  )
}
