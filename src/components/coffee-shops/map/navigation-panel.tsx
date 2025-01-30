"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NavigationControls } from "./navigation-controls"

export function NavigationPanel({
  currentLocation,
  nextLocation,
  currentStep,
  totalSteps,
  routeSteps,
  transportMode,
  onStepChange,
  onLocationUpdate,
  onLocationVisited,
  onLocationSkipped,
  onExitNavigation,
  onManualMove,
  isAtDestination,
  arrivalTime,
  timeRemaining,
}) {
  const [showSteps, setShowSteps] = useState(true)

  return (
    <Card className="h-full">
      <CardHeader className="sticky top-0 bg-card z-10 pb-4">
        <CardTitle>Navigation</CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-6">
          {/* Navigation Controls */}
          <NavigationControls
            currentLocation={currentLocation}
            canMoveNext={currentStep < totalSteps - 1}
            canMovePrevious={currentStep > 0}
            onMoveNext={() => onManualMove(currentStep + 1)}
            onMovePrevious={() => onManualMove(currentStep - 1)}
            onLocationUpdate={onLocationUpdate}
            transportMode={transportMode}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />

          {/* Directions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Directions</h3>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {showSteps ? "Hide" : "Show"}
              </button>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}