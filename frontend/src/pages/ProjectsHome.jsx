import React from 'react'
import Card from '../components/Card.jsx'

export default function ProjectsHome({ projects, onOpen, onCreate }) {
  const [name, setName] = React.useState('')
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Your Analytics Projects</h2>
          <p className="text-sm text-neutral-400">Create, organize, and open workspaces.</p>
        </div>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New project name" className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" />
          <button onClick={() => { const nm = name.trim() || `Project ${new Date().toLocaleString()}`; const p = onCreate(nm); setName(''); onOpen(p.id) }} className="rounded-xl bg-cyan-500 px-3 py-2 text-sm font-medium hover:bg-cyan-400">Create</button>
        </div>
      </div>
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
            <div className="mt-3 text-xs text-neutral-500">Updated {new Date(p.updatedAt).toLocaleString()}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
