
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouteStore } from "@/store/route-store";
import { useRouter } from "next/navigation";

interface MapWrapperType extends google.maps.Map {
 markers?: google.maps.Marker[];
 currentLocationMarker?: google.maps.Marker;
 directionsRenderer?: google.maps.DirectionsRenderer;
}

export function RouteMap() {
 const mapRef = useRef<HTMLDivElement>(null);
 const [map, setMap] = useState<MapWrapperType | null>(null);
 const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
 const {
   currentRoute,
   settings,
   isNavigating,
   currentStep,
   currentLocation,
   setMetrics
 } = useRouteStore();
 const { toast } = useToast();
 const router = useRouter();

 // Helper function to create marker content
 const createMarkerContent = (location, index: number) => {
   return `
     <div class="p-4 min-w-[200px]">
       <div class="font-bold text-lg mb-2">${index + 1}. ${location.title}</div>
       <div class="text-sm mb-2">${location.address}</div>
       ${location.phone ? `<div class="text-sm mb-2">📞 ${location.phone}</div>` : ''}
       ${location.volume ? `
         <div class="text-sm mb-2">Volume: ${location.volume}</div>
         <div class="text-sm mb-2">ARR: $${((parseFloat(location.volume) * 52) * 18).toLocaleString()}</div>
       ` : ''}
       <div class="flex flex-wrap gap-2 mt-2">
         ${location.is_source ? '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Partner</span>' : ''}
         ${location.visited ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Visited</span>' : ''}
         ${location.parlor_coffee_leads ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Lead</span>' : ''}
       </div>
       <div class="mt-4">
         <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}', '_blank')" 
                 class="text-sm text-blue-600 hover:text-blue-800">
           Open in Google Maps
         </button>
       </div>
     </div>
   `;
 };

 // Initialize map
 useEffect(() => {
   if (!mapRef.current) return;

   const initMap = async () => {
     try {
       if (!window.google) {
         const script = document.createElement('script');
         script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
         script.async = true;
         script.defer = true;
         document.head.appendChild(script);

         await new Promise((resolve) => {
           script.onload = resolve;
         });
       }

       const mapInstance = new google.maps.Map(mapRef.current, {
         zoom: 12,
         center: currentLocation 
           ? { lat: currentLocation.lat, lng: currentLocation.lng }
           : { lat: 40.7128, lng: -74.0060 },
         styles: [
           {
             featureType: "poi",
             elementType: "labels",
             stylers: [{ visibility: "off" }]
           }
         ]
       }) as MapWrapperType;

       const directionsServiceInstance = new google.maps.DirectionsService();
       const directionsRendererInstance = new google.maps.DirectionsRenderer({
         map: mapInstance,
         suppressMarkers: true,
       });

       mapInstance.directionsRenderer = directionsRendererInstance;
       
       setMap(mapInstance);
       setDirectionsService(directionsServiceInstance);

     } catch (error) {
       console.error('Failed to initialize map:', error);
       toast({
         title: "Error",
         description: "Failed to load map. Please refresh the page.",
         variant: "destructive"
       });
     }
   };

   initMap();

   return () => {
     if (map) {
       if (map.markers) {
         map.markers.forEach(marker => marker.setMap(null));
       }
       if (map.directionsRenderer) {
         map.directionsRenderer.setMap(null);
       }
     }
   };
 }, []);

 // Update route display when currentRoute changes
 useEffect(() => {
   if (!map || !directionsService || currentRoute.length < 2) {
     if (map && map.directionsRenderer) {
       map.directionsRenderer.setDirections({ routes: [] });
     }
     return;
   }

   const updateRoute = async () => {
     try {
       const waypoints = currentRoute.slice(1, -1).map(location => ({
         location: { lat: location.latitude, lng: location.longitude },
         stopover: true
       }));

       const request = {
         origin: { lat: currentRoute[0].latitude, lng: currentRoute[0].longitude },
         destination: { 
           lat: currentRoute[currentRoute.length - 1].latitude, 
           lng: currentRoute[currentRoute.length - 1].longitude 
         },
         waypoints,
         optimizeWaypoints: true,
         travelMode: settings.transportMode as google.maps.TravelMode,
         avoidHighways: settings.avoidHighways,
         avoidTolls: settings.avoidTolls,
       };

       const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
         directionsService.route(request, (result, status) => {
           if (status === 'OK') resolve(result);
           else reject(new Error(`Directions request failed: ${status}`));
         });
       });

       if (map.directionsRenderer) {
         map.directionsRenderer.setDirections(result);
       }

       // Update markers
       if (map.markers) {
         map.markers.forEach(marker => marker.setMap(null));
       }

       map.markers = currentRoute.map((location, index) => {
         // Create marker
         const marker = new google.maps.Marker({
           position: { lat: location.latitude, lng: location.longitude },
           map,
           label: {
             text: (index + 1).toString(),
             color: "#ffffff",
             fontSize: "14px",
             fontWeight: "bold"
           },
           icon: {
             path: google.maps.SymbolPath.CIRCLE,
             scale: 14,
             fillColor: location.is_source ? "#ef4444" : "#3b82f6",
             fillOpacity: 1,
             strokeWeight: 2,
             strokeColor: "#ffffff",
           },
           title: location.title,
           optimized: false
         });

         // Create info window
         const infoWindow = new google.maps.InfoWindow({
           content: createMarkerContent(location, index),
           maxWidth: 300
         });

         // Add click listener to open info window
         marker.addListener('click', () => {
           // Close any open info windows first
           map.markers?.forEach(m => {
             if (m['infoWindow']) {
               m['infoWindow'].close();
             }
           });
           infoWindow.open(map, marker);
         });

         // Store reference to info window
         marker['infoWindow'] = infoWindow;

         return marker;
       });

       // Fit bounds to include all locations
       const bounds = new google.maps.LatLngBounds();
       currentRoute.forEach(location => {
         bounds.extend({ lat: location.latitude, lng: location.longitude });
       });
       
       // Add current location to bounds if available
       if (currentLocation) {
         bounds.extend(currentLocation);
       }
       
       map.fitBounds(bounds);
       
       // Add padding to the bounds
       const padded = new google.maps.LatLngBounds(
         map.getBounds()?.getSouthWest(),
         map.getBounds()?.getNorthEast()
       );
       map.fitBounds(padded);

       // Update route metrics if available
       if (result.routes[0]) {
         const route = result.routes[0];
         let totalDistance = 0;
         let totalDuration = 0;

         route.legs.forEach(leg => {
           totalDistance += leg.distance?.value || 0;
           totalDuration += leg.duration?.value || 0;
         });

         setMetrics({
           totalDistance: totalDistance / 1000, // Convert to kilometers
           totalDuration: totalDuration / 60, // Convert to minutes
           numberOfStops: currentRoute.length,
           estimatedArrival: new Date(Date.now() + totalDuration * 1000).toLocaleTimeString()
         });
       }

     } catch (error) {
       console.error('Failed to update route:', error);
       toast({
         title: "Error",
         description: "Failed to update route on map.",
         variant: "destructive"
       });
     }
   };

   updateRoute();
 }, [map, directionsService, currentRoute, settings, currentLocation]);

 // Update current location marker
 useEffect(() => {
   if (!map || !currentLocation) return;

   if (map.currentLocationMarker) {
     map.currentLocationMarker.setPosition(currentLocation);
   } else {
     map.currentLocationMarker = new google.maps.Marker({
       position: currentLocation,
       map,
       icon: {
         path: google.maps.SymbolPath.CIRCLE,
         scale: 8,
         fillColor: "#10b981",
         fillOpacity: 1,
         strokeWeight: 2,
         strokeColor: "#ffffff",
       },
       title: "Current Location",
       zIndex: 1000
     });
   }
 }, [map, currentLocation]);

 return (
   <Card className="relative overflow-hidden">
     <div 
       ref={mapRef}
       className="w-full h-[800px] rounded-lg" 
     />
   </Card>
 );
}
