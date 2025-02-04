import { useEffect, useState, useCallback } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { NavigationPanel } from "./navigation-panel"
import { Car, Navigation, RefreshCw, ChevronLeft, ChevronRight, Map, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { loadGoogleMaps } from "@/lib/google-maps-loader"
import { Badge } from "@/components/ui/badge"
  
interface RouteStep {
  instructions: string
  distance: string
  duration: string
  maneuver?: string
  start_location: google.maps.LatLng
}

export default function RouteMap({ sourceShop, nearbyShops, maxDistance, onRouteCalculated }) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null)
  const [shopMarkers, setShopMarkers] = useState<google.maps.Marker[]>([])
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [navigationMode, setNavigationMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([])
  const [transportMode, setTransportMode] = useState<'DRIVING' | 'WALKING'>('DRIVING')
  const [isAtDestination, setIsAtDestination] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const { toast } = useToast()


  // Initialize map only once when component mounts
  useEffect(() => {
    let mapInstance: google.maps.Map | null = null;

    const initializeMap = async () => {
      try {
        await loadGoogleMaps();
        
        if (!sourceShop || !document.getElementById("route-map")) return;

        mapInstance = new window.google.maps.Map(
          document.getElementById("route-map")!,
          {
            center: { lat: sourceShop.latitude, lng: sourceShop.longitude },
            zoom: 13,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }
        );

        const directionsServiceInstance = new window.google.maps.DirectionsService();
        const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true,
          preserveViewport: false
        });

        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);
        setIsMapInitialized(true);

        // Initialize traffic layer
        const trafficLayer = new window.google.maps.TrafficLayer();
        trafficLayer.setMap(mapInstance);

        // Add markers and start location tracking if enabled
        if (mapInstance) {
          addShopMarkers(mapInstance);
          if (locationEnabled) {
            await startLocationTracking(mapInstance);
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "Error",
          description: "Failed to load Google Maps",
          variant: "destructive"
        });
      }
    };

    initializeMap();

    return () => {
      cleanupMarkers();
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
      stopLocationTracking();
      setIsMapInitialized(false);
    };
  }, [sourceShop]); // Only re-run if sourceShop changes

  
  // Clean up function for markers and info windows
  const cleanupMarkers = useCallback(() => {
    shopMarkers.forEach(marker => marker.setMap(null))
    setShopMarkers([])
    infoWindows.forEach(window => window.close())
    setInfoWindows([])
    if (userMarker) {
      userMarker.setMap(null)
      setUserMarker(null)
    }
  }, [shopMarkers, infoWindows, userMarker])

  const addShopMarkers = useCallback((mapInstance: google.maps.Map) => {
    cleanupMarkers()
    
    const newMarkers = []
    const newInfoWindows = []

    // Source shop marker
    const sourceMarker = new window.google.maps.Marker({
      position: { lat: sourceShop.latitude, lng: sourceShop.longitude },
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

    const sourceInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-bold text-lg">${sourceShop.title}</h3>
          <p class="text-sm text-muted-foreground">${sourceShop.address || 'Starting Point'}</p>
        </div>
      `
    })

    sourceMarker.addListener('click', () => {
      infoWindows.forEach(window => window.close())
      sourceInfoWindow.open(mapInstance, sourceMarker)
    })

    newMarkers.push(sourceMarker)
    newInfoWindows.push(sourceInfoWindow)

    // Nearby shop markers
    nearbyShops.forEach((shop, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: shop.latitude, lng: shop.longitude },
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
        infoWindows.forEach(window => window.close())
        infoWindow.open(mapInstance, marker)
      })

      newMarkers.push(marker)
      newInfoWindows.push(infoWindow)
    })

    setShopMarkers(newMarkers)
    setInfoWindows(newInfoWindows)
  }, [sourceShop, nearbyShops, cleanupMarkers, infoWindows])

  const updateUserMarker = useCallback((position: google.maps.LatLngLiteral, mapInstance: google.maps.Map) => {
    if (!isMapInitialized || !mapInstance) return;
    if (!userMarker) {
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: "Your Location"
      })
      setUserMarker(marker)
    } else {
      userMarker.setPosition(position)
    }
  }, [userMarker, isMapInitialized])


  const startLocationTracking = useCallback(async (mapInstance: google.maps.Map) => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Error",
        description: "Geolocation is not supported in your browser.",
        variant: "destructive"
      })
      return
    }

    try {
      // Request location permission
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      if (permission.state === 'denied') {
        toast({
          title: "Permission Denied",
          description: "Please enable location access to use navigation features.",
          variant: "destructive"
        })
        return
      }

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          setUserLocation(userPos)
          setLocationEnabled(true)
          updateUserMarker(userPos, mapInstance)

          if (navigationMode) {
            mapInstance.panTo(userPos)
            mapInstance.setZoom(16)
          }

          // Start continuous tracking
          const id = navigator.geolocation.watchPosition(
            async (newPosition) => {
              const newPos = {
                lat: newPosition.coords.latitude,
                lng: newPosition.coords.longitude
              }

              setUserLocation(newPos)
              updateUserMarker(newPos, mapInstance)

              // Check distance to destination
              if (nearbyShops.length > 0 && currentStep < nearbyShops.length) {
                const nextDestination = nearbyShops[currentStep]
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(newPos.lat, newPos.lng),
                  new google.maps.LatLng(nextDestination.latitude, nextDestination.longitude)
                )

                if (distance < 50) {
                  setIsAtDestination(true)
                }
              }

              // Update map view in navigation mode
              if (navigationMode) {
                mapInstance.panTo(newPos)
              }

              // Recalculate route if needed
              if (routeSteps.length > 0) {
                const lastPos = userLocation
                if (lastPos) {
                  const movement = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(lastPos.lat, lastPos.lng),
                    new google.maps.LatLng(newPos.lat, newPos.lng)
                  )
                  if (movement > 50) {
                    await calculateRoute()
                  }
                }
              }
            },
            (error) => {
              console.error("Location tracking error:", error)
              toast({
                title: "Location Error",
                description: "Failed to track location.",
                variant: "destructive"
              })
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000
            }
          )

          setWatchId(id)
        },
        (error) => {
          console.error("Location error:", error)
          toast({
            title: "Location Error",
            description: "Failed to get your location.",
            variant: "destructive"
          })
        }
      )
    } catch (error) {
      console.error("Location initialization error:", error)
      toast({
        title: "Error",
        description: "Failed to initialize location tracking.",
        variant: "destructive"
      })
    }
  }, [navigationMode, nearbyShops, currentStep, userLocation, routeSteps.length, updateUserMarker])

  const stopLocationTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    if (userMarker) {
      userMarker.setMap(null)
      setUserMarker(null)
    }
    setLocationEnabled(false)
  }, [watchId, userMarker])

  const calculateRoute = useCallback(async () => {
    if (!directionsService || !directionsRenderer || nearbyShops.length === 0) return

    setIsCalculating(true)

    try {
      const waypoints = nearbyShops.map(shop => ({
        location: { lat: shop.latitude, lng: shop.longitude },
        stopover: true
      }))

      const origin = userLocation || { lat: sourceShop.latitude, lng: sourceShop.longitude }

      const request = {
        origin,
        destination: { lat: sourceShop.latitude, lng: sourceShop.longitude },
        waypoints,
        optimizeWaypoints: true,
        travelMode: transportMode === 'WALKING' ? 
          google.maps.TravelMode.WALKING : 
          google.maps.TravelMode.DRIVING,
      }

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === 'OK') resolve(result)
          else reject(new Error(`Directions failed: ${status}`))
        })
      })

      directionsRenderer.setDirections(result)

      let totalDuration = 0
      const allSteps: RouteStep[] = []
      
      result.routes[0].legs.forEach(leg => {
        totalDuration += leg.duration!.value
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

      const now = new Date()
      const arrivalTime = new Date(now.getTime() + (totalDuration * 1000))
      
      setEstimatedArrival(format(arrivalTime, 'h:mm a'))
      
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
  }, [directionsService, directionsRenderer, sourceShop, nearbyShops, transportMode, userLocation])

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

      // Update markers and route
      if (map) {
        addShopMarkers(map)
        await calculateRoute()
      }

      toast({
        title: "Success",
        description: "Location marked as visited.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive"
      })
    }
  }, [map, addShopMarkers, calculateRoute])

  const handleRefresh = useCallback(async () => {
    setIsCalculating(true)
    try {
      if (map) {
        addShopMarkers(map)
        await calculateRoute()
      }
      toast({
        title: "Map Refreshed",
        description: "Route and markers have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh map.",
        variant: "destructive"
      })
    } finally {
      setIsCalculating(false)
    }
  }, [map, addShopMarkers, calculateRoute])

  const handleNextLocation = useCallback(async () => {
    if (currentStep < nearbyShops.length - 1) {
      setCurrentStep(prev => prev + 1)
      setIsAtDestination(false)
      
      const nextLocation = nearbyShops[currentStep + 1]
      if (map) {
        map.panTo({ lat: nextLocation.latitude, lng: nextLocation.longitude })
        map.setZoom(16)
        await calculateRoute()
      }
    }
  }, [currentStep, nearbyShops, map, calculateRoute])

  const handlePreviousLocation = useCallback(async () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setIsAtDestination(false)
      
      const previousLocation = nearbyShops[currentStep - 1]
      if (map) {
        map.panTo({ lat: previousLocation.latitude, lng: previousLocation.longitude })
        map.setZoom(16)
        await calculateRoute()
      }
    }
  }, [currentStep, nearbyShops, map, calculateRoute])

  const generateGoogleMapsUrl = useCallback(() => {
    if (!nearbyShops.length) return null

    let url = 'https://www.google.com/maps/dir/?api=1'
    const startPoint = userLocation || { lat: sourceShop.latitude, lng: sourceShop.longitude }
    
    url += `&origin=${startPoint.lat},${startPoint.lng}`
    url += `&destination=${sourceShop.latitude},${sourceShop.longitude}`

    const waypoints = nearbyShops
      .map(shop => `${shop.latitude},${shop.longitude}`)
      .join('|')
    
    url += `&waypoints=${waypoints}`
    url += `&travelmode=${transportMode.toLowerCase()}`

    return url
  }, [sourceShop, nearbyShops, transportMode, userLocation])

  useEffect(() => {
    const loadGoogleMaps = () => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = () => {
        const mapInstance = new window.google.maps.Map(
          document.getElementById("route-map")!,
          {
            center: { lat: sourceShop.latitude, lng: sourceShop.longitude },
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

        addShopMarkers(mapInstance)
        startLocationTracking(mapInstance)
      }

      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }

    loadGoogleMaps()

    return () => {
      stopLocationTracking()
      cleanupMarkers()
      if (directionsRenderer) {
        directionsRenderer.setMap(null)
      }
    }
  }, [])

  return (
    <div className="flex flex-col space-y-4">
    {/* Controls Card - Full width on all devices */}
    <Card className="p-4 w-full">
      <div className="flex flex-col space-y-4">
        {/* Transport Mode Selection */}
        <div className="w-full">
          <RadioGroup
            defaultValue={transportMode}
            onValueChange={async (value) => {
              setTransportMode(value as 'DRIVING' | 'WALKING')
              if (routeSteps.length > 0) {
                await calculateRoute()
              }
            }}
            className="flex justify-center sm:justify-start gap-4"
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
        </div>

        {/* Action Buttons - Grid layout for all screen sizes */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUserLocation(!showUserLocation)}
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            {showUserLocation ? "Hide" : "Show"} Location
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isCalculating}
            className="w-full"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isCalculating && "animate-spin"
            )} />
            Refresh
          </Button>

          {locationEnabled && (
            <>
              <Button 
                onClick={calculateRoute} 
                disabled={isCalculating}
                className="w-full"
              >
                {isCalculating ? "Calculating..." : "Calculate"}
              </Button>
              
              {routeSteps.length > 0 && (
                <>
                  <Button 
                    onClick={() => {
                      setNavigationMode(true)
                      setCurrentStep(0)
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    Start
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = generateGoogleMapsUrl()
                      if (url) window.open(url, '_blank')
                    }}
                    className="w-full col-span-2"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                </>
              )}
            </>
          )}
        </div>

    {/* Navigation Controls - Only show when in navigation mode */}
    {navigationMode && (
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline"
          onClick={handlePreviousLocation}
          disabled={currentStep === 0}
          className="w-full"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={handleNextLocation}
          disabled={currentStep === nearbyShops.length - 1}
          className="w-full"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
        
        <Button 
          onClick={() => {
            setNavigationMode(false)
            setCurrentStep(0)
            setIsAtDestination(false)
          }}
          variant="outline"
          className="w-full"
        >
          Exit
        </Button>
      </div>
    )}
  </div>
      </Card>
  
      {/* Main Content Grid - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container - Full width on mobile */}
        <div className="lg:col-span-2 space-y-4">
          <div
            id="route-map"
            className="h-[50vh] sm:h-[60vh] lg:h-[700px] w-full rounded-lg border bg-muted"
          />
        </div>
  
        {/* Side Panel - Full width on mobile */}
        <div className="lg:col-span-1">
          {navigationMode ? (
            <NavigationPanel
              currentLocation={nearbyShops[currentStep]}
              nextLocation={nearbyShops[currentStep + 1]}
              currentStep={currentStep}
              totalSteps={nearbyShops.length}
              routeSteps={routeSteps}
              transportMode={transportMode}
              onStepChange={async (newStep) => {
                setCurrentStep(newStep)
                setIsAtDestination(false)
                if (map && nearbyShops[newStep]) {
                  const targetLocation = nearbyShops[newStep]
                  map.panTo({ lat: targetLocation.latitude, lng: targetLocation.longitude })
                  map.setZoom(16)
                  await calculateRoute()
                }
              }}
              onLocationUpdate={async (updatedLocation) => {
                try {
                  const response = await fetch(`/api/coffee-shops/${updatedLocation.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedLocation)
                  })
  
                  if (!response.ok) throw new Error('Failed to update location')
  
                  toast({
                    title: "Success",
                    description: "Location information updated."
                  })
  
                  if (map) {
                    addShopMarkers(map)
                    await calculateRoute()
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to update location.",
                    variant: "destructive"
                  })
                }
              }}
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
              onPreviousLocation={handlePreviousLocation}
              onNextLocation={handleNextLocation}
              isAtDestination={isAtDestination}
              arrivalTime={estimatedArrival}
              timeRemaining={timeRemaining}
              className="h-[calc(50vh-4rem)] sm:h-auto overflow-y-auto"
            />
          ) : (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Visit Order</h3>
                  <span className="text-sm text-muted-foreground">
                    {nearbyShops.length} locations
                  </span>
                </div>
  
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">S</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{sourceShop.title}</p>
                    <p className="text-sm text-muted-foreground truncate">Starting Point</p>
                  </div>
                </div>
  
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {nearbyShops.map((shop, index) => (
                    <div
                      key={shop.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
          )}
        </div>
      </div>
    </div>
  )
}
