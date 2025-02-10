"use client"

import { useEffect, useState } from "react"
import { CoffeeShop } from "@prisma/client"

interface RouteLayerProps {
  route: CoffeeShop[]
  color?: string
  strokeWidth?: number
  opacity?: number
}

export function RouteLayer({
  route,
  color = "#3B82F6",
  strokeWidth = 3,
  opacity = 0.8
}: RouteLayerProps) {
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null)

  useEffect(() => {
    if (!route.length || !google) return

    // Create polyline for route
    const routePath = route.map(shop => ({
      lat: shop.latitude,
      lng: shop.longitude
    }))

    const newPolyline = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: strokeWidth,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          strokeColor: color,
        },
        offset: '50%',
        repeat: '100px'
      }]
    })

    setPolyline(newPolyline)

    return () => {
      if (polyline) {
        polyline.setMap(null)
      }
    }
  }, [route, color, strokeWidth, opacity])

  return null // This is a headless component
}
