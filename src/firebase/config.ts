import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  type CollectionReference,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import React from 'react'

// Read env vars via import.meta (Vite). Provide helpful runtime checks.
const env = (import.meta as any).env || {}
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
}

if (!firebaseConfig.apiKey) {
  // Not throwing to keep dev server usable, but warn loudly.
  // In production you should set these env vars in Vercel / .env.local
  // eslint-disable-next-line no-console
  console.warn('Firebase config not found in env. Add VITE_FIREBASE_* variables.')
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

export { auth, db, googleProvider }

// Basic auth hook
export function useAuth(): FirebaseUser | null {
  const [user, setUser] = React.useState<FirebaseUser | null>(auth.currentUser)

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: FirebaseUser | null) => {
      setUser(u)
      if (u) {
        // ensure user doc exists
        const uDoc = doc(db, 'users', u.uid)
        const snap = await getDoc(uDoc)
        if (!snap.exists()) {
          await setDoc(uDoc, {
            uid: u.uid,
            displayName: u.displayName || null,
            email: u.email || null,
            photoURL: u.photoURL || null,
            createdAt: Date.now(),
          })
        }
      }
    })
    return () => unsub()
  }, [])

  return user
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export function signOutUser() {
  return signOut(auth)
}

// Firestore helpers: groups
export async function fetchGroupsForUser(uid: string) {
  const q = query(collection(db, 'groups'), where('members', 'array-contains', uid))
  const snaps = await getDocs(q)
  return snaps.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  }))
}

// Email/password auth helpers
export async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

// Create a new group with the given name and initial member
export async function createGroup(name: string, ownerUid: string) {
  const groupsCol = collection(db, 'groups') as CollectionReference<DocumentData>
  const docRef = await addDoc(groupsCol, {
    name,
    members: [ownerUid],
    createdAt: Date.now(),
    owner: ownerUid,
  })
  return { id: docRef.id }
}

// Fetch a single group by ID
export async function fetchGroup(groupId: string) {
  const gRef = doc(db, 'groups', groupId)
  const snap = await getDoc(gRef)
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as DocumentData) }
}

// Create an expense in a group
export async function createExpense(
  groupId: string,
  amount: number,
  payer: string,
  splits: Record<string, number>,
  description?: string
) {
  const expensesCol = collection(
    db,
    'groups',
    groupId,
    'expenses'
  ) as CollectionReference<DocumentData>
  const docRef = await addDoc(expensesCol, {
    amount,
    payer,
    splits,
    description: description || '',
    createdAt: Date.now(),
  })
  return { id: docRef.id }
}

// Fetch all expenses for a group
export async function fetchExpensesForGroup(groupId: string) {
  const expensesCol = collection(db, 'groups', groupId, 'expenses')
  const snaps = await getDocs(expensesCol)
  return snaps.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  }))
}

// Calculate balances for a group: returns {uid: balance} where positive = owed to them, negative = they owe
export function calculateBalances(
  expenses: Array<{ amount: number; payer: string; splits: Record<string, number> }>
): Record<string, number> {
  const balances: Record<string, number> = {}

  for (const expense of expenses) {
    if (!balances[expense.payer]) balances[expense.payer] = 0

    // Payer paid the full amount, so they should be reimbursed
    balances[expense.payer] += expense.amount

    // Each person in splits owes their share
    for (const [uid, share] of Object.entries(expense.splits)) {
      if (!balances[uid]) balances[uid] = 0
      balances[uid] -= share
    }
  }

  return balances
}

// Record a settlement (payment between two users)
export async function recordSettlement(
  groupId: string,
  fromUid: string,
  toUid: string,
  amount: number,
  description?: string
) {
  const settlementsCol = collection(
    db,
    'groups',
    groupId,
    'settlements'
  ) as CollectionReference<DocumentData>
  const docRef = await addDoc(settlementsCol, {
    from: fromUid,
    to: toUid,
    amount,
    description: description || '',
    createdAt: Date.now(),
  })
  return { id: docRef.id }
}

// Fetch all settlements for a group
export async function fetchSettlementsForGroup(groupId: string) {
  const settlementsCol = collection(db, 'groups', groupId, 'settlements')
  const snaps = await getDocs(settlementsCol)
  return snaps.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  }))
}

// Calculate net balances considering both expenses and settlements
export function calculateNetBalances(
  expenses: Array<{ amount: number; payer: string; splits: Record<string, number> }>,
  settlements: Array<{ from: string; to: string; amount: number }>
): Record<string, number> {
  const balances = calculateBalances(expenses)

  // Subtract settlements from balances
  for (const settlement of settlements) {
    if (!balances[settlement.from]) balances[settlement.from] = 0
    if (!balances[settlement.to]) balances[settlement.to] = 0

    // Reduce the debt of the payer and reduce what the receiver is owed
    balances[settlement.from] -= settlement.amount
    balances[settlement.to] += settlement.amount
  }

  return balances
}

// Send an invite to a user by email (stores invite in a collection for the user to accept)
export async function sendInvite(groupId: string, email: string, groupName: string) {
  // Store invite in a pending invites collection so the invited user can see it when they log in
  const invitesCol = collection(db, 'invites') as CollectionReference<DocumentData>
  const docRef = await addDoc(invitesCol, {
    email: email.toLowerCase(),
    groupId,
    groupName,
    status: 'pending', // 'pending', 'accepted', 'declined'
    createdAt: Date.now(),
  })
  return { id: docRef.id }
}

// Accept an invite and add user to group
export async function acceptInvite(inviteId: string, groupId: string, userId: string) {
  // Add user to group members
  const gRef = doc(db, 'groups', groupId)
  const snap = await getDoc(gRef)
  if (!snap.exists()) throw new Error('Group not found')

  const groupData = snap.data() as any
  const members = groupData.members || []
  if (!members.includes(userId)) {
    members.push(userId)
    await updateDoc(gRef, { members })
  }

  // Mark invite as accepted
  const inviteRef = doc(db, 'invites', inviteId)
  await updateDoc(inviteRef, { status: 'accepted' })
}

// Fetch pending invites for a user
export async function fetchPendingInvites(email: string) {
  const invitesCol = collection(db, 'invites')
  const q = query(
    invitesCol,
    where('email', '==', email.toLowerCase()),
    where('status', '==', 'pending')
  )
  const snaps = await getDocs(q)
  return snaps.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  }))
}

// Add member to group (owner only)
export async function addMemberToGroup(groupId: string, userId: string) {
  const gRef = doc(db, 'groups', groupId)
  const snap = await getDoc(gRef)
  if (!snap.exists()) throw new Error('Group not found')

  const groupData = snap.data() as any
  const members = groupData.members || []
  if (!members.includes(userId)) {
    members.push(userId)
    await updateDoc(gRef, { members })
  }
}

// Activity feed: log an activity event for a group
export async function logActivity(
  groupId: string,
  type: 'expense_added' | 'settlement_recorded' | 'member_joined' | 'member_invited',
  actorId: string,
  data: Record<string, any>
) {
  const activitiesCol = collection(
    db,
    'groups',
    groupId,
    'activities'
  ) as CollectionReference<DocumentData>
  await addDoc(activitiesCol, {
    type,
    actorId,
    timestamp: Date.now(),
    ...data,
  })
}

// Fetch activity feed for a group
export async function fetchActivityFeed(groupId: string, limit = 50) {
  const activitiesCol = collection(db, 'groups', groupId, 'activities')
  const q = query(activitiesCol)
  const snaps = await getDocs(q)
  const activities = snaps.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  })) as any[]
  // Sort by timestamp descending (most recent first)
  return activities.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, limit)
}

// Format activity for display
export function formatActivityMessage(activity: any, userEmail?: string): string {
  const actor = activity.actorId === userEmail ? 'You' : activity.actorId.substring(0, 8)
  switch (activity.type) {
    case 'expense_added':
      return `${actor} added expense "${activity.description || 'Expense'}" for $${activity.amount?.toFixed(2)}`
    case 'settlement_recorded':
      return `${actor} recorded settlement of $${activity.amount?.toFixed(2)}`
    case 'member_joined':
      return `${actor} joined the group`
    case 'member_invited':
      return `${actor} invited ${activity.invitedEmail}`
    default:
      return 'Activity recorded'
  }
}
