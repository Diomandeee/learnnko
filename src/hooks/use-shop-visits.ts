import useSWR from 'swr'
import { Visit } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useShopVisits(shopId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Visit[]>(
    shopId ? `/api/coffee-shops/${shopId}/visits` : null,
    fetcher
  )

  return {
    visits: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
