"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Loader2, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PlaceSearchProps {
  onPlacesSelected: (placesData: any[]) => void;
  onWebsiteFound?: (website: string) => void;
  onInstagramFound?: (instagram: string) => void;
  onAreaFound?: (area: string) => void;
  onStoreDoorsUpdate?: (count: number) => void;
}

export function PlaceSearch({
  onPlacesSelected,
  onWebsiteFound,
  onInstagramFound,
  onAreaFound,
  onStoreDoorsUpdate
}: PlaceSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([])
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set())
  const [selectedPlacesData, setSelectedPlacesData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()
  
  // Use refs for service instances
  const mapRef = useRef<google.maps.Map | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)

  // Initialize services
  useEffect(() => {
    // Check if running in browser and Google Maps is loaded
    if (typeof window === 'undefined' || !window.google || !window.google.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    try {
      // Create a dummy div that won't be visible
      const mapDiv = document.createElement('div');
      mapDiv.style.height = '0';
      mapDiv.style.width = '0';
      document.body.appendChild(mapDiv);

      // Initialize the map
      const map = new window.google.maps.Map(mapDiv, {
        center: { lat: 40.7128, lng: -74.0060 }, // New York coordinates
        zoom: 13
      });

      // Initialize the PlacesService
      const service = new window.google.maps.places.PlacesService(map);

      // Store references
      mapRef.current = map;
      placesServiceRef.current = service;

      // Cleanup function
      return () => {
        if (mapDiv.parentNode) {
          mapDiv.parentNode.removeChild(mapDiv);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    if (!placesServiceRef.current) {
      toast({
        title: "Error",
        description: "Places service not initialized",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const request: google.maps.places.TextSearchRequest = {
        query: searchTerm,
        type: 'cafe'
      };

      placesServiceRef.current.textSearch(request, (results, status) => {
        setLoading(false);

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPlaces(results);
        } else {
          toast({
            title: "Error",
            description: `Search failed: ${status}`,
            variant: "destructive"
          });
          setPlaces([]);
        }
      });
    } catch (error) {
      setLoading(false);
      console.error('Place search error:', error);
      toast({
        title: "Error",
        description: "Failed to search places",
        variant: "destructive"
      });
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.place_id || !placesServiceRef.current) return;

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: place.place_id,
      fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 
               'rating', 'user_ratings_total', 'price_level', 'opening_hours', 
               'geometry', 'address_components']
    };

    placesServiceRef.current.getDetails(request, (details, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && details) {
        const newSelectedPlaces = new Set(selectedPlaces);
        newSelectedPlaces.add(place.place_id!);
        setSelectedPlaces(newSelectedPlaces);

        // Extract area
        const area = details.address_components?.find(
          component => component.types.includes('neighborhood') ||
                      component.types.includes('sublocality_level_1') ||
                      component.types.includes('sublocality')
        )?.long_name || '';

        if (area && onAreaFound) {
          onAreaFound(area);
        }

        if (details.website && onWebsiteFound) {
          onWebsiteFound(details.website);
        }

        const placeData = {
          title: details.name,
          address: details.formatted_address,
          area: area,
          phone: details.formatted_phone_number,
          website: details.website,
          rating: details.rating,
          reviews: details.user_ratings_total,
          latitude: details.geometry?.location?.lat(),
          longitude: details.geometry?.location?.lng(),
          price_type: details.price_level ? '$'.repeat(details.price_level) : null,
          hours: details.opening_hours?.weekday_text?.join('\n')
        };

        setSelectedPlacesData(prev => [...prev, placeData]);
        
        if (onStoreDoorsUpdate) {
          onStoreDoorsUpdate(selectedPlacesData.length + 1);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to get place details",
          variant: "destructive"
        });
      }
    });
  };

  const handleSubmit = () => {
    if (selectedPlacesData.length === 0) {
      toast({
        title: "No places selected",
        description: "Please select at least one location",
        variant: "destructive"
      });
      return;
    }

    onPlacesSelected(selectedPlacesData);
    setShowResults(false);
    setSearchTerm("");
    setSelectedPlaces(new Set());
    setSelectedPlacesData([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search coffee shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <Button onClick={handleSearch} disabled={loading || !searchTerm}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {showResults && places.length > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              {places.map((place) => (
                <div
                  key={place.place_id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handlePlaceSelect(place)}
                >
                  <div className="space-y-2">
                    <h3 className="font-medium">{place.name}</h3>
                    <p className="text-sm text-gray-500">{place.formatted_address}</p>
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{place.rating}</span>
                      </div>
                    )}
                  </div>
                  <Checkbox
                    checked={selectedPlaces.has(place.place_id!)}
                    onCheckedChange={() => handlePlaceSelect(place)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleSubmit} disabled={selectedPlacesData.length === 0}>
                Add Selected Places
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}