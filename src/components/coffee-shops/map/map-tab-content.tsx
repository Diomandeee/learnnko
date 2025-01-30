"use client"

import { useState } from "react"
import RouteMap from "./route-map"
import { CoffeeShop } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight,
  X,
  Check,
} from "lucide-react"

interface MapTabContentProps {
  shop: CoffeeShop
  nearbyShops: CoffeeShop[]
  maxDistance: number
}

export function MapTabContent({ shop, nearbyShops, maxDistance }: MapTabContentProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentStopIndex, setCurrentStopIndex] = useState(-1)
  const [visitedStops, setVisitedStops] = useState<number[]>([])
  const [optimizedRoute, setOptimizedRoute] = useState<CoffeeShop[]>([])

  const handleStartDirections = () => {
    // Start with the optimized route passed from the map component
    setOptimizedRoute(nearbyShops)
    setCurrentStopIndex(0)
    setVisitedStops([])
    setIsNavigating(true)
  }

  const handleCancelDirections = () => {
    setIsNavigating(false)
    setCurrentStopIndex(-1)
    setVisitedStops([])
    setOptimizedRoute([])
  }

  const handleLocationVisited = () => {
    setVisitedStops(prev => [...prev, currentStopIndex])
    
    // Move to next location if available
    if (currentStopIndex < optimizedRoute.length - 1) {
      setCurrentStopIndex(prev => prev + 1)
    } else {
      // End navigation if all locations visited
      handleCancelDirections()
    }
  }

  const handleSkipLocation = () => {
    if (currentStopIndex < optimizedRoute.length - 1) {
      setCurrentStopIndex(prev => prev + 1)
    }
  }

  const getCurrentLocation = () => {
    if (currentStopIndex === -1) return null
    return optimizedRoute[currentStopIndex]
  }

  return (
    <div className="space-y-4">
      {!isNavigating ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Route Planning</h3>
              <p className="text-sm text-muted-foreground">
                Showing {nearbyShops.length} nearby locations within {maxDistance}km
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <RouteMap
                sourceShop={shop}
                nearbyShops={nearbyShops}
                maxDistance={maxDistance}
                onRouteCalculated={setOptimizedRoute}
                isNavigating={isNavigating}
                currentStopIndex={currentStopIndex}
              />
            </div>

         
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <RouteMap
              sourceShop={shop}
              nearbyShops={[getCurrentLocation()]}
              maxDistance={maxDistance}
              isNavigating={isNavigating}
              currentStopIndex={currentStopIndex}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Destination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                      {currentStopIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getCurrentLocation()?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCurrentLocation()?.address}w
                      </p>
                    </div>
                  </div>

                  {/* Location details */}
                  {getCurrentLocation()?.volume && (
                    <div className="mt-2 text-sm">
                      Volume: {getCurrentLocation().volume} | ARR: ${((parseFloat(getCurrentLocation().volume) * 52) * 18).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleLocationVisited}
                    className="w-full"
                    variant="success"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Visited
                  </Button>
                  <Button
                    onClick={handleSkipLocation}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Skip Location
                  </Button>
                  <Button
                    onClick={handleCancelDirections}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Navigation
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Location {currentStopIndex + 1} of {optimizedRoute.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}