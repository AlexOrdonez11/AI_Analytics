import React from 'react'
import Card from '../components/Card.jsx'

export default function ProjectsHome({ projects, onOpen, onCreate }) {
  const [name, setName] = React.useState('')
  const [desc, setDesc] = React.useState('') // optional description
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const create = async () => {
    setLoading(true); setError(null)
    try {
      const nm = name.trim() || `Project ${new Date().toLocaleString()}`
      const p = await onCreate(nm, desc)   // onCreate returns full project ({ id, ... })
      setName(''); setDesc('')
      onOpen(p.id)                         // <-- open with the newly created id
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Your Analytics Projects</h2>
          <p className="text-sm text-neutral-400">Create, organize, and open workspaces.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          {/* Optional description input */}
          {/* <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" /> */}
          <button
            disabled={loading}
            onClick={create}
            className="rounded-xl bg-cyan-500 px-3 py-2 text-sm font-medium hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="p-4 hover:border-cyan-500 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-sm text-neutral-400 line-clamp-2">{p.description || 'No description'}</p>
              </div>
              <button onClick={() => onOpen(p.id)} className="text-cyan-400 text-sm hover:underline">Open</button>
            </div>
            <div className="mt-3 text-xs text-neutral-500">
              Updated {new Date(p.updatedAt).toLocaleString?.() || new Date(p.updatedAt).toString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}