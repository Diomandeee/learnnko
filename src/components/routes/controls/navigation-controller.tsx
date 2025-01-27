"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouteStore } from "@/store/route-store"
import { useToast } from "@/components/ui/use-toast"
import {
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Navigation,
  Check,
} from "lucide-react"

export function NavigationController() {
  const {
    currentRoute,
    isNavigating,
    currentStep,
    startNavigation,
    stopNavigation,
    nextStep,
    previousStep,
  } = useRouteStore()
  const { toast } = useToast()

  const currentLocation = currentRoute[currentStep]

  const handleStartNavigation = () => {
    if (currentRoute.length === 0) {
      toast({
        title: "No route selected",
        description: "Please create a route first.",
        variant: "destructive"
      })
      return
    }
    startNavigation()
  }

  if (!isNavigating) {
    return (
      <Button 
        className="w-full" 
        onClick={handleStartNavigation}
      >
        <Play className="mr-2 h-4 w-4" />
        Start Navigation
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Navigation</CardTitle>
          <Badge variant="secondary">
            Stop {currentStep + 1} of {currentRoute.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{currentLocation?.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentLocation?.address}
          </p>
          {currentLocation?.volume && (
            <p className="text-sm">
              Volume: {currentLocation.volume} | ARR: ${((parseFloat(currentLocation.volume) * 52) * 18).toLocaleString()}
            </p>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={nextStep}
            disabled={currentStep === currentRoute.length - 1}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="secondary"
            onClick={() => {
              // Mark current location as visited
              // Update visit status
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark Visited
          </Button>
          <Button 
            variant="destructive"
            onClick={stopNavigation}
          >
            <X className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
