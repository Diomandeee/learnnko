"use client"

import { useEffect, useState } from "react"
import { CoffeeShop } from "@prisma/client"
import { MapContainer, TileLayer, Circle, Marker } from "react-leaflet"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapPreviewProps {
  startingPoint: CoffeeShop
  maxDistance: number
  className?: string
}

export function MapPreview({
  startingPoint,
  maxDistance,
  className
}: MapPreviewProps) {
  return (
    <div className={className}>
      <MapContainer
        center={[startingPoint.latitude, startingPoint.longitude]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[startingPoint.latitude, startingPoint.longitude]}
        />
        <Circle
          center={[startingPoint.latitude, startingPoint.longitude]}
          radius={maxDistance * 1000}
          pathOptions={{ fillColor: "blue", fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  )
}
