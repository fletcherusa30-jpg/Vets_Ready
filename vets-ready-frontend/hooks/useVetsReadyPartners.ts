import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api/vetsready'

// Get Partners
export const useVetsReadyPartners = (category?: string, tier?: string) => {
  return useQuery({
    queryKey: ['partners', category, tier],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (tier) params.append('tier', tier)
      const url = `${API_BASE}/partners${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch partners')
      return res.json()
    },
  })
}

// Get Single Partner
export const useVetsReadyPartner = (id: string) => {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/partners/${id}`)
      if (!res.ok) throw new Error('Failed to fetch partner')
      return res.json()
    },
    enabled: !!id,
  })
}

// Get Partner Jobs
export const useVetsReadyPartnerJobs = (partnerId: string) => {
  return useQuery({
    queryKey: ['partnerJobs', partnerId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/partners/${partnerId}/jobs`)
      if (!res.ok) throw new Error('Failed to fetch partner jobs')
      return res.json()
    },
    enabled: !!partnerId,
  })
}

// Create Partner Listing
export const useVetsReadyCreatePartner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create partner')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}
