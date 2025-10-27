import React from 'react'
import Header from './components/Header.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useHashRoute, routes } from './hooks/useHashRoute.js'
import { useProjectStore } from './hooks/useProjectStore.js'
import LoginPage from './pages/LoginPage.jsx'
import ProjectsHome from './pages/ProjectsHome.jsx'
import Workspace from './pages/Workspace.jsx'

export default function App() {
  const { user, login, logout } = useAuth()
  const { hash, push } = useHashRoute()
  const { projects, createProject } = useProjectStore(user)

  const [currentProjectId, setCurrentProjectId] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('app:currentProject')) || projects[0]?.id || 'p1' } catch { return 'p1' }
  })
  React.useEffect(() => localStorage.setItem('app:currentProject', JSON.stringify(currentProjectId)), [currentProjectId])

  React.useEffect(() => {
    if (!user) {
      push(routes.login)
    } else if (hash === routes.login) {
      push(routes.projects)
    }
  }, [user])

  const onOpenProject = (pid) => { setCurrentProjectId(pid); push(routes.workspace) }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Header user={user} onLogout={logout} onNav={push} />
      {!user ? (
        <LoginPage onLogin={login} />
      ) : hash === routes.projects ? (
        <ProjectsHome projects={projects} onCreate={createProject} onOpen={onOpenProject} />
      ) : (
        <Workspace projectId={currentProjectId} />
      )}
      <footer className="mt-12 py-8 text-center text-xs text-neutral-500">
        Built with ❤️ – Chat‑Driven Analytics UI.
      </footer>
    </div>
  )
}
