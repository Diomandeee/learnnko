// // src/types/route.ts

// export interface RouteSettings {
//   maxStops: number
//   maxDistance: number
//   transportMode: 'DRIVING' | 'WALKING'
//   optimizeBy: 'distance' | 'time' | 'volume'
//   avoidHighways: boolean
//   avoidTolls: boolean
// }

// export interface RouteMetrics {
//   totalDistance: number
//   totalDuration: number
//   numberOfStops: number
//   estimatedArrival: string
// }

// export interface RouteStep {
//   instructions: string
//   distance: string
//   duration: string
//   maneuver?: string
//   start_location: {
//     lat: number
//     lng: number
//   }
// }

// export interface VisitReport {
//   visitId: string
//   locationId: string
//   visitDate: Date
//   notes?: string
//   managerPresent?: string
//   updatedVolume?: string
//   updatedContacts?: {
//     name?: string
//     email?: string
//     phone?: string
//   }
//   photos?: string[]
// }

// export interface NavigationState {
//   isActive: boolean
//   currentStep: number
//   isAtDestination: boolean
//   currentLocation?: {
//     lat: number
//     lng: number
//     bearing: number
//   }
// }

// export interface DirectionsResult {
//   route: {
//     legs: Array<{
//       distance: { text: string; value: number }
//       duration: { text: string; value: number }
//       steps: RouteStep[]
//     }>
//     overview_path: Array<{ lat: number; lng: number }>
//     bounds: {
//       north: number
//       south: number
//       east: number
//       west: number
//     }
//   }
// }


// src/types/route.ts
export interface RouteSettings {
  maxStops: number;
  maxDistance: number;
  optimizeBy: 'distance' | 'time' | 'volume';
  transportMode: 'DRIVING' | 'WALKING';
  avoidHighways: boolean;
  avoidTolls: boolean;
}

export interface RouteMetrics {
  totalDistance: number;
  totalDuration: number;
  numberOfStops: number;
  estimatedArrival: string;
}

export interface Location {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  visited?: boolean;
  volume?: string;
  is_source?: boolean;
}

export interface RouteOptimizationParams {
  startingPoint: string;
  maxStops: number;
  maxDistance: number;
  optimizeBy?: 'distance' | 'time' | 'volume';
  includedLocations?: string[];
  excludedLocations?: string[];
}

export interface VisitReport {
  visitId: string;
  locationId: string;
  visitDate: Date;
  managerPresent?: boolean;
  managerName?: string;
  samplesDropped?: boolean;
  sampleDetails?: string;
  notes?: string;
  nextVisitDate?: Date;
  photos?: string[];
}