import { useMapStore } from '@/store/use-map'

export function useSelectedShop() {
  const selectedShop = useMapStore((state) => state.selectedShop)
  const setSelectedShop = useMapStore((state) => state.setSelectedShop)

  return {
    selectedShop,
    setSelectedShop,
  }
}
