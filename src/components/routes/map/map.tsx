"use client"

import { useEffect, useRef } from "react"
import { useMapStore } from "@/store/use-map"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { ShopMarker } from "./shop-marker"
import { RouteLayer } from "./route-layer"
import { useShops } from "@/hooks/use-shops"

export function Map() {
  const mapRef = useRef(null)
  const { shops = [], loading } = useShops()
  const { center, zoom, selectedShop, setSelectedShop } = useMapStore()

  if (loading) {
    return <div>Loading map...</div>
  }

  return (
    <div className="h-[800px] rounded-lg border">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {shops?.map((shop) => (
          <ShopMarker
            key={shop.id}
            shop={shop}
            selected={selectedShop?.id === shop.id}
            onSelect={setSelectedShop}
          />
        ))}

        <RouteLayer />
      </MapContainer>
    </div>
  )
}
