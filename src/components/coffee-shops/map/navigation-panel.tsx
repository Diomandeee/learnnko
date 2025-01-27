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

            {showSteps && (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {routeSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentStep === index
                          ? "bg-primary/10 border border-primary"
                          : index < currentStep
                          ? "bg-muted/50 opacity-50"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => onStepChange(index)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <div
                            dangerouslySetInnerHTML={{ __html: step.instructions }}
                            className="text-sm"
                          />
                          <div className="text-xs mt-1 opacity-80">
                            {step.distance} • {step.duration}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}