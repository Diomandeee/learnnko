#!/bin/bash

# Create ProgressBar component
cat > src/components/coffee-shops/map/progress-bar.tsx << 'EOL'
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
EOL

# Create route connector arrows
cat > src/components/coffee-shops/map/route-connectors.ts << 'EOL'
export function drawRouteConnectors(
  mapInstance: google.maps.Map,
  shops: any[],
  currentStep: number
) {
  // Remove existing polylines
  window.routeConnectors?.forEach(connector => connector.setMap(null))
  window.routeConnectors = []

  // Draw connectors between consecutive stops
  shops.forEach((shop, index) => {
    if (index < shops.length - 1) {
      const nextShop = shops[index + 1]
      
      // Create arrow symbol
      const lineSymbol = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        strokeColor: "#666666"
      }

      // Create polyline with arrow
      const connector = new google.maps.Polyline({
        path: [
          { lat: shop.latitude, lng: shop.longitude },
          { lat: nextShop.latitude, lng: nextShop.longitude }
        ],
        icons: [{
          icon: lineSymbol,
          offset: '50%'
        }],
        map: mapInstance,
        strokeColor: index === currentStep ? "#3b82f6" : "#666666",
        strokeWeight: index === currentStep ? 3 : 2,
        strokeOpacity: index === currentStep ? 1 : 0.5,
      })

      window.routeConnectors.push(connector)
    }
  })
}
EOL

# Add marker dragging functionality
cat > src/components/coffee-shops/map/draggable-markers.ts << 'EOL'
export function enableMarkerDragging(
  mapInstance: google.maps.Map,
  markers: google.maps.Marker[],
  onReorder: (newOrder: number[]) => void
) {
  markers.forEach((marker, index) => {
    marker.setDraggable(true)
    
    marker.addListener('dragstart', () => {
      window.dragStartIndex = index
    })

    marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return
      
      // Find nearest marker
      let minDistance = Infinity
      let nearestIndex = index
      
      markers.forEach((m, i) => {
        if (i === index) return
        
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          event.latLng!,
          m.getPosition()!
        )
        
        if (distance < minDistance) {
          minDistance = distance
          nearestIndex = i
        }
      })

      // Reorder array
      const newOrder = [...Array(markers.length)].map((_, i) => i)
      const [removed] = newOrder.splice(window.dragStartIndex, 1)
      newOrder.splice(nearestIndex, 0, removed)
      
      onReorder(newOrder)
    })
  })
}
EOL

# Update route-map.tsx to include new features
echo "Add to route-map.tsx dependencies:"
echo "1. Import new components"
echo "2. Add state for distances"
echo "3. Update marker creation to include dragging"
echo "4. Add route connectors to map"

echo "Update the JSX to include progress bar:"
echo '
  <Card className="p-4">
    <RouteProgress
      currentStep={currentStep}
      totalSteps={nearbyShops.length}
      currentDistance={currentDistance}
      totalDistance={totalDistance}
      className="mb-4"
    />
    ...rest of card content
  </Card>
'