import React from 'react'
export const routes = { login: '#/login', projects: '#/projects', workspace: '#/workspace' }

export function useHashRoute() {
  const [hash, setHash] = React.useState(() => window.location.hash || routes.login)
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || routes.login)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const push = (h) => { if (window.location.hash !== h) window.location.hash = h }
  return { hash, push }
}
