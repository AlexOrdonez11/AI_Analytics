import React from 'react'
import { storage } from '../lib/storage.js'
import { api } from '../lib/api.js'

export function useAuth() {
  const [user, setUser] = React.useState(() => storage.get('auth:user', null))
  const [userId, setUserId] = React.useState(() => storage.get('auth:userId', null))
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const loginEmail = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const { id } = await api.loginEmail(email, password)
      storage.set('auth:userId', id)
      setUserId(id)
      const me = await api.meByEmail(email)
      storage.set('auth:user', me)
      setUser(me)
    } catch (e) {
      setError(e.message); throw e
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ firstname, lastname, email, password }) => {
    setLoading(true); setError(null)
    try {
      await api.register({ firstname, lastname, email, password })
      await loginEmail(email, password) // auto-login
    } catch (e) {
      setError(e.message); throw e
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setUserId(null)
    storage.remove('auth:user')
    storage.remove('auth:userId')
  }

  return { user, userId, loading, error, loginEmail, register, logout }
}