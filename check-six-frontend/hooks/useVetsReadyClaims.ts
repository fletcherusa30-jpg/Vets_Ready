import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api/rallyforge'

// Get Claims
export const userallyforgeClaims = () => {
  return useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/claims`)
      if (!res.ok) throw new Error('Failed to fetch claims')
      return res.json()
    },
  })
}

// Create Claim
export const userallyforgeCreateClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create claim')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
  })
}

// Update Claim
export const userallyforgeUpdateClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`${API_BASE}/claims/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update claim')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
  })
}

// Delete Claim
export const userallyforgeDeleteClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/claims/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete claim')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
  })
}

