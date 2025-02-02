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
 currentLocation: { lat: number; lng: number } | null;
 
 // Actions
 updateSettings: (settings: Partial<RouteSettings>) => void;
 setMetrics: (metrics: RouteMetrics) => void;
 addLocation: (location: CoffeeShop) => void;
 addLocations: (locations: CoffeeShop[]) => void;
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
 openInGoogleMaps: (destination?: CoffeeShop) => void;
 updateCurrentLocation: (position: { lat: number; lng: number }) => void;
 addAllPartners: (partners: CoffeeShop[]) => Promise<void>;
}

const defaultSettings: RouteSettings = {
 maxStops: 10,
 maxDistance: 5,
 optimizeBy: 'distance',
 transportMode: 'DRIVING',
 avoidHighways: false,
 avoidTolls: false,
};

// Helper function to sort locations by distance from a point
const sortByDistance = (locations: CoffeeShop[], fromLat: number, fromLng: number) => {
 return [...locations].sort((a, b) => {
   const distA = calculateDistance(fromLat, fromLng, a.latitude, a.longitude);
   const distB = calculateDistance(fromLat, fromLng, b.latitude, b.longitude);
   return distA - distB;
 });
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
     currentLocation: null,

     // Actions
     updateSettings: (newSettings) => 
       set((state) => ({
         settings: { ...state.settings, ...newSettings },
       })),

     setMetrics: (metrics) => set({ metrics }),

     addLocation: (location) => 
       set((state) => {
         // Check if location already exists
         if (state.selectedLocations.find(loc => loc.id === location.id)) {
           return state;
         }
         return {
           selectedLocations: [...state.selectedLocations, location],
           currentRoute: [...state.currentRoute, location],
         };
       }),

     addLocations: (locations) =>
       set((state) => {
         // Filter out locations that are already selected
         const newLocations = locations.filter(
           location => !state.selectedLocations.find(loc => loc.id === location.id)
         );
         return {
           selectedLocations: [...state.selectedLocations, ...newLocations],
           currentRoute: [...state.currentRoute, ...newLocations],
         };
       }),

     removeLocation: (locationId) =>
       set((state) => ({
         selectedLocations: state.selectedLocations.filter(loc => loc.id !== locationId),
         currentRoute: state.currentRoute.filter(loc => loc.id !== locationId),
       })),

     updateRoute: (route) => set({ currentRoute: route }),

     updateCurrentLocation: (position) => 
       set({ currentLocation: position }),

     addAllPartners: async (partners) => {
       const state = get();
       const { currentLocation } = state;

       if (!currentLocation) {
         // If no current location, try to get it
         try {
           const position = await new Promise<GeolocationPosition>((resolve, reject) => {
             navigator.geolocation.getCurrentPosition(resolve, reject);
           });
           
           set({ currentLocation: {
             lat: position.coords.latitude,
             lng: position.coords.longitude
           }});
           
           // Sort partners by distance from current location
           const sortedPartners = sortByDistance(
             partners,
             position.coords.latitude,
             position.coords.longitude
           );

           // Add sorted partners to the route
           set(state => ({
             selectedLocations: [...state.selectedLocations, ...sortedPartners],
             currentRoute: [...state.currentRoute, ...sortedPartners],
           }));

         } catch (error) {
           console.error('Failed to get current location:', error);
           // Fall back to adding partners without sorting
           set(state => ({
             selectedLocations: [...state.selectedLocations, ...partners],
             currentRoute: [...state.currentRoute, ...partners],
           }));
         }
       } else {
         // Sort partners by distance from known current location
         const sortedPartners = sortByDistance(
           partners,
           currentLocation.lat,
           currentLocation.lng
         );

         set(state => ({
           selectedLocations: [...state.selectedLocations, ...sortedPartners],
           currentRoute: [...state.currentRoute, ...sortedPartners],
         }));
       }

       // Optimize the route after adding all partners
       await get().optimizeRoute();
     },

     openInGoogleMaps: (destination?: CoffeeShop) => {
       const state = get();
       let url = '';

       if (destination) {
         // Open single destination
         url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
         if (state.currentLocation) {
           url += `&origin=${state.currentLocation.lat},${state.currentLocation.lng}`;
         }
       } else if (state.currentRoute.length > 0) {
         // Open full route
         const waypoints = state.currentRoute
           .slice(1, -1)
           .map(shop => `${shop.latitude},${shop.longitude}`)
           .join('|');

         const origin = state.currentLocation 
           ? `${state.currentLocation.lat},${state.currentLocation.lng}`
           : `${state.currentRoute[0].latitude},${state.currentRoute[0].longitude}`;

         const destination = state.currentRoute[state.currentRoute.length - 1];

         url = `https://www.google.com/maps/dir/?api=1` +
           `&origin=${origin}` +
           `&destination=${destination.latitude},${destination.longitude}`;

         if (waypoints) {
           url += `&waypoints=${waypoints}`;
         }

         // Add transportation mode
         url += `&travelmode=${state.settings.transportMode.toLowerCase()}`;

         // Add route preferences
         if (state.settings.avoidHighways) url += '&avoid=highways';
         if (state.settings.avoidTolls) url += '&avoid=tolls';
       }

       if (url) {
         window.open(url, '_blank');
       }
     },

     optimizeRoute: async () => {
      const state = get();
      if (state.selectedLocations.length < 2) return;
    
      set({ isOptimizing: true });
      try {
        // Create DirectionsService instance
        const directionsService = new google.maps.DirectionsService();
    
        // Prepare waypoints
        const waypoints = state.selectedLocations.slice(1, -1).map(location => ({
          location: new google.maps.LatLng(location.latitude, location.longitude),
          stopover: true
        }));
    
        // Request optimized directions from Google Maps
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route({
            origin: new google.maps.LatLng(
              state.selectedLocations[0].latitude,
              state.selectedLocations[0].longitude
            ),
            destination: new google.maps.LatLng(
              state.selectedLocations[state.selectedLocations.length - 1].latitude,
              state.selectedLocations[state.selectedLocations.length - 1].longitude
            ),
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode[state.settings.transportMode as keyof typeof google.maps.TravelMode],
            avoidHighways: state.settings.avoidHighways,
            avoidTolls: state.settings.avoidTolls
          }, (result, status) => {
            if (status === 'OK') resolve(result);
            else reject(new Error(`Directions request failed: ${status}`));
          });
        });
    
        // Get the optimized waypoint order from Google Maps
        const optimizedOrder = result.routes[0].waypoint_order;
        
        // Reorder locations based on Google's optimization
        const optimizedRoute = [
          state.selectedLocations[0], // Keep start point
          ...optimizedOrder.map(index => state.selectedLocations[index + 1]),
          state.selectedLocations[state.selectedLocations.length - 1] // Keep end point
        ];
    
        // Calculate metrics from Google's response
        const route = result.routes[0];
        let totalDistance = 0;
        let totalDuration = 0;
    
        route.legs.forEach(leg => {
          totalDistance += leg.distance?.value || 0;
          totalDuration += leg.duration?.value || 0;
        });
    
        // Convert to desired units
        totalDistance = totalDistance / 1000; // Convert meters to kilometers
        totalDuration = totalDuration / 60; // Convert seconds to minutes
    
        set({
          currentRoute: optimizedRoute,
          metrics: {
            totalDistance,
            totalDuration,
            numberOfStops: optimizedRoute.length,
            estimatedArrival: new Date(Date.now() + totalDuration * 60 * 1000).toLocaleTimeString()
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
       
       // Start tracking current location if not already
       if (navigator.geolocation) {
         navigator.geolocation.watchPosition(
           (position) => {
             get().updateCurrentLocation({
               lat: position.coords.latitude,
               lng: position.coords.longitude
             });
           },
           null,
           { enableHighAccuracy: true }
         );
       }
       
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
       const { currentRoute, metrics } = get();
       if (currentRoute.length === 0) return;

       try {
         // Create calendar event
         const event = {
           title: 'Coffee Shop Route',
           description: currentRoute.map((shop, index) => 
             `${index + 1}. ${shop.title} - ${shop.address}`
           ).join('\n'),
           startTime: new Date(),
           endTime: new Date(Date.now() + (metrics?.totalDuration || 0) * 60 * 1000)
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
