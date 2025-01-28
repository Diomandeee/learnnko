// components/coffee-shops/place-search.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Loader2, MapPin, Phone, Clock, DollarSign, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PlaceSearchProps {
    onPlacesSelected: (placesData: any[]) => void
    onWebsiteFound?: (website: string) => void
    onInstagramFound?: (instagram: string) => void  // Add this
    onAreaFound?: (area: string) => void  // Add this
    onStoreDoorsUpdate?: (count: number) => void  // Add this
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
  const [showDialog, setShowDialog] = useState(false)
  const [service, setService] = useState<google.maps.places.PlacesService | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const mapDiv = document.createElement('div')
    const placesService = new google.maps.places.PlacesService(mapDiv)
    setService(placesService)
  }, [])

  const handleSearch = () => {
    if (!service || !searchTerm) return

    setLoading(true)
    setShowDialog(true)

    const request = {
      query: searchTerm,
      type: ['restaurant', 'cafe', 'food'],
      fields: ['name', 'formatted_address', 'geometry', 'place_id']
    }

    service.textSearch(request, (results, status) => {
      setLoading(false)
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results)
      }
    })
  }

  const extractAreaFromAddress = (placeDetails: google.maps.places.PlaceResult) => {
    if (placeDetails.address_components) {
      // Try to find neighborhood first
      const neighborhood = placeDetails.address_components.find(
        component => component.types.includes('neighborhood')
      );
  
      // If no neighborhood, try sublocality
      const sublocality = placeDetails.address_components.find(
        component => component.types.includes('sublocality')
      );
  
      // If no sublocality, try locality (city)
      const locality = placeDetails.address_components.find(
        component => component.types.includes('locality')
      );
  
      // Return the first available area designation
      return neighborhood?.long_name || sublocality?.long_name || locality?.long_name;
    }
    return null;
  };

// In PlaceSearch component
const handlePlaceToggle = async (place: google.maps.places.PlaceResult) => {
  if (!service || !place.place_id) return;

  const placeId = place.place_id;
  const newSelectedPlaces = new Set(selectedPlaces);

  if (selectedPlaces.has(placeId)) {
    // If removing a place
    newSelectedPlaces.delete(placeId);
    setSelectedPlacesData(prev => prev.filter(p => p.place_id !== placeId));
  } else {
    // If adding a place
    newSelectedPlaces.add(placeId);
    
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'website',
          'rating',
          'user_ratings_total',
          'price_level',
          'opening_hours',
          'geometry',
          'types',
          'photos',
          'address_components'
        ]
      },
      async (placeDetails, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
          // Extract area for this specific location
          const area = extractAreaFromAddress(placeDetails);

          const placeData = {
            place_id: placeId,
            title: placeDetails.name,
            address: placeDetails.formatted_address,
            area: area || '', // Store area with each location
            phone: placeDetails.formatted_phone_number,
            website: placeDetails.website,
            rating: placeDetails.rating,
            reviews: placeDetails.user_ratings_total,
            price_type: placeDetails.price_level ? '$'.repeat(placeDetails.price_level) : null,
            latitude: placeDetails.geometry?.location?.lat(),
            longitude: placeDetails.geometry?.location?.lng(),
            hours: placeDetails.opening_hours?.weekday_text?.join('\n'),
            types: placeDetails.types
          };

          // Only set area for the first location
          if (selectedPlacesData.length === 0 && onAreaFound && area) {
            onAreaFound(area);
          }

          // Handle website for the first location only
          if (selectedPlacesData.length === 0 && placeDetails.website && onWebsiteFound) {
            onWebsiteFound(placeDetails.website);
          }

          setSelectedPlacesData(prev => [...prev, placeData]);
        }
      }
    );
  }

  setSelectedPlaces(newSelectedPlaces);
  
  // Update store doors count
  if (onStoreDoorsUpdate) {
    // Add 1 to include the current selection
    const newCount = newSelectedPlaces.has(placeId) ? 
      newSelectedPlaces.size : 
      newSelectedPlaces.size;
    onStoreDoorsUpdate(newCount);
  }
};
  
  const handleSubmit = () => {
    if (selectedPlacesData.length === 0) {
      toast({
        title: "No locations selected",
        description: "Please select at least one location",
        variant: "destructive"
      })
      return
    }

    onPlacesSelected(selectedPlacesData)
    setShowDialog(false)
    setPlaces([])
    setSearchTerm("")
    setSelectedPlaces(new Set())
    setSelectedPlacesData([])
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for coffee shop chain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Locations</DialogTitle>
            <DialogDescription>
              Select all locations you want to add ({selectedPlaces.size} selected)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {places.map((place, index) => (
              <Card
                key={place.place_id || index}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedPlaces.has(place.place_id!) ? 'border-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedPlaces.has(place.place_id!)}
                      onCheckedChange={() => handlePlaceToggle(place)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{place.name}</h3>
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span>{place.rating}</span>
                            {place.user_ratings_total && (
                              <span className="text-sm text-muted-foreground">
                                ({place.user_ratings_total})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {place.formatted_address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{place.formatted_address}</span>
                        </div>
                      )}

                      {place.price_level && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>{'$'.repeat(place.price_level)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={selectedPlaces.size === 0}>
              Add {selectedPlaces.size} Location{selectedPlaces.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}