import useSWR from 'swr'
import { CoffeeShop } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useShops() {
  const { data, error, isLoading, mutate } = useSWR<CoffeeShop[]>(
    '/api/coffee-shops',
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  )

  return {
    shops: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
