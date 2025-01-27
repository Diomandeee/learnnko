import useSWR from 'swr';
import { CoffeeShop } from '@prisma/client';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function useCoffeeShops() {
  const { data, error, isLoading, mutate } = useSWR<CoffeeShop[]>(
    '/api/coffee-shops',
    fetcher,
    {
      refreshInterval: 0, // Only refresh manually
      revalidateOnFocus: false,
    }
  );

  return {
    shops: data,
    loading: isLoading,
    error: error,
    mutate,
  };
}