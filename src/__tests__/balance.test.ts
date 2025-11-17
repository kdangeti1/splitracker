import { describe, it, expect } from 'vitest'

// Test data structures matching our expense format
interface Expense {
  id: string
  amount: number
  payer: string
  splits: Record<string, number>
  description?: string
}

// Copy of calculateBalances from firebase/config.ts for testing
function calculateBalances(expenses: Expense[]): Record<string, number> {
  const balances: Record<string, number> = {}

  for (const exp of expenses) {
    if (!balances[exp.payer]) balances[exp.payer] = 0
    balances[exp.payer] += exp.amount

    for (const [memberId, shareAmount] of Object.entries(exp.splits)) {
      if (!balances[memberId]) balances[memberId] = 0
      balances[memberId] -= shareAmount
    }
  }

  return balances
}

interface Settlement {
  id: string
  from: string
  to: string
  amount: number
}

// Copy of calculateNetBalances for testing
function calculateNetBalances(
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const fromExpenses = calculateBalances(expenses)

  for (const settle of settlements) {
    if (!fromExpenses[settle.from]) fromExpenses[settle.from] = 0
    if (!fromExpenses[settle.to]) fromExpenses[settle.to] = 0

    fromExpenses[settle.from] -= settle.amount
    fromExpenses[settle.to] += settle.amount
  }

  return fromExpenses
}

describe('Balance Calculations', () => {
  describe('calculateBalances', () => {
    it('should calculate zero balances for empty expenses', () => {
      const balances = calculateBalances([])
      expect(balances).toEqual({})
    })

    it('should calculate correct balances for equal split', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          amount: 30,
          payer: 'alice',
          splits: { alice: 10, bob: 10, charlie: 10 },
          description: 'Dinner',
        },
      ]
      const balances = calculateBalances(expenses)
      expect(balances.alice).toBe(20) // Paid 30, owes 10
      expect(balances.bob).toBe(-10) // Owes 10
      expect(balances.charlie).toBe(-10) // Owes 10
    })

    it('should calculate correct balances for unequal split', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          amount: 60,
          payer: 'alice',
          splits: { alice: 20, bob: 30, charlie: 10 },
          description: 'Dinner',
        },
      ]
      const balances = calculateBalances(expenses)
      expect(balances.alice).toBe(40) // Paid 60, owes 20
      expect(balances.bob).toBe(-30) // Owes 30
      expect(balances.charlie).toBe(-10) // Owes 10
    })

    it('should handle multiple expenses from different payers', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          amount: 30,
          payer: 'alice',
          splits: { alice: 10, bob: 10, charlie: 10 },
        },
        {
          id: '2',
          amount: 40,
          payer: 'bob',
          splits: { alice: 10, bob: 20, charlie: 10 },
        },
      ]
      const balances = calculateBalances(expenses)
      // Alice: Paid 30, owes 10+10=20, net +10
      expect(balances.alice).toBe(10)
      // Bob: Paid 40, owes 10+20=30, net +10
      expect(balances.bob).toBe(10)
      // Charlie: Paid 0, owes 10+10=20, net -20
      expect(balances.charlie).toBe(-20)
    })
  })

  describe('calculateNetBalances', () => {
    it('should include settlements in balance calculation', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          amount: 30,
          payer: 'alice',
          splits: { alice: 10, bob: 10, charlie: 10 },
        },
      ]
      const settlements: Settlement[] = [
        {
          id: '1',
          from: 'bob',
          to: 'alice',
          amount: 5,
        },
      ]
      const balances = calculateNetBalances(expenses, settlements)
      expect(balances.alice).toBe(25) // 20 from expense + 5 from settlement
      expect(balances.bob).toBe(-15) // -10 from expense - 5 settlement to alice
      expect(balances.charlie).toBe(-10) // -10 from expense
    })

    it('should handle multiple settlements', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          amount: 30,
          payer: 'alice',
          splits: { alice: 10, bob: 10, charlie: 10 },
        },
      ]
      const settlements: Settlement[] = [
        { id: '1', from: 'bob', to: 'alice', amount: 5 },
        { id: '2', from: 'charlie', to: 'alice', amount: 8 },
      ]
      const balances = calculateNetBalances(expenses, settlements)
      expect(balances.alice).toBe(33) // 20 + 5 + 8
      expect(balances.bob).toBe(-15) // -10 - 5
      expect(balances.charlie).toBe(-18) // -10 - 8
    })

    it('should settle balances correctly', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          amount: 30,
          payer: 'alice',
          splits: { alice: 10, bob: 20 },
        },
      ]
      const settlements: Settlement[] = [{ id: '1', from: 'bob', to: 'alice', amount: 20 }]
      const balances = calculateNetBalances(expenses, settlements)
      // Alice: From expense +20, from settlement +20 = +40
      expect(balances.alice).toBe(40)
      // Bob: From expense -20, from settlement -20 = -40
      expect(balances.bob).toBe(-40)
    })
  })
})
