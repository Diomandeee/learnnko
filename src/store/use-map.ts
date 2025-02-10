import { create } from 'zustand'
import { CoffeeShop } from '@prisma/client'

interface MapState {
  center: [number, number]
  zoom: number
  selectedShop: CoffeeShop | null
  setSelectedShop: (shop: CoffeeShop | null) => void
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
}

export const useMapStore = create<MapState>((set) => ({
  center: [40.7128, -74.0060], // Default to NYC coordinates
  zoom: 12,
  selectedShop: null,
  setSelectedShop: (shop) => set({ selectedShop: shop }),
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
}))


