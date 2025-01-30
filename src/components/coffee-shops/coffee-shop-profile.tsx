"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MapPin,
  Globe,
  Phone,
  Instagram,
  Calendar,
  Star,
  DollarSign,
  Clock,
  Users,
  Building,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { MapTabContent } from "./map/map-tab-content"
import { QuickEditDialog } from "./map/quick-edit-dialog"


function EditableCell({ value, onUpdate, type = 'text' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      let processedValue = editValue;
      if (type === 'number' || type === 'volume') {
        processedValue = parseFloat(editValue);
      }
      await onUpdate(processedValue);
      setIsEditing(false);
      toast({
        title: "Updated successfully",
        description: "The value has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update value.",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Input
          type={type === 'number' || type === 'volume' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="max-w-[200px]"
        />
        <Button size="sm" onClick={handleSubmit}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
      onClick={() => setIsEditing(true)}
    >
      <span className="flex-1">{value}</span> {/* Display the value here */}
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function CoffeeShopProfile({ shop }) {
  const [nearbyShops, setNearbyShops] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [maxLocations, setMaxLocations] = useState(25)
  const [maxDistance, setMaxDistance] = useState(10)
  const [visitFilter, setVisitFilter] = useState('all')
  const [visitCountFilter, setVisitCountFilter] = useState('all')
  const [isNearbyShopsExpanded, setIsNearbyShopsExpanded] = useState(false)
  const [transportMode, setTransportMode] = useState('DRIVING')
  const { toast } = useToast()

  // Calculate distances and fetch nearby shops
  useEffect(() => {
    const fetchNearbyShops = async () => {
      try {
        const response = await fetch('/api/coffee-shops')
        if (!response.ok) throw new Error('Failed to fetch shops')
        
        const allShops = await response.json()
        
        const shopsWithDistances = allShops
          .filter(s => s.id !== shop.id)
          .map(s => ({
            ...s,
            distance: calculateDistance(
              shop.latitude,
              shop.longitude,
              s.latitude,
              s.longitude
            ),
            visitCount: (s.first_visit ? 1 : 0) + 
                       (s.second_visit ? 1 : 0) + 
                       (s.third_visit ? 1 : 0)
          }))
          .filter(s => s.distance <= maxDistance)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, maxLocations)

        setNearbyShops(shopsWithDistances)
        applyFilters(shopsWithDistances)
      } catch (error) {
        console.error('Failed to fetch nearby shops:', error)
      }
    }

    fetchNearbyShops()
  }, [shop, maxDistance, maxLocations])

  const applyFilters = (shops) => {
    let filtered = [...shops]

    if (visitFilter === 'visited') {
      filtered = filtered.filter(s => s.visited)
    } else if (visitFilter === 'not_visited') {
      filtered = filtered.filter(s => !s.visited)
    }

    if (visitCountFilter !== 'all') {
      const count = parseInt(visitCountFilter)
      filtered = filtered.filter(s => s.visitCount === count)
    }

    setFilteredShops(filtered)
  }

  useEffect(() => {
    applyFilters(nearbyShops)
  }, [visitFilter, visitCountFilter])

  const handleUpdate = async (field, value) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })

      if (!response.ok) throw new Error('Failed to update')

      toast({
        title: "Updated successfully",
        description: "The coffee shop has been updated."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coffee shop.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{shop.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={shop.is_source ? "default" : "secondary"}>
              {shop.is_source ? "Partner" : "Prospect"}
            </Badge>
            {shop.visited && <Badge variant="success">Visited</Badge>}
            {shop.parlor_coffee_leads && <Badge variant="warning">Lead</Badge>}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/coffee-shops">Back to List</Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="nearby">Nearby & Routes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label>Address</Label>
                  <EditableCell
                    value={shop.address}
                    onUpdate={(value) => handleUpdate('address', value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Website</Label>
                  <EditableCell
                    value={shop.website}
                    onUpdate={(value) => handleUpdate('website', value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Phone</Label>
                  <EditableCell
                    value={shop.phone}
                    onUpdate={(value) => handleUpdate('phone', value)}
                    type="phone"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Instagram</Label>
                  <EditableCell
                    value={shop.instagram}
                    onUpdate={(value) => handleUpdate('instagram', value)}
                    type="instagram"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Followers</Label>
                  <EditableCell
                    value={shop.followers}
                    onUpdate={(value) => handleUpdate('followers', value)}
                    type="number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label>Volume (Weekly)</Label>
                  <EditableCell
                    value={shop.volume}
                    onUpdate={(value) => handleUpdate('volume', value)}
                    type="volume"
                  />
                  {shop.volume && (
                    <p className="text-sm text-muted-foreground">
                      Annual Revenue: ${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Store Doors</Label>
                  <EditableCell
                    value={shop.store_doors}
                    onUpdate={(value) => handleUpdate('store_doors', value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Price Type</Label>
                  <EditableCell
                    value={shop.price_type}
                    onUpdate={(value) => handleUpdate('price_type', value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Rating</Label>
                  <EditableCell
                    value={shop.rating}
                    onUpdate={(value) => handleUpdate('rating', value)}
                    type="number"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Reviews</Label>
                  <EditableCell
                    value={shop.reviews}
                    onUpdate={(value) => handleUpdate('reviews', value)}
                    type="number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label>Manager Present</Label>
                  <EditableCell
                    value={shop.manager_present}
                    onUpdate={(value) => handleUpdate('manager_present', value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Contact Name</Label>
                  <EditableCell
                    value={shop.contact_name}
                    onUpdate={(value) => handleUpdate('contact_name', value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Contact Email</Label>
                  <EditableCell
                    value={shop.contact_email}
                    onUpdate={(value) => handleUpdate('contact_email', value)}
                    type="email"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <EditableCell
                value={shop.notes}
                onUpdate={(value) => handleUpdate('notes', value)}
                type="textarea"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shop.first_visit && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>First Visit: {format(new Date(shop.first_visit), 'PPP')}</span>
                  </div>
                )}
                {shop.second_visit && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Second Visit: {format(new Date(shop.second_visit), 'PPP')}</span>
                  </div>
                )}
                {shop.third_visit && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Third Visit: {format(new Date(shop.third_visit), 'PPP')}</span>
                  </div>
                )}

                {shop.visits?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">Detailed Visits</h3>
                    {shop.visits.map((visit) => (
                      <Card key={visit.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Visit #{visit.visitNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(visit.date), 'PPP')}
                              </p>
                            </div>
                            {visit.managerPresent && (
                              <Badge>Manager Present</Badge>
                            )}
                          </div>
                          {visit.notes && (
                            <p className="mt-2 text-sm">{visit.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <EditableCell
                    value={shop.latitude}
                    onUpdate={(value) => handleUpdate('latitude', value)}
                    type="number"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <EditableCell
                    value={shop.longitude}
                    onUpdate={(value) => handleUpdate('longitude', value)}
                    type="number"
                  />
                </div>
              </div>
              
              <div>
                <Label>Area</Label>
                <EditableCell
                  value={shop.area}
                  onUpdate={(value) => handleUpdate('area', value)}
                />
              </div>

              <div className="space-y-1">
                <Label>Types</Label>
                <div className="flex flex-wrap gap-2">
                  {shop.types && shop.types.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {shop.service_options && (
                <div>
                  <Label>Service Options</Label>
                  <pre className="bg-muted p-2 rounded-md text-sm">
                    {JSON.stringify(shop.service_options, null, 2)}
                  </pre>
                </div>
              )}

              {shop.operating_hours && (
                <div>
                  <Label>Operating Hours</Label>
                  <div className="space-y-2">
                    {Object.entries(shop.operating_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center py-2 border-b">
                        <span className="capitalize">{day}</span>
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nearby & Routes Tab */}
        <TabsContent value="nearby" className="space-y-4">
          {/* Location Settings and Route Options */}
          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location Limits */}
              <div className="space-y-2">
                <Label>Maximum Number of Locations</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[maxLocations]}
                    onValueChange={(value) => setMaxLocations(value[0])}
                    min={5}
                    max={50}
                    step={5}
                    className="flex-1"
                  />
                  <span className="min-w-[4ch] text-right">{maxLocations}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Maximum Distance (km)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[maxDistance]}
                    onValueChange={(value) => setMaxDistance(value[0])}
                    min={1}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="min-w-[4ch] text-right">{maxDistance}km</span>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visit Status</Label>
                  <Select value={visitFilter} onValueChange={setVisitFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="visited">Visited Only</SelectItem>
                      <SelectItem value="not_visited">Not Visited Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visit Count</Label>
                  <Select value={visitCountFilter} onValueChange={setVisitCountFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1">First Visit Only</SelectItem>
                      <SelectItem value="2">Second Visit Only</SelectItem>
                      <SelectItem value="3">Third Visit Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collapsible Nearby Shops List */}
          <Collapsible
            open={isNearbyShopsExpanded}
            onOpenChange={setIsNearbyShopsExpanded}
          >
            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nearby Coffee Shops</CardTitle>
                    <CardDescription>
                      Showing {filteredShops.length} locations within {maxDistance}km
                    </CardDescription>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isNearbyShopsExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-4">
                  {filteredShops.map((nearbyShop) => (
                    <div
                      key={nearbyShop.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{nearbyShop.title}</h4>
                          <QuickEditDialog 
                            shop={nearbyShop} 
                            onUpdate={(data) => handleUpdate(nearbyShop.id, data)} 
                          />
                          {nearbyShop.visited && (
                            <Badge variant="success" className="text-xs">
                              Visited {nearbyShop.visitCount}x
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(nearbyShop.distance).toFixed(2)} km away
                        </p>
                        {nearbyShop.area && (
                          <p className="text-sm text-muted-foreground">{nearbyShop.area}</p>
                        )}
                        {nearbyShop.volume && (
                          <p className="text-sm">
                            Volume: {nearbyShop.volume} | ARR: ${((parseFloat(nearbyShop.volume) * 52) * 18).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/coffee-shops/${nearbyShop.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {!nearbyShop.visited && (
                          <Button variant="secondary" size="sm">
                            Schedule Visit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                    {filteredShops.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No coffee shops found matching the current filters
                      </p>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
                        {/* Map */}
          <MapTabContent
            shop={shop}
            nearbyShops={filteredShops}
            maxDistance={maxDistance}
            transportMode={transportMode}
          />

            </Card>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default CoffeeShopProfile


