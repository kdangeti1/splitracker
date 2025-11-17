import React from 'react'
import {
  useAuth,
  fetchGroupsForUser,
  fetchPendingInvites,
  acceptInvite,
  signOutUser,
} from '../firebase/config'

export default function Dashboard() {
  const user = useAuth()
  const [groups, setGroups] = React.useState<any[]>([])
  const [invites, setInvites] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    Promise.all([fetchGroupsForUser(user.uid), fetchPendingInvites(user.email || '')])
      .then(([g, i]) => {
        setGroups(g)
        setInvites(i)
      })
      .catch((err) => setError(err?.message || 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [user])

  async function handleAcceptInvite(inviteId: string, groupId: string) {
    if (!user) return
    try {
      await acceptInvite(inviteId, groupId, user.uid)
      setInvites(invites.filter((i) => i.id !== inviteId))
      setGroups((g) => [
        ...g,
        { id: groupId, name: invites.find((i) => i.id === inviteId)?.groupName },
      ])
    } catch (err: any) {
      setError(err?.message || 'Failed to accept invite')
    }
  }

  async function handleDeclineInvite(inviteId: string) {
    // For now, just remove from UI; in production you might mark as declined in Firestore
    setInvites(invites.filter((i) => i.id !== inviteId))
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {user?.email}</p>
      <button onClick={() => signOutUser()}>Sign out</button>
      <a href="/create-group" style={{ marginLeft: 8, textDecoration: 'none' }}>
        <button>Create group</button>
      </a>

      {error && <div style={{ color: 'crimson', margin: '16px 0' }}>{error}</div>}
      {loading && <p>Loading...</p>}

      {invites.length > 0 && (
        <>
          <h2>Pending invites ({invites.length})</h2>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {invites.map((inv) => (
              <li
                key={inv.id}
                style={{ marginBottom: 12, padding: 12, border: '1px solid #ddd', borderRadius: 4 }}
              >
                <div>
                  <strong>{inv.groupName}</strong>
                  <p style={{ margin: '4px 0', fontSize: 12, color: '#666' }}>
                    You're invited to join
                  </p>
                </div>
                <button
                  onClick={() => handleAcceptInvite(inv.id, inv.groupId)}
                  style={{ marginRight: 8 }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineInvite(inv.id)}
                  style={{ marginRight: 8, background: '#f0f0f0' }}
                >
                  Decline
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Your groups</h2>
      {groups.length === 0 ? (
        <p>No groups yet — create one to get started.</p>
      ) : (
        <ul>
          {groups.map((g) => (
            <li key={g.id}>
              <a href={`/group/${g.id}`}>{g.name || 'Untitled group'}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
