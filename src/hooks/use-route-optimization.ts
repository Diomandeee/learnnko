
// src/hooks/use-route-optimization.ts

import { useState, useCallback } from 'react'
import { optimizeRoute } from '@/lib/utils/route-optimizer'
import { useToast } from '@/components/ui/use-toast'

export function useRouteOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const { toast } = useToast()

  const optimizeLocations = useCallback(async (
    startLocation,
    locations,
    options = {}
  ) => {
    setIsOptimizing(true)
    try {
      const optimizedRoute = await optimizeRoute(startLocation, locations, options)
      return optimizedRoute
    } catch (error) {
      console.error('Route optimization error:', error)
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize route. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  return {
    isOptimizing,
    optimizeLocations
  }
}
