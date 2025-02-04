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
