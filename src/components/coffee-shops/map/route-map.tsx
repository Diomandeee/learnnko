"use client"

import { useEffect, useState, useCallback } from "react"
import { format, addMinutes } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { NavigationPanel } from "./navigation-panel"
import { DestinationReached } from "./destination-reached"
import { Car, Navigation , Badge} from "lucide-react"

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

interface RouteStep {
  instructions: string
  distance: string
  duration: string
  maneuver?: string
  start_location: google.maps.LatLng
}

export function RouteMap({ sourceShop, nearbyShops, maxDistance, onRouteCalculated }) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [currentMarker, setCurrentMarker] = useState<google.maps.Marker | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [navigationMode, setNavigationMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([])
  const [transportMode, setTransportMode] = useState<'DRIVING' | 'WALKING'>('DRIVING')
  const [isAtDestination, setIsAtDestination] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        toast({
          title: "Configuration Error",
          description: "Google Maps API key is missing.",
          variant: "destructive"
        })
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      script.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load Google Maps.",
          variant: "destructive"
        })
      }
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }

    loadGoogleMaps()

    // Cleanup
    return () => {
      markers.forEach(marker => marker.setMap(null))
      if (currentMarker) currentMarker.setMap(null)
      if (directionsRenderer) directionsRenderer.setMap(null)
    }
  }, [])

  const initializeMap = useCallback(() => {
    try {
      const mapInstance = new window.google.maps.Map(
        document.getElementById("route-map")!,
        {
          center: { 
            lat: sourceShop.latitude, 
            lng: sourceShop.longitude 
          },
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }
      )

      // Add traffic layer
      const trafficLayer = new window.google.maps.TrafficLayer()
      trafficLayer.setMap(mapInstance)

      const directionsServiceInstance = new window.google.maps.DirectionsService()
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        preserveViewport: false
      })

      setMap(mapInstance)
      setDirectionsService(directionsServiceInstance)
      setDirectionsRenderer(directionsRendererInstance)

      addMarkers(mapInstance)
    } catch (error) {
      console.error('Failed to initialize map:', error)
      toast({
        title: "Error",
        description: "Failed to initialize the map.",
        variant: "destructive"
      })
    }
  }, [sourceShop])

  const clearMarkers = useCallback(() => {
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])
  }, [markers])

  const addMarkers = useCallback((mapInstance: google.maps.Map) => {
    try {
      clearMarkers()

      // Add source marker
      const sourceMarker = new window.google.maps.Marker({
        position: { 
          lat: sourceShop.latitude, 
          lng: sourceShop.longitude 
        },
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: sourceShop.title,
        label: {
          text: "S",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold"
        }
      })

      const newMarkers = [sourceMarker]

      // Add nearby shop markers
      nearbyShops.forEach((shop, index) => {
        const marker = new window.google.maps.Marker({
          position: { 
            lat: shop.latitude, 
            lng: shop.longitude 
          },
          map: mapInstance,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: shop.visited ? "#22c55e" : "#3b82f6",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
          title: shop.title,
          label: {
            text: (index + 1).toString(),
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "bold"
          }
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-bold text-lg">${shop.title}</h3>
              <p class="text-sm text-muted-foreground">${shop.address}</p>
              ${shop.volume ? `
                <p class="text-sm mt-2">
                  Volume: ${shop.volume} | ARR: $${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}
                </p>
              ` : ''}
              ${shop.manager_present ? `
                <p class="text-sm">Manager: ${shop.manager_present}</p>
              ` : ''}
              ${shop.visited ? 
                `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Visited</span>` : 
                `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">Not Visited</span>`
              }
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
        })

        newMarkers.push(marker)
      })

      setMarkers(newMarkers)
    } catch (error) {
      console.error('Failed to add markers:', error)
      toast({
        title: "Error",
        description: "Failed to add location markers.",
        variant: "destructive"
      })
    }
  }, [sourceShop, nearbyShops, clearMarkers])

  const calculateRoute = useCallback(async () => {
    if (!directionsService || !directionsRenderer || nearbyShops.length === 0) {
      toast({
        title: "Error",
        description: "Map services not ready.",
        variant: "destructive"
      })
      return
    }

    setIsCalculating(true)

    try {
      const waypoints = nearbyShops.map(shop => ({
        location: { lat: shop.latitude, lng: shop.longitude },
        stopover: true
      }))

      const request = {
        origin: { lat: sourceShop.latitude, lng: sourceShop.longitude },
        destination: { lat: sourceShop.latitude, lng: sourceShop.longitude },
        waypoints,
        optimizeWaypoints: true,
        travelMode: transportMode,
      }

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === 'OK') resolve(result)
          else reject(new Error(`Directions failed: ${status}`))
        })
      })
  

      directionsRenderer.setDirections(result)
    
      // Calculate total duration from Google's response
      let totalDuration = 0
      const allSteps: RouteStep[] = []
      
      result.routes[0].legs.forEach(leg => {
        // Add the duration value from Google
        totalDuration += leg.duration!.value // this is in seconds
        
        leg.steps.forEach(step => {
          allSteps.push({
            instructions: step.instructions,
            distance: step.distance!.text,
            duration: step.duration!.text,
            maneuver: step.maneuver,
            start_location: step.start_location
          })
        })
      })
  
      // Get current time
      const now = new Date()
      
      // Calculate arrival time using Google's duration estimate
      const arrivalTime = new Date(now.getTime() + (totalDuration * 1000)) // Convert seconds to milliseconds
      
      // Format the times
      setEstimatedArrival(format(arrivalTime, 'h:mm a'))
      
      // Use Google's duration for time remaining
      const hours = Math.floor(totalDuration / 3600)
      const minutes = Math.floor((totalDuration % 3600) / 60)
      setTimeRemaining(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
  
      setRouteSteps(allSteps)
      onRouteCalculated?.(nearbyShops)
  

    } catch (error) {
      console.error('Route calculation error:', error)
      toast({
        title: "Error",
        description: "Failed to calculate route.",
        variant: "destructive"
      })
    } finally {
      setIsCalculating(false)
    }
  }, [directionsService, directionsRenderer, sourceShop, nearbyShops, transportMode])

  const handleManualMove = useCallback(async (newStep: number) => {
    if (newStep >= 0 && newStep < nearbyShops.length) {
      setCurrentStep(newStep)
      setIsAtDestination(false)

      // Update map view
      if (map && routeSteps[newStep]) {
        const targetLocation = nearbyShops[newStep]
        const targetLatLng = new google.maps.LatLng(
          targetLocation.latitude,
          targetLocation.longitude
        )
        
        map.panTo(targetLatLng)
        map.setZoom(16)

        // Update current marker if exists
        if (currentMarker) {
          currentMarker.setPosition(targetLatLng)
        }
      }
    }
  }, [map, nearbyShops, routeSteps, currentMarker])

  const handleLocationUpdate = useCallback(async (updatedLocation) => {
    try {
      const response = await fetch(`/api/coffee-shops/${updatedLocation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLocation)
      })

      if (!response.ok) throw new Error('Failed to update location')

      // Update local state
      const updatedShops = nearbyShops.map(shop =>
        shop.id === updatedLocation.id ? updatedLocation : shop
      )
      onRouteCalculated(updatedShops)

      toast({
        title: "Success",
        description: "Location information updated successfully."
      })
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: "Failed to update location information.",
        variant: "destructive"
      })
      throw error
    }
  }, [nearbyShops, onRouteCalculated])

  const handleLocationVisited = useCallback(async (location) => {
    try {
      const response = await fetch(`/api/coffee-shops/${location.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visited: true })
      })

      if (!response.ok) throw new Error('Failed to update location')

      setCurrentStep(prev => prev + 1)
      setIsAtDestination(false)

      toast({
        title: "Location Updated",
        description: "Location marked as visited.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive"
      })
    }
  }, [])

  const generateGoogleMapsUrl = useCallback(() => {
    if (!nearbyShops.length) return null;

    let url = 'https://www.google.com/maps/dir/?api=1'
    url += `&origin=${sourceShop.latitude},${sourceShop.longitude}`
    url += `&destination=${sourceShop.latitude},${sourceShop.longitude}`

    const waypoints = nearbyShops
      .map(shop => `${shop.latitude},${shop.longitude}`)
      .join('|')
    
    url += `&waypoints=${waypoints}`
    url += `&travelmode=${transportMode.toLowerCase()}`

    window.open(url, '_blank')
  }, [sourceShop, nearbyShops, transportMode])

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Map and Controls */}
      <div className="md:col-span-2 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <RadioGroup
              defaultValue={transportMode}
              onValueChange={(value) => setTransportMode(value as 'DRIVING' | 'WALKING')}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DRIVING" id="driving" />
                <Label htmlFor="driving" className="flex items-center gap-2">
                  <Car className="h-4 w-4" /> Driving
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WALKING" id="walking" />
                <Label htmlFor="walking" className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" /> Walking
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2">
              {!navigationMode ? (
                <>
                  <Button 
                    onClick={calculateRoute} 
                    disabled={isCalculating}
                  >
                    {isCalculating ? "Calculating..." : "Calculate Route"}
                  </Button>
                  {routeSteps.length > 0 && (
                    <>
                      <Button 
                        onClick={() => {
                          setNavigationMode(true)
                          setCurrentStep(0)
                        }}
                        variant="secondary"
                      >
                        Start Navigation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={generateGoogleMapsUrl}
                      >
                        Open in Google Maps
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Button 
                  onClick={() => {
                    setNavigationMode(false)
                    setCurrentStep(0)
                    setIsAtDestination(false)
                  }} 
                  variant="outline"
                >
                  Exit Navigation
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div
          id="route-map"
          className="h-[700px] w-full rounded-lg border bg-muted"
        />
      </div>

      {/* Navigation Panel */}
      <div className="md:col-span-1">
        {navigationMode ? (
          <NavigationPanel
            currentLocation={nearbyShops[currentStep]}
            nextLocation={nearbyShops[currentStep + 1]}
            currentStep={currentStep}
            totalSteps={nearbyShops.length}
            routeSteps={routeSteps}
            transportMode={transportMode}
            onStepChange={handleManualMove}
            onLocationUpdate={handleLocationUpdate}
            onLocationVisited={handleLocationVisited}
            onLocationSkipped={() => {
              setCurrentStep(prev => prev + 1)
              setIsAtDestination(false)
            }}
            onExitNavigation={() => {
              setNavigationMode(false)
              setCurrentStep(0)
              setIsAtDestination(false)
            }}
            onManualMove={handleManualMove}
            isAtDestination={isAtDestination}
            arrivalTime={estimatedArrival}
            timeRemaining={timeRemaining}
          />
        ) : (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Visit Order</h3>
                  <span className="text-sm text-muted-foreground">
                    {nearbyShops.length} locations
                  </span>
                </div>

                {/* Source Location */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">S</span>
                  </div>
                  <div>
                    <p className="font-medium">{sourceShop.title}</p>
                    <p className="text-sm text-muted-foreground">Starting Point</p>
                  </div>
                </div>

                {/* Destination List */}
                <div className="space-y-2">
                  {nearbyShops.map((shop, index) => (
                    <div
                      key={shop.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{shop.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {shop.address}
                        </p>
                      </div>
                      {shop.visited && (
                        <Badge variant="success" className="flex-shrink-0">
                          Visited
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Destination Reached Modal */}
      <DestinationReached
        show={isAtDestination}
        location={nearbyShops[currentStep]}
        onMarkVisited={() => handleLocationVisited(nearbyShops[currentStep])}
        onSkip={() => {
          setCurrentStep(prev => prev + 1)
          setIsAtDestination(false)
        }}
        arrivalTime={estimatedArrival}
      />
    </div>
  )
}