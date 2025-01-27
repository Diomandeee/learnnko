import { useState, useEffect, useCallback } from 'react'
import { calculateDistance, calculateBearing } from '@/lib/utils/geo'

interface LocationTrackingOptions {
  onLocationUpdate?: (position: GeolocationPosition) => void
  onLocationError?: (error: GeolocationError) => void
  onDestinationReached?: () => void
  destinationThreshold?: number // meters
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
}

export function useLocationTracking(options: LocationTrackingOptions = {}) {
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  const {
    onLocationUpdate,
    onLocationError,
    onDestinationReached,
    destinationThreshold = 50,
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 5000
  } = options

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported') as GeolocationError)
      return
    }

    setIsTracking(true)
  }, [])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  useEffect(() => {
    if (!isTracking) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position)
        onLocationUpdate?.(position)

        if (options.destination) {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            options.destination.latitude,
            options.destination.longitude
          )

          if (distance * 1000 <= destinationThreshold) {
            onDestinationReached?.()
          }
        }
      },
      (error) => {
        setError(error)
        onLocationError?.(error)
      },
      {
        enableHighAccuracy,
        maximumAge,
        timeout
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [isTracking, options.destination])

  return {
    currentPosition,
    error,
    isTracking,
    startTracking,
    stopTracking
  }
}
