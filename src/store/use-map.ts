import { create } from 'zustand'
import { Shop } from '@/types/shop'

interface MapState {
  center: [number, number]
  zoom: number
  selectedShop: Shop | null
  setSelectedShop: (shop: Shop | null) => void
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
