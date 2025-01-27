"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Navigation, ChevronRight } from "lucide-react"

export function DirectionsPanel({ directions, currentStep, onStepChange }) {
  const [steps, setSteps] = useState([])
  const [totalDistance, setTotalDistance] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  useEffect(() => {
    if (directions && directions.routes && directions.routes[0]) {
      const route = directions.routes[0]
      let allSteps = []
      let totalDist = 0
      let totalTime = 0

      route.legs.forEach((leg) => {
        totalDist += leg.distance.value
        totalTime += leg.duration.value
        
        leg.steps.forEach((step) => {
          allSteps.push({
            instructions: step.instructions,
            distance: step.distance.text,
            duration: step.duration.text,
            maneuver: step.maneuver
          })
        })
      })

      setSteps(allSteps)
      setTotalDistance(totalDist / 1000) // Convert to km
      setTotalDuration(Math.round(totalTime / 60)) // Convert to minutes
    }
  }, [directions])

  if (!steps.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Steps</CardTitle>
        <CardDescription>
          {totalDistance.toFixed(1)}km • {totalDuration} mins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                  currentStep === index
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                }`}
                role="button"
                onClick={() => onStepChange(index)}
              >
                <div className="mt-1">
                  {step.maneuver === "turn-right" && (
                    <ChevronRight className="h-4 w-4 -rotate-90" />
                  )}
                  {step.maneuver === "turn-left" && (
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  )}
                  {!step.maneuver && <Navigation className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: step.instructions }}
                  />
                  <div className="text-xs mt-1 opacity-80">
                    {step.distance} • {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}