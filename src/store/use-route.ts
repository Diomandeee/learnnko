import { create } from 'zustand'
import { CoffeeShop } from '@prisma/client'
import { RouteOptimizer } from '@/lib/route-optimizer'

interface RouteSettings {
  startingPoint: string
  maxStops: number
  maxDistance: number
}

interface RouteState {
  settings: RouteSettings
  currentRoute: CoffeeShop[]
  loading: boolean
  error: string | null
  updateSettings: (settings: Partial<RouteSettings>) => void
  generateRoute: () => Promise<void>
  clearRoute: () => void
}

export const useRouteStore = create<RouteState>((set, get) => ({
  settings: {
    startingPoint: '',
    maxStops: 10,
    maxDistance: 5,
  },
  currentRoute: [],
  loading: false,
  error: null,

  updateSettings: (newSettings) => 
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  generateRoute: async () => {
    set({ loading: true, error: null })
    try {
      const { settings } = get()
      
      // Fetch shops
      const shopsResponse = await fetch('/api/coffee-shops')
      const shops: CoffeeShop[] = await shopsResponse.json()
      
      // Find starting shop
      const startShop = shops.find(shop => shop.id === settings.startingPoint)
      if (!startShop) throw new Error('Starting point not found')
      
      // Get target shops (exclude visited and source locations)
      const targetShops = shops.filter(shop => 
        !shop.visited && 
        !shop.is_source && 
        shop.id !== settings.startingPoint
      )

      // Initialize optimizer
      const optimizer = new RouteOptimizer({
        maxStops: settings.maxStops,
        maxDistance: settings.maxDistance
      })

      // Generate route
      const route = await optimizer.generateRoute(startShop, targetShops)
      
      // Update state with route
      set({ 
        currentRoute: [startShop, ...route.map(stop => stop.shop)],
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  clearRoute: () => set({ currentRoute: [] }),
}))
