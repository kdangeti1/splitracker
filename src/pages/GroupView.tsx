import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useAuth,
  fetchGroup,
  fetchExpensesForGroup,
  createExpense,
  recordSettlement,
  fetchSettlementsForGroup,
  calculateNetBalances,
  sendInvite,
  logActivity,
  fetchActivityFeed,
  formatActivityMessage,
} from '../firebase/config'

export default function GroupView() {
  const { groupId } = useParams<{ groupId: string }>()
  const user = useAuth()
  const nav = useNavigate()

  const [group, setGroup] = React.useState<any | null>(null)
  const [expenses, setExpenses] = React.useState<any[]>([])
  const [settlements, setSettlements] = React.useState<any[]>([])
  const [activities, setActivities] = React.useState<any[]>([])
  const [balances, setBalances] = React.useState<Record<string, number>>({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Expense form state
  const [amount, setAmount] = React.useState('')
  const [payer, setPayer] = React.useState(user?.uid || '')
  const [description, setDescription] = React.useState('')
  const [splitsMode, setSplitsMode] = React.useState<'equal' | 'custom'>('equal')
  const [splits, setSplits] = React.useState<Record<string, number>>({})
  const [submitting, setSubmitting] = React.useState(false)

  // Settlement form state
  const [settlementFrom, setSettlementFrom] = React.useState(user?.uid || '')
  const [settlementTo, setSettlementTo] = React.useState('')
  const [settlementAmount, setSettlementAmount] = React.useState('')
  const [settlementDescription, setSettlementDescription] = React.useState('')
  const [settlementSubmitting, setSettlementSubmitting] = React.useState(false)

  // Invite form state
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteSubmitting, setInviteSubmitting] = React.useState(false)

  // Load group, expenses, and settlements
  React.useEffect(() => {
    if (!groupId || !user) return

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const g = await fetchGroup(groupId!)
        if (!g) {
          setError('Group not found')
          return
        }
        setGroup(g)

        const exps = await fetchExpensesForGroup(groupId!)
        setExpenses(exps)

        const setts = await fetchSettlementsForGroup(groupId!)
        setSettlements(setts)

        const acts = await fetchActivityFeed(groupId!)
        setActivities(acts)

        // Calculate net balances from expenses and settlements
        const netBals = calculateNetBalances(exps as any, setts as any)
        setBalances(netBals)

        // Initialize splits with all members equally
        const initialSplits: Record<string, number> = {}
        for (const memberId of (g as any).members) {
          initialSplits[memberId] = 0
        }
        setSplits(initialSplits)
        setPayer(user!.uid)
        setSettlementFrom(user!.uid)
      } catch (err: any) {
        setError(err?.message || 'Failed to load group')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [groupId, user])

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!groupId || !user || !group) return

    setSubmitting(true)
    setError(null)

    try {
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount')
      }

      // Calculate splits
      let splitMap = { ...splits }
      if (splitsMode === 'equal') {
        const share = amountNum / group.members.length
        splitMap = {}
        for (const memberId of group.members) {
          splitMap[memberId] = share
        }
      }

      await createExpense(groupId, amountNum, payer, splitMap, description)

      // Log activity
      await logActivity(groupId, 'expense_added', user.uid, {
        description,
        amount: amountNum,
        payer,
      })

      // Reload expenses
      const exps = await fetchExpensesForGroup(groupId)
      setExpenses(exps)

      const setts = await fetchSettlementsForGroup(groupId)
      setSettlements(setts)

      const acts = await fetchActivityFeed(groupId)
      setActivities(acts)

      const netBals = calculateNetBalances(exps as any, setts as any)
      setBalances(netBals)

      // Reset form
      setAmount('')
      setDescription('')
      setPayer(user!.uid)
    } catch (err: any) {
      setError(err?.message || 'Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddSettlement(e: React.FormEvent) {
    e.preventDefault()
    if (!groupId || !user || !group) return

    setSettlementSubmitting(true)
    setError(null)

    try {
      const settleAmountNum = parseFloat(settlementAmount)
      if (isNaN(settleAmountNum) || settleAmountNum <= 0) {
        throw new Error('Invalid settlement amount')
      }

      await recordSettlement(
        groupId,
        settlementFrom,
        settlementTo,
        settleAmountNum,
        settlementDescription
      )

      // Log activity
      await logActivity(groupId, 'settlement_recorded', user.uid, {
        from: settlementFrom,
        to: settlementTo,
        amount: settleAmountNum,
        description: settlementDescription,
      })

      // Reload settlements and recalculate balances
      const setts = await fetchSettlementsForGroup(groupId)
      setSettlements(setts)

      const exps = await fetchExpensesForGroup(groupId)
      const acts = await fetchActivityFeed(groupId)
      setActivities(acts)

      const netBals = calculateNetBalances(exps as any, setts as any)
      setBalances(netBals)

      // Reset settlement form
      setSettlementAmount('')
      setSettlementDescription('')
      setSettlementFrom(user.uid)
      setSettlementTo('')
    } catch (err: any) {
      setError(err?.message || 'Failed to record settlement')
    } finally {
      setSettlementSubmitting(false)
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!groupId || !group || user?.uid !== group.owner) {
      setError('Only group owner can invite members')
      return
    }

    setInviteSubmitting(true)
    setError(null)

    try {
      if (!inviteEmail.includes('@')) throw new Error('Invalid email')
      await sendInvite(groupId, inviteEmail, group.name)
      setInviteEmail('')
    } catch (err: any) {
      setError(err?.message || 'Failed to send invite')
    } finally {
      setInviteSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>
  if (error) return <div style={{ padding: 20, color: 'crimson' }}>{error}</div>
  if (!group) return <div style={{ padding: 20 }}>Group not found</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>{group.name || 'Untitled group'}</h1>
      <button onClick={() => nav('/')}>Back to dashboard</button>

      <h2>Members</h2>
      <ul>
        {group.members &&
          group.members.map((m: string) => (
            <li key={m}>{m === user?.uid ? `${user.email} (you)` : m}</li>
          ))}
      </ul>

      <h2>Balances</h2>
      <ul>
        {Object.entries(balances).map(([uid, balance]) => (
          <li key={uid}>
            {uid === user?.uid
              ? `You: ${balance >= 0 ? '+' : ''}${balance.toFixed(2)}`
              : `${uid}: ${balance >= 0 ? '+' : ''}${balance.toFixed(2)}`}
          </li>
        ))}
      </ul>

      <h2>Add expense</h2>
      <form onSubmit={handleAddExpense}>
        <div style={{ marginBottom: 8 }}>
          <label>Amount</label>
          <br />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Payer</label>
          <br />
          <select value={payer} onChange={(e) => setPayer(e.target.value)}>
            {group.members &&
              group.members.map((m: string) => (
                <option key={m} value={m}>
                  {m === user?.uid ? 'You' : m}
                </option>
              ))}
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Description</label>
          <br />
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>
            <input
              type="radio"
              checked={splitsMode === 'equal'}
              onChange={() => setSplitsMode('equal')}
            />
            Split equally
          </label>
        </div>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add expense'}
        </button>
      </form>

      <h2>Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul>
          {expenses.map((exp) => (
            <li key={exp.id}>
              {exp.description ? `${exp.description} - ` : ''}${exp.amount} (paid by{' '}
              {exp.payer === user?.uid ? 'you' : exp.payer})
            </li>
          ))}
        </ul>
      )}

      <h2>Record settlement</h2>
      <form onSubmit={handleAddSettlement}>
        <div style={{ marginBottom: 8 }}>
          <label>From</label>
          <br />
          <select value={settlementFrom} onChange={(e) => setSettlementFrom(e.target.value)}>
            {group?.members &&
              group.members.map((m: string) => (
                <option key={m} value={m}>
                  {m === user?.uid ? 'You' : m}
                </option>
              ))}
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>To</label>
          <br />
          <select value={settlementTo} onChange={(e) => setSettlementTo(e.target.value)}>
            <option value="">Select recipient...</option>
            {group?.members &&
              group.members.map((m: string) => (
                <option key={m} value={m}>
                  {m === user?.uid ? 'You' : m}
                </option>
              ))}
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Amount</label>
          <br />
          <input
            value={settlementAmount}
            onChange={(e) => setSettlementAmount(e.target.value)}
            type="number"
            step="0.01"
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Note</label>
          <br />
          <input
            value={settlementDescription}
            onChange={(e) => setSettlementDescription(e.target.value)}
            placeholder="e.g., Cash payment"
          />
        </div>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={settlementSubmitting}>
          {settlementSubmitting ? 'Recording...' : 'Record settlement'}
        </button>
      </form>

      <h2>Settlement history</h2>
      {settlements.length === 0 ? (
        <p>No settlements yet.</p>
      ) : (
        <ul>
          {settlements.map((s) => (
            <li key={s.id}>
              {s.from === user?.uid ? 'You' : s.from} paid {s.to === user?.uid ? 'you' : s.to} $
              {s.amount.toFixed(2)}
              {s.description && ` (${s.description})`}
            </li>
          ))}
        </ul>
      )}

      {user?.uid === group?.owner && (
        <>
          <h2>Invite members</h2>
          <form onSubmit={handleSendInvite}>
            <div style={{ marginBottom: 8 }}>
              <label>Email</label>
              <br />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="invited@example.com"
                required
              />
            </div>
            {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
            <button type="submit" disabled={inviteSubmitting}>
              {inviteSubmitting ? 'Sending...' : 'Send invite'}
            </button>
          </form>
        </>
      )}

      <h2>Activity feed</h2>
      {activities.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {activities.map((act) => (
            <li
              key={act.id}
              style={{
                marginBottom: 12,
                padding: 8,
                background: '#f9f9f9',
                borderLeft: '3px solid #007bff',
              }}
            >
              <div style={{ fontSize: 12, color: '#666' }}>
                {new Date(act.timestamp).toLocaleString()}
              </div>
              <div>{formatActivityMessage(act, user?.email || '')}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
