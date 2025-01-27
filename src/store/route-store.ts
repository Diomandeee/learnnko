// src/store/route-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RouteSettings, RouteMetrics } from '@/types/route';
import { CoffeeShop } from '@prisma/client';
import { RouteOptimizer } from '@/lib/route-optimizer';
import { calculateDistance } from '@/lib/utils/geo';

interface RouteState {
  selectedLocations: CoffeeShop[];
  currentRoute: CoffeeShop[];
  settings: RouteSettings;
  metrics: RouteMetrics | null;
  isOptimizing: boolean;
  isNavigating: boolean;
  currentStep: number;
  
  // Actions
  updateSettings: (settings: Partial<RouteSettings>) => void;
  setMetrics: (metrics: RouteMetrics) => void;
  addLocation: (location: CoffeeShop) => void;
  removeLocation: (locationId: string) => void;
  updateRoute: (route: CoffeeShop[]) => void;
  optimizeRoute: () => Promise<void>;
  startNavigation: () => void;
  stopNavigation: () => void;
  nextStep: () => void;
  previousStep: () => void;
  clearRoute: () => void;
  exportToCalendar: () => Promise<void>;
  shareRoute: () => Promise<void>;
}

const defaultSettings: RouteSettings = {
  maxStops: 10,
  maxDistance: 5,
  optimizeBy: 'distance',
  transportMode: 'DRIVING',
  avoidHighways: false,
  avoidTolls: false,
};

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedLocations: [],
      currentRoute: [],
      settings: defaultSettings,
      metrics: null,
      isOptimizing: false,
      isNavigating: false,
      currentStep: -1,

      // Actions
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setMetrics: (metrics) => set({ metrics }),

      addLocation: (location) => 
        set((state) => ({
          selectedLocations: [...state.selectedLocations, location],
          currentRoute: [...state.currentRoute, location],
        })),

      removeLocation: (locationId) =>
        set((state) => ({
          selectedLocations: state.selectedLocations.filter(loc => loc.id !== locationId),
          currentRoute: state.currentRoute.filter(loc => loc.id !== locationId),
        })),

      updateRoute: (route) => set({ currentRoute: route }),

      optimizeRoute: async () => {
        const state = get();
        if (state.selectedLocations.length < 2) {
          console.log('Need at least 2 locations to optimize');
          return;
        }

        set({ isOptimizing: true });
        try {
          const optimizer = new RouteOptimizer();
          const startShop = state.selectedLocations[0];

          // Optimize the route based on settings
          const optimizedRoute = optimizer.optimizeRoute(
            state.selectedLocations,
            startShop.id,
            state.settings.maxStops,
            state.settings.maxDistance,
            state.settings.optimizeBy
          );

          // Calculate total distance
          let totalDistance = 0;
          for (let i = 1; i < optimizedRoute.length; i++) {
            const prevShop = optimizedRoute[i - 1];
            const currentShop = optimizedRoute[i];
            totalDistance += calculateDistance(
              prevShop.latitude,
              prevShop.longitude,
              currentShop.latitude,
              currentShop.longitude
            );
          }

          // Calculate estimated duration based on transport mode
          const averageSpeed = state.settings.transportMode === 'DRIVING' ? 30 : 5; // km/h
          const totalDuration = (totalDistance / averageSpeed) * 60; // Convert to minutes

          // Calculate estimated arrival time
          const now = new Date();
          const arrivalTime = new Date(now.getTime() + totalDuration * 60 * 1000);

          // Update route and metrics
          set({
            currentRoute: optimizedRoute,
            metrics: {
              totalDistance,
              totalDuration,
              numberOfStops: optimizedRoute.length,
              estimatedArrival: arrivalTime.toLocaleTimeString()
            },
            isOptimizing: false
          });

        } catch (error) {
          console.error('Route optimization failed:', error);
          set({ isOptimizing: false });
        }
      },

      startNavigation: () => {
        const { currentRoute } = get();
        if (currentRoute.length === 0) return;
        
        set({ 
          isNavigating: true, 
          currentStep: 0 
        });
      },

      stopNavigation: () => set({ 
        isNavigating: false, 
        currentStep: -1 
      }),

      nextStep: () => {
        const { currentStep, currentRoute } = get();
        if (currentStep < currentRoute.length - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      clearRoute: () => set({
        selectedLocations: [],
        currentRoute: [],
        metrics: null,
        isNavigating: false,
        currentStep: -1,
      }),

      exportToCalendar: async () => {
        const { currentRoute } = get();
        if (currentRoute.length === 0) return;

        try {
          // Create calendar event
          const event = {
            title: 'Coffee Shop Route',
            description: currentRoute.map((shop, index) => 
              `${index + 1}. ${shop.title} - ${shop.address}`
            ).join('\n'),
            startTime: new Date(),
            endTime: new Date(Date.now() + get().metrics?.totalDuration * 60 * 1000)
          };

          // Here you would integrate with calendar API
          console.log('Exporting to calendar:', event);
        } catch (error) {
          console.error('Failed to export to calendar:', error);
        }
      },

      shareRoute: async () => {
        const { currentRoute } = get();
        if (currentRoute.length === 0) return;

        try {
          const routeText = currentRoute.map((shop, index) => 
            `${index + 1}. ${shop.title} - ${shop.address}`
          ).join('\n');

          if (navigator.share) {
            await navigator.share({
              title: 'Coffee Shop Route',
              text: routeText,
            });
          } else {
            // Fallback to copying to clipboard
            await navigator.clipboard.writeText(routeText);
            console.log('Route copied to clipboard');
          }
        } catch (error) {
          console.error('Failed to share route:', error);
        }
      },
    }),
    {
      name: 'route-storage',
      partialize: (state) => ({
        selectedLocations: state.selectedLocations,
        settings: state.settings,
      }),
    }
  )
);