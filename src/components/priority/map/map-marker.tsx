"use client"

import { CoffeeShop } from "@prisma/client"
import { useMemo } from "react"

interface MapMarkerProps {
  shop: CoffeeShop
  isSelected?: boolean
  isOptimized?: boolean
  sequenceNumber?: number
  onClick?: () => void
}

export function MapMarker({
  shop,
  isSelected,
  isOptimized,
  sequenceNumber,
  onClick
}: MapMarkerProps) {
  const marker = useMemo(() => {
    if (!google) return null

    // Create custom marker icon
    const iconUrl = createMarkerIcon(shop, isSelected, isOptimized, sequenceNumber)
    
    const marker = new google.maps.Marker({
      position: { lat: shop.latitude, lng: shop.longitude },
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 15)
      },
      title: shop.title,
      optimized: false
    })

    // Create info window content
    const content = `
      <div class="p-4 min-w-[200px]">
        <div class="font-bold text-lg mb-2">${shop.title}</div>
        <div class="text-sm mb-2">${shop.address}</div>
        ${shop.volume ? `
          <div class="text-sm mb-2">Volume: ${shop.volume}/week</div>
          <div class="text-sm mb-2">ARR: $${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}</div>
        ` : ''}
        <div class="flex flex-wrap gap-2 mt-2">
          ${shop.isPartner ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Partner</span>' : ''}
          ${shop.parlor_coffee_leads ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Lead</span>' : ''}
          ${shop.visited ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Visited</span>' : ''}
          ${shop.priority ? `<span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Priority ${shop.priority}</span>` : ''}
        </div>
      </div>
    `

    const infoWindow = new google.maps.InfoWindow({
      content,
      maxWidth: 300
    })

    // Add click listener
    marker.addListener('click', () => {
      if (onClick) onClick()
      infoWindow.open({
        anchor: marker,
        map: marker.getMap()
      })
    })

    return marker
  }, [shop, isSelected, isOptimized, sequenceNumber, onClick])

  return null // This is a headless component
}

// Helper function to create marker icon as data URL
function createMarkerIcon(
  shop: CoffeeShop,
  isSelected?: boolean,
  isOptimized?: boolean,
  sequenceNumber?: number
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  canvas.width = 30
  canvas.height = 30

  // Set marker color based on shop properties
  let color = '#6B7280' // Default gray
  if (shop.isPartner) color = '#22C55E' // Green
  else if (shop.parlor_coffee_leads) color = '#EAB308' // Yellow
  else if (shop.priority >= 4) color = '#8B5CF6' // Purple
  else if (shop.visited) color = '#3B82F6' // Blue

  // Draw marker circle
  ctx.beginPath()
  ctx.arc(15, 15, 12, 0, Math.PI * 2)
  ctx.fillStyle = isSelected ? '#EF4444' : color // Red if selected
  ctx.fill()
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw sequence number if optimized
  if (isOptimized && typeof sequenceNumber === 'number') {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sequenceNumber.toString(), 15, 15)
  }

  return canvas.toDataURL()
}
