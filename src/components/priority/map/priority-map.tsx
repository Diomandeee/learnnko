"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRouteOptimizer } from "@/hooks/use-route-optimizer"
import { 
  Settings2, 
  MapPin, 
  Circle, 
  Navigation, 
  Route as RouteIcon,
  RefreshCw,
  Save
} from "lucide-react"
import { CoffeeShop } from "@prisma/client"
import { calculateDistance, findNearbyLocations } from "@/lib/route-optimization"
import { usePriorityStore } from "@/store/priority-store"
import { OptimizationSettings } from "./optimization-settings"
import { RouteSummary } from "./route-summary"
import { MapMarker } from "./map-marker"
import { RouteLayer } from "./route-layer"

export function PriorityMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { 
    selectedShops,
    optimizedRoute,
    setOptimizedRoute,
    settings,
    updateSettings,
    setRouteMetrics,
    isOptimizing,
    setIsOptimizing 
  } = usePriorityStore()

  const { optimizeRoute, metrics } = useRouteOptimizer()

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary("maps")
        const directionsServiceInstance = new google.maps.DirectionsService()
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
        })

        const mapInstance = new Map(mapRef.current, {
          zoom: 12,
          center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        directionsRendererInstance.setMap(mapInstance)

        setMap(mapInstance)
        setDirectionsService(directionsServiceInstance)
        setDirectionsRenderer(directionsRendererInstance)
      } catch (error) {
        console.error('Error initializing map:', error)
        toast({
          title: "Error",
          description: "Failed to initialize map. Please refresh the page.",
          variant: "destructive"
        })
      }
    }

    initMap()
  }, [])

  // Update map bounds when selected shops change
  useEffect(() => {
    if (!map || !selectedShops.length) return

    const bounds = new google.maps.LatLngBounds()
    selectedShops.forEach(shop => {
      bounds.extend({ lat: shop.latitude, lng: shop.longitude })
    })
    map.fitBounds(bounds, 50)
  }, [map, selectedShops])

  // Handle optimize route
  const handleOptimizeRoute = async () => {
    if (!selectedShops.length || !directionsService) {
      toast({
        title: "Error",
        description: "Please select locations first",
        variant: "destructive"
      })
      return
    }

    setIsOptimizing(true)
    try {
      const optimizedStops = await optimizeRoute(
        selectedShops,
        settings,
        directionsService
      )

      setOptimizedRoute(optimizedStops)
      setRouteMetrics(metrics!)

      // Update route display
      if (directionsRenderer && optimizedStops.length > 1) {
        const waypoints = optimizedStops.slice(1, -1).map(stop => ({
          location: { lat: stop.latitude, lng: stop.longitude },
          stopover: true
        }))

        const response = await directionsService.route({
          origin: { 
            lat: optimizedStops[0].latitude, 
            lng: optimizedStops[0].longitude 
          },
          destination: { 
            lat: optimizedStops[optimizedStops.length - 1].latitude, 
            lng: optimizedStops[optimizedStops.length - 1].longitude 
          },
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        })

        directionsRenderer.setDirections(response)
      }

      toast({
        title: "Success",
        description: `Route optimized with ${optimizedStops.length} stops`
      })
    } catch (error) {
      console.error('Error optimizing route:', error)
      toast({
        title: "Error",
        description: "Failed to optimize route. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route Planning</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-4 w-4" />
              {selectedShops.length} selected
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map */}
          <div 
            ref={mapRef}
            className="w-full h-[500px] rounded-lg border"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || selectedShops.length === 0}
              className="flex-1"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <RouteIcon className="h-4 w-4 mr-2" />
                  Optimize Route
                </>
              )}
            </Button>
          </div>

          {/* Route Summary */}
          {optimizedRoute.length > 0 && (
            <RouteSummary />
          )}
        </div>
      </CardContent>

      <OptimizationSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </Card>
  )
}
