import React from 'react'
import { storage } from '../lib/storage.js'

export function useProjectStore(user) {
  const [projects, setProjects] = React.useState(() => storage.get('app:projects', [
    { id: 'p1', name: 'Retail Demand', description: 'Sales, promos, weather', updatedAt: Date.now() - 86400000 },
    { id: 'p2', name: 'Energy AMI', description: 'AMI 15-min meters', updatedAt: Date.now() - 3600000 },
  ]))
  React.useEffect(() => storage.set('app:projects', projects), [projects])
  const createProject = (name) => {
    const p = { id: crypto.randomUUID(), name, description: '', updatedAt: Date.now(), owner: user?.id }
    setProjects((prev) => [p, ...prev])
    return p
  }
  return { projects, setProjects, createProject }
}
