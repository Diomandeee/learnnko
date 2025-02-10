import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import { optimizeRoute, type OptimizationSettings } from "@/lib/route-optimization"

interface RouteMetrics {
  totalDistance: number
  totalDuration: number
  estimatedArrival: string
  numberOfStops: number
}

export function useRouteOptimizer() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null)

  const calculateRoute = async (
    shops: CoffeeShop[],
    settings: OptimizationSettings,
    directionsService: google.maps.DirectionsService
  ) => {
    setIsCalculating(true)
    try {
      // Get optimized route order
      const optimizedRoute = await optimizeRoute(shops, settings, directionsService)
      
      // Calculate route metrics
      if (optimizedRoute.length > 1) {
        const waypoints = optimizedRoute.slice(1, -1).map(shop => ({
          location: { lat: shop.latitude, lng: shop.longitude },
          stopover: true
        }))

        const response = await directionsService.route({
          origin: { 
            lat: optimizedRoute[0].latitude, 
            lng: optimizedRoute[0].longitude 
          },
          destination: { 
            lat: optimizedRoute[optimizedRoute.length - 1].latitude, 
            lng: optimizedRoute[optimizedRoute.length - 1].longitude 
          },
          waypoints,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING
        })

        const route = response.routes[0]
        const legs = route.legs

        // Calculate total distance and duration
        const totalDistance = legs.reduce((acc, leg) => 
          acc + (leg.distance?.value || 0), 0) / 1000 // Convert to km
        
        const totalDuration = legs.reduce((acc, leg) =>
          acc + (leg.duration?.value || 0), 0) / 60 // Convert to minutes

        // Calculate estimated arrival time
        const now = new Date()
        const startTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(settings.startTime.split(':')[0]),
          parseInt(settings.startTime.split(':')[1])
        )

        const arrivalTime = new Date(
          startTime.getTime() + 
          (totalDuration * 60 * 1000) + 
          (settings.timePerStop * optimizedRoute.length * 60 * 1000)
        )

        const newMetrics = {
          totalDistance,
          totalDuration,
          estimatedArrival: arrivalTime.toLocaleTimeString(),
          numberOfStops: optimizedRoute.length
        }

        setMetrics(newMetrics)
      }

      return optimizedRoute
    } catch (error) {
      console.error('Error calculating route:', error)
      throw error
    } finally {
      setIsCalculating(false)
    }
  }

  return {
    optimizeRoute: calculateRoute,
    isCalculating,
    metrics
  }
}
