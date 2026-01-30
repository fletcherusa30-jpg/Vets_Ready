import { useMemo, useState } from "react"
import { searchPublicPages, getPagesByCategory, getTrendingPages } from "../services/pageDiscovery"
import { SearchQuery, PublicPage, PageCategory } from "../types"

export function usePageSearch() {
  const [query, setQuery] = useState<SearchQuery>({})
  const [results, setResults] = useState<PublicPage[]>([])

  const search = (newQuery: SearchQuery) => {
    setQuery(newQuery)
    const found = searchPublicPages(newQuery)
    setResults(found)
  }

  const searchByCategory = (category: PageCategory) => {
    const found = getPagesByCategory(category)
    setQuery({ ...query, category })
    setResults(found)
  }

  const trending = useMemo(() => getTrendingPages(10), [])

  return { query, results, search, searchByCategory, trending }
}
