import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api/rallyforge'

// Get Budgets
export const userallyforgeBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/finance/budgets`)
      if (!res.ok) throw new Error('Failed to fetch budgets')
      return res.json()
    },
  })
}

// Create Budget
export const userallyforgeCreateBudget = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/finance/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create budget')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

// Calculate Retirement
export const userallyforgeCalculateRetirement = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/finance/retirement/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to calculate retirement')
      return res.json()
    },
  })
}

// Get Retirement Scenarios
export const userallyforgeRetirementScenarios = () => {
  return useQuery({
    queryKey: ['retirementScenarios'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/finance/retirement/scenarios`)
      if (!res.ok) throw new Error('Failed to fetch scenarios')
      return res.json()
    },
  })
}

