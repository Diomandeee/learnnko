import useSWR from 'swr'
import { Person } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePeople() {
  const { data, error, isLoading, mutate } = useSWR<Person[]>(
    '/api/people',
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  )

  return {
    people: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
