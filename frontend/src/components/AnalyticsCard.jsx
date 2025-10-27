import React from 'react'
import Card from './Card.jsx'
import PlaceholderChart from './PlaceholderChart.jsx'

export default function AnalyticsCard({ item, onRun, onRemove, onRename }) {
  const [editing, setEditing] = React.useState(false)
  const [title, setTitle] = React.useState(item.title)
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          {!editing ? (
            <h4 className="font-medium">{item.title}</h4>
          ) : (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => { setEditing(false); onRename(item.id, title.trim() || item.title) }}
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
              autoFocus
            />
          )}
          <div className="text-xs mt-1 text-neutral-400">{item.kind} • {item.status}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing((v) => !v)} className="text-xs px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700">Rename</button>
          <button onClick={() => onRun(item.id)} className="text-xs px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500">Run</button>
          <button onClick={() => onRemove(item.id)} className="text-xs px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700">Remove</button>
        </div>
      </div>
      <div className="mt-3">
        <PlaceholderChart />
      </div>
      {item.payload?.variables?.length ? (
        <div className="mt-3 text-xs text-neutral-400">Vars: {item.payload.variables.join(', ')}</div>
      ) : null}
    </Card>
  )
}
