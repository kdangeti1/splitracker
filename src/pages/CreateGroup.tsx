import React from 'react'
import { createGroup, useAuth } from '../firebase/config'
import { useNavigate } from 'react-router-dom'

export default function CreateGroup() {
  const user = useAuth()
  const nav = useNavigate()
  const [name, setName] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return nav('/login')
    setError(null)
    setLoading(true)
    try {
      await createGroup(name, user.uid)
      nav('/')
    } catch (err: any) {
      setError(err?.message || 'Could not create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Create group</h1>
      <form onSubmit={submit}>
        <div>
          <label>Group name</label>
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
