import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api/rallyforge'

// Federal Benefits
export const userallyforgeFederalBenefits = () => {
  return useQuery({
    queryKey: ['federalBenefits'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/benefits/federal`)
      if (!res.ok) throw new Error('Failed to fetch federal benefits')
      return res.json()
    },
  })
}

// State Benefits
export const userallyforgeStateBenefits = (state: string) => {
  return useQuery({
    queryKey: ['stateBenefits', state],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/benefits/state/${state}`)
      if (!res.ok) throw new Error('Failed to fetch state benefits')
      return res.json()
    },
    enabled: !!state,
  })
}

// Single Benefit
export const userallyforgeBenefit = (id: string) => {
  return useQuery({
    queryKey: ['benefit', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/benefits/${id}`)
      if (!res.ok) throw new Error('Failed to fetch benefit')
      return res.json()
    },
    enabled: !!id,
  })
}

