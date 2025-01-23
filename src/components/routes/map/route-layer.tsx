"use client"

import { Polyline } from "react-leaflet"
import { CoffeeShop } from "@prisma/client"

interface RouteLayerProps {
  route?: CoffeeShop[]
  color?: string
}

export function RouteLayer({ route, color = "#3B82F6" }: RouteLayerProps) {
  if (!route || route.length < 2) return null

  const positions = route.map(shop => [shop.latitude, shop.longitude])

  return (
    <Polyline
      positions={positions as [number, number][]}
      pathOptions={{
        color,
        weight: 3,
        opacity: 0.7,
      }}
    />
  )
}
