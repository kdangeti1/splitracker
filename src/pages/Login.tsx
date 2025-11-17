import React from 'react'
import { signInWithGoogle, useAuth, signInWithEmail, signUpWithEmail } from '../firebase/config'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const user = useAuth()
  const nav = useNavigate()
  const [isNew, setIsNew] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (user) nav('/')
  }, [user])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isNew) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err: any) {
      setError(err?.message || 'Auth error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h1>{isNew ? 'Create account' : 'Sign in'}</h1>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <br />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isNew ? 'Create account' : 'Sign in'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => signInWithGoogle()} style={{ marginRight: 8 }}>
          Continue with Google
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setIsNew((v) => !v)}>
          {isNew ? 'Have an account? Sign in' : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  )
}
