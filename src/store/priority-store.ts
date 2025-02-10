import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CoffeeShop } from '@prisma/client'

interface RouteMetrics {
  totalDistance: number
  totalDuration: number
  estimatedArrival: string
  numberOfStops: number
}

interface OptimizationSettings {
  maxStops: number
  preferHigherRated: boolean
  avoidTraffic: boolean
  prioritizeUnvisited: boolean
  timePerStop: number
  startTime: string
  endTime: string
  maxTravelTime: number
  includeNearby: boolean
  searchRadius: number
}

interface PriorityState {
  selectedShops: CoffeeShop[]
  optimizedRoute: CoffeeShop[]
  nearbyShops: CoffeeShop[]
  settings: OptimizationSettings
  routeMetrics: RouteMetrics | null
  savedRoutes: {
    id: string
    name: string
    shops: CoffeeShop[]
    metrics: RouteMetrics
    createdAt: Date
  }[]
  isOptimizing: boolean
  setSelectedShops: (shops: CoffeeShop[]) => void
  addToSelection: (shop: CoffeeShop) => void
  removeFromSelection: (shopId: string) => void
  setOptimizedRoute: (route: CoffeeShop[]) => void
  setNearbyShops: (shops: CoffeeShop[]) => void
  updateSettings: (settings: Partial<OptimizationSettings>) => void
  setRouteMetrics: (metrics: RouteMetrics) => void
  saveRoute: (name: string) => void
  deleteRoute: (id: string) => void
  clearRoute: () => void
  setIsOptimizing: (isOptimizing: boolean) => void
}

const defaultSettings: OptimizationSettings = {
  maxStops: 10,
  preferHigherRated: true,
  avoidTraffic: true,
  prioritizeUnvisited: true,
  timePerStop: 30,
  startTime: "09:00",
  endTime: "17:00",
  maxTravelTime: 45,
  includeNearby: true,
  searchRadius: 2
}

export const usePriorityStore = create<PriorityState>()(
  persist(
    (set, get) => ({
      selectedShops: [],
      optimizedRoute: [],
      nearbyShops: [],
      settings: defaultSettings,
      routeMetrics: null,
      savedRoutes: [],
      isOptimizing: false,

      setSelectedShops: (shops) => set({ selectedShops: shops }),
      
      addToSelection: (shop) => set((state) => ({
        selectedShops: [...state.selectedShops, shop]
      })),
      
      removeFromSelection: (shopId) => set((state) => ({
        selectedShops: state.selectedShops.filter(s => s.id !== shopId)
      })),
      
      setOptimizedRoute: (route) => set({ optimizedRoute: route }),
      
      setNearbyShops: (shops) => set({ nearbyShops: shops }),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      setRouteMetrics: (metrics) => set({ routeMetrics: metrics }),
      
      saveRoute: (name) => set((state) => ({
        savedRoutes: [
          ...state.savedRoutes,
          {
            id: crypto.randomUUID(),
            name,
            shops: state.optimizedRoute,
            metrics: state.routeMetrics!,
            createdAt: new Date()
          }
        ]
      })),
      
      deleteRoute: (id) => set((state) => ({
        savedRoutes: state.savedRoutes.filter(r => r.id !== id)
      })),
      
      clearRoute: () => set({
        optimizedRoute: [],
        routeMetrics: null
      }),
      
      setIsOptimizing: (isOptimizing) => set({ isOptimizing })
    }),
    {
      name: 'priority-store'
    }
  )
)
