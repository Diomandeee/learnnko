#!/bin/bash

# Update the useEffect cleanup in route-map.tsx
sed -i '' '/useEffect/,/}, \[/c\
  useEffect(() => {\
    const cleanup = () => {\
      if (watchId) {\
        navigator.geolocation.clearWatch(watchId)\
      }\
      cleanupMarkers()\
      if (directionsRenderer) {\
        directionsRenderer.setMap(null)\
      }\
    }\
\
    const loadGoogleMaps = () => {\
      const script = document.createElement("script")\
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`\
      script.async = true\
      script.defer = true\
      script.onload = () => {\
        const mapInstance = new window.google.maps.Map(\
          document.getElementById("route-map")!,\
          {\
            center: { lat: sourceShop.latitude, lng: sourceShop.longitude },\
            zoom: 13,\
            styles: [\
              {\
                featureType: "poi",\
                elementType: "labels",\
                stylers: [{ visibility: "off" }]\
              }\
            ]\
          }\
        )\
\
        const trafficLayer = new window.google.maps.TrafficLayer()\
        trafficLayer.setMap(mapInstance)\
\
        const directionsServiceInstance = new window.google.maps.DirectionsService()\
        const directionsRendererInstance = new window.google.maps.DirectionsRenderer({\
          map: mapInstance,\
          suppressMarkers: true,\
          preserveViewport: false\
        })\
\
        setMap(mapInstance)\
        setDirectionsService(directionsServiceInstance)\
        setDirectionsRenderer(directionsRendererInstance)\
\
        addShopMarkers(mapInstance)\
        startLocationTracking(mapInstance)\
      }\
\
      document.body.appendChild(script)\
      return () => {\
        document.body.removeChild(script)\
      }\
    }\
\
    loadGoogleMaps()\
    return cleanup\
  }, [addShopMarkers, startLocationTracking, cleanupMarkers, watchId, directionsRenderer, sourceShop.latitude, sourceShop.longitude])\
' src/components/coffee-shops/map/route-map.tsx

echo "Fixed cleanup function order in useEffect"