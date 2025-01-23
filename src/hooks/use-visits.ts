import useSWR from 'swr'
import { Visit } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useVisits() {
  const { data, error, isLoading, mutate } = useSWR<Visit[]>(
    '/api/visits',
    fetcher
  )

  return {
    visits: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
