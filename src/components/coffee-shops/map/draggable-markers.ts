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
