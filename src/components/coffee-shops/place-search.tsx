"use client"

import { useState } from "react"
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

  const extractAreaFromAddress = (addressComponents: google.maps.GeocoderAddressComponent[] | undefined) => {
    if (!addressComponents) return null;
    
    // Try to find neighborhood first
    const neighborhood = addressComponents.find(
      component => component.types.includes('neighborhood')
    );
    
    // If no neighborhood, try sublocality
    const sublocality = addressComponents.find(
      component => component.types.includes('sublocality')
    );
    
    // If no sublocality, try locality (city)
    const locality = addressComponents.find(
      component => component.types.includes('locality')
    );
    
    return neighborhood?.long_name || sublocality?.long_name || locality?.long_name;
  };

// Update the handleSearch function in your PlaceSearch component

const handleSearch = async () => {
  if (!window.google || !searchTerm) return;

  setLoading(true);
  setShowResults(true);

  try {
    // Create proper map instance
    const mapDiv = document.createElement('div');
    const map = new google.maps.Map(mapDiv, {
      center: { lat: 0, lng: 0 },
      zoom: 1
    });
    
    const service = new google.maps.places.PlacesService(map);

    // Create a promise wrapper for the textSearch service
    const searchPlaces = () => {
      return new Promise((resolve, reject) => {
        service.textSearch({
          query: searchTerm,
          type: ['cafe', 'restaurant']
        }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        });
      });
    };

    const results = await searchPlaces();
    setPlaces(results);

  } catch (error) {
    console.error('Place search error:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to search places",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};
  const handlePlaceSelect = async (place: google.maps.places.PlaceResult) => {
    if (!place.place_id) return;

    const service = new google.maps.places.PlacesService(document.createElement('div'));

    service.getDetails({
      placeId: place.place_id,
      fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'user_ratings_total', 'price_level', 'opening_hours', 'geometry', 'address_components']
    }, (placeDetails, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
        const newSelectedPlaces = new Set(selectedPlaces);
        newSelectedPlaces.add(place.place_id!);
        setSelectedPlaces(newSelectedPlaces);

        const area = extractAreaFromAddress(placeDetails.address_components);
        if (area && onAreaFound) {
          onAreaFound(area);
        }

        if (placeDetails.website && onWebsiteFound) {
          onWebsiteFound(placeDetails.website);
        }

        const placeData = {
          title: placeDetails.name,
          address: placeDetails.formatted_address,
          area: area || '',
          phone: placeDetails.formatted_phone_number,
          website: placeDetails.website,
          rating: placeDetails.rating,
          reviews: placeDetails.user_ratings_total,
          latitude: placeDetails.geometry?.location?.lat(),
          longitude: placeDetails.geometry?.location?.lng(),
          price_type: placeDetails.price_level ? '$'.repeat(placeDetails.price_level) : null,
          hours: placeDetails.opening_hours?.weekday_text?.join('\n')
        };

        setSelectedPlacesData([...selectedPlacesData, placeData]);
        
        if (onStoreDoorsUpdate) {
          onStoreDoorsUpdate(selectedPlacesData.length + 1);
        }
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
