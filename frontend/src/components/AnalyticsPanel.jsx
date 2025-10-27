import React from 'react'
import AnalyticsCard from './AnalyticsCard.jsx'
import Card from './Card.jsx'

export default function AnalyticsPanel({ items, setItems }) {
  const runItem = (id) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'running' } : it)))
    setTimeout(() => {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'done' } : it)))
    }, 900)
  }
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id))
  const renameItem = (id, title) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, title } : it)))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-300">Analytics ({items.length})</h3>
        <span className="text-xs text-neutral-500">Split view auto-enabled</span>
      </div>
      {items.length === 0 ? (
        <Card className="p-4 text-sm text-neutral-400">No analytics yet. Ask for an analysis in chat.</Card>
      ) : (
        items.map((it) => (
          <AnalyticsCard key={it.id} item={it} onRun={runItem} onRemove={removeItem} onRename={renameItem} />
        ))
      )}
    </div>
  )
}
