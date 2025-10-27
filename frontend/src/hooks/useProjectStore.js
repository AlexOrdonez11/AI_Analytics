import React from 'react'
import { api } from '../lib/api.js'

export function useProjectStore(user) {
  const [projects, setProjects] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const load = async () => {
      if (!user?.id && !user?._id) return
      setLoading(true); setError(null)
      try {
        const uid = user.id || user._id
        const list = await api.listProjectsByUser(uid)
        setProjects(list)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, user?._id])

  const createProject = async (name, description = '') => {
    const uid = user?.id || user?._id
    if (!uid) throw new Error('No user id')
    const created = await api.createProject({ name, description, user_id: uid })
    // fetch the full doc to include timestamps, etc., or optimistic add
    const full = await api.getProject(created.id)
    setProjects(prev => [full, ...prev])
    return full
  }

  return { projects, setProjects, createProject, loading, error }
}
