import React from 'react'
import Card from '../components/Card.jsx'
import TextInput from '../components/TextInput.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function LoginPage() {
  const [mode, setMode] = React.useState('login') // 'login' | 'register'
  const [firstname, setFirstname] = React.useState('')
  const [lastname, setLastname] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const { loginEmail, register, loading, error } = useAuth()

  const submit = async () => {
    if (mode === 'login') {
      await loginEmail(email, password)
    } else {
      await register({ firstname, lastname, email, password })
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-1">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="text-sm text-neutral-400 mb-6">
          {mode === 'login' ? 'Use your email and password.' : 'Register with your details.'}
        </p>

        <div className="space-y-3">
          {mode === 'register' && (
            <>
              <TextInput value={firstname} onChange={setFirstname} placeholder="First name" />
              <TextInput value={lastname} onChange={setLastname} placeholder="Last name" />
            </>
          )}
          <TextInput value={email} onChange={setEmail} placeholder="you@company.com" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
          />

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button
            disabled={loading}
            onClick={submit}
            className="w-full rounded-xl bg-cyan-500 px-3 py-2 font-medium hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? 'Working…' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="hover:text-cyan-300">
              {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}