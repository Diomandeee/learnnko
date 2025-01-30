// src/components/routes/map/route-map.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouteStore } from "@/store/route-store";

interface MapWrapperType extends google.maps.Map {
  markers?: google.maps.Marker[];
  currentLocationMarker?: google.maps.Marker;
}

export function RouteMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapWrapperType | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const {
    selectedLocations,
    currentRoute,
    settings,
    isNavigating,
    currentStep,
    setMetrics,
  } = useRouteStore();
  const { toast } = useToast();

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        // Check if Google Maps script is already loaded
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);

          // Wait for script to load
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { 
            lat: selectedLocations[0]?.latitude || 40.7128, 
            lng: selectedLocations[0]?.longitude || -74.0060 
          },
          zoom: 12,
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
          suppressMarkers: true,  // We'll add custom markers
        });

        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);
        
        // Add traffic layer
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(mapInstance);

      } catch (error) {
        console.error('Failed to initialize map:', error);
        toast({
          title: "Error",
          description: "Failed to load map. Please try refreshing the page.",
          variant: "destructive"
        });
      }
    };

    initMap();

    return () => {
      if (map) {
        map.markers?.forEach(marker => marker.setMap(null));
        if (directionsRenderer) directionsRenderer.setMap(null);
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    map.markers?.forEach(marker => marker.setMap(null));
    map.markers = [];

    const bounds = new google.maps.LatLngBounds();

    // Add markers for selected locations
    selectedLocations.forEach((location, index) => {
      const position = { lat: location.latitude, lng: location.longitude };
      bounds.extend(position);

      const marker = new google.maps.Marker({
        position,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: location.visited ? "#22c55e" : "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: location.title,
        label: {
          text: (index + 1).toString(),
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold"
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-4">
            <h3 class="font-bold">${location.title}</h3>
            <p class="text-sm text-muted-foreground">${location.address}</p>
            ${location.volume ? `
              <p class="text-sm mt-2">Volume: ${location.volume}</p>
              <p class="text-sm">ARR: $${((parseFloat(location.volume) * 52) * 18).toLocaleString()}</p>
            ` : ''}
            ${location.visited ? 
              '<span class="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Visited</span>' : 
              '<span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Not Visited</span>'
            }
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      map.markers.push(marker);
    });

    if (selectedLocations.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, selectedLocations]);

  // Update route display when route changes
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderer || currentRoute.length < 2) return;

    const calculateRoute = async () => {
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

        directionsRenderer.setDirections(result);

        // Calculate metrics
        let totalDistance = 0;
        let totalDuration = 0;
        result.routes[0].legs.forEach(leg => {
          totalDistance += leg.distance?.value || 0;
          totalDuration += leg.duration?.value || 0;
        });

        setMetrics({
          totalDistance: totalDistance / 1000, // Convert to kilometers
          totalDuration: totalDuration / 60, // Convert to minutes
          numberOfStops: currentRoute.length,
          estimatedArrival: new Date(Date.now() + totalDuration * 1000).toLocaleTimeString()
        });

      } catch (error) {
        console.error('Failed to calculate route:', error);
        toast({
          title: "Error",
          description: "Failed to calculate route. Please try again.",
          variant: "destructive"
        });
      }
    };

    calculateRoute();
  }, [map, directionsService, directionsRenderer, currentRoute, settings]);

  // Handle navigation mode
  useEffect(() => {
    if (!map || !isNavigating) return;

    const location = currentRoute[currentStep];
    if (!location) return;

    // Update map view for current location
    map.panTo({ lat: location.latitude, lng: location.longitude });
    map.setZoom(16);

    // Update current location marker
    if (map.currentLocationMarker) {
      map.currentLocationMarker.setMap(null);
    }

    map.currentLocationMarker = new google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
        rotation: 0
      }
    });

    // Start location tracking if available
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentPos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          // Update current location marker
          if (map.currentLocationMarker) {
            map.currentLocationMarker.setPosition(currentPos);

            // Calculate bearing to destination
            const heading = google.maps.geometry.spherical.computeHeading(
              currentPos,
              new google.maps.LatLng(location.latitude, location.longitude)
            );

            // Update marker rotation
            map.currentLocationMarker.setIcon({
              ...map.currentLocationMarker.getIcon(),
              rotation: heading
            });

            // Check if near destination (within 50 meters)
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              currentPos,
              new google.maps.LatLng(location.latitude, location.longitude)
            );

            if (distance < 50) {
              toast({
                title: "Arrived at destination",
                description: `You have arrived at ${location.title}`,
              });
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Error",
            description: "Unable to track current location.",
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [map, isNavigating, currentStep, currentRoute]);

  return (
    <Card className="relative overflow-hidden">
      <div 
        ref={mapRef}
        className="w-full h-[800px] rounded-lg" 
      />
    </Card>
  );
}