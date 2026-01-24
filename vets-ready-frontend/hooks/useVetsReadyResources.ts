import { useQuery } from '@tanstack/react-query'

const API_BASE = '/api/vetsready'

// Get All Resources
export const useVetsReadyResources = (category?: string) => {
  return useQuery({
    queryKey: ['resources', category],
    queryFn: async () => {
      const url = category
        ? `${API_BASE}/resources/category/${category}`
        : `${API_BASE}/resources`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch resources')
      return res.json()
    },
  })
}

// Get Single Resource
export const useVetsReadyResource = (id: string) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/resources/${id}`)
      if (!res.ok) throw new Error('Failed to fetch resource')
      return res.json()
    },
    enabled: !!id,
  })
}
