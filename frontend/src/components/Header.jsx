import React from 'react'
import { routes } from '../hooks/useHashRoute.js'

export default function Header({ user, onLogout, onNav }) {
  return (
    <header className="w-full sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400" />
          <span className="text-lg font-semibold">Analytics AI</span>
        </div>
        <nav className="ml-6 hidden md:flex gap-4 text-sm">
          <button onClick={() => onNav(routes.projects)} className="hover:text-cyan-300">Projects</button>
          <button onClick={() => onNav(routes.workspace)} className="hover:text-cyan-300">Workspace</button>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm text-neutral-300 hidden sm:inline">{user.email}</span>
              <button onClick={onLogout} className="text-sm px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700">Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
