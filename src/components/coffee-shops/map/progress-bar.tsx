"use client"

import { cn } from "@/lib/utils"

interface RouteProgressProps {
  currentStep: number
  totalSteps: number
  currentDistance: number
  totalDistance: number
  className?: string
}

export function RouteProgress({ 
  currentStep, 
  totalSteps, 
  currentDistance, 
  totalDistance,
  className 
}: RouteProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress Bar */}
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress Stats */}
      <div className="flex justify-between text-sm">
        <span>Stop {currentStep + 1} of {totalSteps}</span>
        <span className="text-muted-foreground">
          {currentDistance.toFixed(1)}km / {totalDistance.toFixed(1)}km
        </span>
      </div>
    </div>
  )
}
