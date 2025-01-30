### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/coffee-shops/page.tsx
import { CoffeeShopsTable } from "@/components/coffee-shops/coffee-shops-table"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"
import { CoffeeShopStats } from "@/components/coffee-shops/coffee-shop-stats"
import { PageContainer } from "@/components/layout/page-container"

export const metadata = {
  title: "Coffee Shops | Milk Man CRM",
  description: "Manage your coffee shops",
}

export default function CoffeeShopsPage() {
  return (
    <PageContainer>
      <div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
        <CoffeeShopHeader />
        <CoffeeShopStats />
        <CoffeeShopsTable />
      </div>
    </PageContainer>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/coffee-shops/new/page.tsx
import { Metadata } from "next"
import { NewCoffeeShopForm } from "@/components/coffee-shops/new-coffee-shop-form"

export const metadata: Metadata = {
  title: "Add Coffee Shop | Milk Man CRM",
  description: "Add a new coffee shop to your network",
}

export default function NewCoffeeShopPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Coffee Shop</h1>
      <NewCoffeeShopForm />
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/coffee-shops/[id]/page.tsx
import { CoffeeShopProfile } from "@/components/coffee-shops/coffee-shop-profile"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export default async function CoffeeShopPage({ params }: Props) {
  const coffeeShop = await prisma.coffeeShop.findUnique({
    where: {
      id: params.id
    },
    include: {
      visits: {
        orderBy: {
          date: 'desc'
        }
      }
    }
  })

  if (!coffeeShop) {
    notFound()
  }

  return <CoffeeShopProfile shop={coffeeShop} />
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/coffee-shop-header.tsx
"use client"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function CoffeeShopHeader() {
   const router = useRouter()
   
   return (
     <div className="flex items-center justify-between">
       <div className="flex items-center gap-4">
         <div>
           <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Coffee Shops</h1>
           <p className="text-sm text-muted-foreground">
             Manage and track coffee shops in your network
           </p>
         </div>
       </div>
       <Button
          onClick={() => router.push("/dashboard/coffee-shops/new")}
          className="flex md:flex"  // Changed from 'hidden md:flex' to 'flex md:flex'
       >
         <PlusCircle className="mr-2 h-4 w-4" />
         Add Shop
       </Button>
     </div>
   )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/coffee-shop-profile.tsx
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { DirectionsPanel } from "./map/directions-panel"
import { QuickEditDialog } from "./map/quick-edit-dialog"


function EditableCell({ value, onUpdate, type = 'text' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value?.toString() || '')
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      let processedValue = editValue
      if (type === 'number' || type === 'volume') {
        processedValue = parseFloat(editValue)
      }
      await onUpdate(processedValue)
      setIsEditing(false)
      toast({
        title: "Updated successfully",
        description: "The value has been updated."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update value.",
        variant: "destructive"
      })
    }
  }

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
      )
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
    )
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
      onClick={() => setIsEditing(true)}
    >
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  )
}

export function CoffeeShopProfile({ shop }) {
  const [nearbyShops, setNearbyShops] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [maxLocations, setMaxLocations] = useState(25)
  const [maxDistance, setMaxDistance] = useState(10)
  const [visitFilter, setVisitFilter] = useState('all')
  const [visitCountFilter, setVisitCountFilter] = useState('all')
  const [isNearbyShopsExpanded, setIsNearbyShopsExpanded] = useState(true)
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

              {/* Transport Mode */}
              <div className="space-y-2">
                <Label>Transport Mode</Label>
                <RadioGroup
                  defaultValue={transportMode}
                  onValueChange={setTransportMode}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DRIVING" id="driving" />
                    <Label htmlFor="driving">Driving</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WALKING" id="walking" />
                    <Label htmlFor="walking">Walking</Label>
                  </div>
                </RadioGroup>
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

export default CoffeeShopProfile________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/coffee-shop-stats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { Users, UserCheck, Briefcase, DollarSign } from "lucide-react"

export function CoffeeShopStats() {
  const { shops } = useCoffeeShops()

  const stats = {
    total: shops?.length || 0,
    visited: shops?.filter(shop => shop.visited).length || 0,
    source: shops?.filter(shop => shop.is_source).length || 0,
    leads: shops?.filter(shop => shop.parlor_coffee_leads).length || 0,
    totalVolume: shops?.reduce((sum, shop) => {
      const volume = shop.volume ? parseFloat(shop.volume) : 0
      return sum + volume
    }, 0) || 0,
  }

  const estimatedAnnualRevenue = stats.totalVolume * 52 * 18

  const statCards = [
    {
      title: "Total Shops",
      value: stats.total,
      icon: Users,
      description: "Total locations tracked",
    },
    {
      title: "Visited",
      value: stats.visited,
      icon: UserCheck,
      description: `${((stats.visited / stats.total) * 100).toFixed(1)}% of total`,
    },
    {
      title: "Partners",
      value: stats.source,
      icon: Briefcase,
      description: `${stats.source} partner locations`,
    },
    {
      title: "Weekly Volume",
      value: stats.totalVolume.toFixed(1),
      icon: DollarSign,
      description: `$${estimatedAnnualRevenue.toLocaleString()} ARR`,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/coffee-shops-table.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  MoreHorizontal, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDown, 
  ArrowUp, 
  Filter, 
  XCircle, 
  Calendar as CalendarIcon,
  Pencil,
  Check,
  X,
  Instagram,
  User,
  Mail,
  Phone,
  Star,
  Shield,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CoffeeShop } from "@prisma/client"
import { format } from "date-fns"
import { FilterValueInput } from "./filter-value-input"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { Textarea } from "@/components/ui/textarea";
import { MobileCardView } from "./mobile-card-view";

const ITEMS_PER_PAGE = 50

interface EditableCellProps {
  value: string | null
  onUpdate: (value: string | null) => Promise<void>
  type?: 'text' | 'number' | 'instagram' | 'email' | 'manager' |'owners'|'notes' | 'volume' | 'phone'| 'priority'
  className?: string
}

function StarRating({ 
  value, 
  onUpdate,
  className 
}: { 
  value: number, 
  onUpdate: (value: number) => void,
  className?: string 
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            star <= value 
              ? "fill-yellow-500 text-yellow-500" 
              : "text-muted-foreground hover:text-yellow-500"
          )}
          onClick={() => onUpdate(star)}
        />
      ))}
    </div>
  )
}
function EditableCell({ value, onUpdate, type = 'text', className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    
    try {
      let processedValue = editValue
      let isValid = true

      switch (type) {
        case 'instagram':
          processedValue = editValue
            .trim()
            .replace(/^@/, '')
            .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
            .replace(/\/$/, '')
          break
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (editValue && !emailRegex.test(editValue)) {
            isValid = false
            toast({
              title: "Invalid email",
              description: "Please enter a valid email address",
              variant: "destructive"
            })
          }
          break
          
        case 'number':
          if (editValue && isNaN(parseFloat(editValue))) {
            isValid = false
            toast({
              title: "Invalid value",
              description: "Please enter a valid number",
              variant: "destructive"
            })
          }
          break

        case 'volume':
          const numValue = parseFloat(editValue)
          if (isNaN(numValue) || numValue < 0) {
            isValid = false
            toast({
              title: "Invalid value",
              description: "Please enter a valid number",
              variant: "destructive"
            })
          } else {
            processedValue = numValue.toString()
          }
          break

        case 'phone':
          const phoneRegex = /^[\d\s\-+()]*$/
          if (editValue && !phoneRegex.test(editValue)) {
            isValid = false
            toast({
              title: "Invalid phone number",
              description: "Please enter a valid phone number",
              variant: "destructive"
            })
          }
          break
      }

      if (isValid) {
        await onUpdate(processedValue || null)
        setIsEditing(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update value",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type={type === 'number' || type === 'volume' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={cn("h-8 w-[200px]", className)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setIsEditing(false)
              setEditValue(value || '')
            }
          }}
          disabled={isUpdating}
          autoFocus
        />
        <Button 
          size="sm"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="animate-spin">...</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setEditValue(value || '')
          }}
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (type === 'instagram' && value) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          <Instagram className="h-4 w-4 mr-1" />
          @{value}
        </a>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }
  
  if (type === 'email' && value) {
    return (
      <div className="flex items-center gap-2">
                <a

          href={`mailto:${value}`}
          className="text-blue-600 hover:underline flex items-center"
        >
          <Mail className="h-4 w-4 mr-1" />
          {value}
        </a>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (type === 'manager' && value) {
    return (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 mr-1" />
        <span>{value}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (type === 'phone' && value) {
    return (
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 mr-1" />
        <span>{value}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (type === 'volume' && value) {
    const numValue = parseFloat(value)
    const arr = (numValue * 52) * 18
    return (
      <div 
        className="space-y-1 cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex items-center gap-2">
          <span>{numValue.toLocaleString()}</span>
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
        </div>

      </div>
    )
  }
  if (type === 'owners' && value) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          {value.split(',').map((owner, index) => (
            <div key={index} className="text-sm">
              {owner.trim()}
            </div>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
   }
   if (type === 'notes' && value) {
    return (
      <div className="flex items-center gap-2">
        <div className="max-w-[200px] truncate text-sm" title={value}>
          {value}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
   }
   
   {/* For notes, you might want to use a Textarea instead of Input when editing: */}
   
   if (isEditing && type === 'notes') {
    return (
      <div className="flex items-center gap-2">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[100px] w-[300px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSave()
            }
            if (e.key === 'Escape') {
              setIsEditing(false)
              setEditValue(value || '')
            }
          }}
          disabled={isUpdating}
          autoFocus
        />
        <div className="flex flex-col gap-2">
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setIsEditing(false)
              setEditValue(value || '')
            }}
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
   }
   if (type === 'priority') {
    return (
      <div className="flex items-center gap-2 group cursor-pointer">
        <div 
          className={cn(
            "flex items-center gap-2",
            className
          )}
          onClick={() => setIsEditing(true)}
        >
          <Star className={cn(
            "h-4 w-4",
            value && parseInt(value) > 0 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
          )} />
          <span>{value || "0"}</span>
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    )
  }
  
  if (isEditing && type === 'priority') {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          max="10"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 w-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setIsEditing(false)
              setEditValue(value || '')
            }
          }}
          disabled={isUpdating}
          autoFocus
        />
        <Button 
          size="sm"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="animate-spin">...</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setEditValue(value || '')
          }}
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }
  return (
    <div 
      className={cn(
        "flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-muted/50",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <span>{value || "-"}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
    </div>
  )
}

interface DateCellProps {
  date: Date | null
  onUpdate: (date: Date | null) => Promise<void>
  onRemove: () => Promise<void>
}

function DateCell({ date, onUpdate, onRemove }: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleDateSelect = async (newDate: Date | null) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await onUpdate(newDate)
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update date",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await onRemove()
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove date",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-[140px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={isUpdating}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'MM-dd-yyyy') : 'Not set'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 flex flex-col gap-2">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={handleDateSelect}
            initialFocus
          />
          {date && (
            <div className="border-t pt-2">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleRemove}
                disabled={isUpdating}
              >
                Remove Date
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Filter types and configurations
type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'reviews' | 'followers' | 'volume' | 'priority'
type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterDataType
  operators: FilterOperator[]
}

interface ActiveFilter {
  id: string
  field: keyof CoffeeShop
  operator: FilterOperator
  value: any
  type: FilterDataType
}

const FILTER_CONFIGS: FilterConfig[] = [
  {
    field: 'title',
    label: 'Name',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith']
  },
  {
    field: 'area',
    label: 'Area',
    type: 'text',
    operators: ['contains', 'equals']
  },
  {
    field: 'first_visit',
    label: 'First Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'second_visit',
    label: 'Second Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'third_visit',
    label: 'Third Visit', 
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'manager_present',
    label: 'Manager Present',
    type: 'text',
    operators: ['contains', 'equals']
  },
  {
    field: 'contact_name',
    label: 'Contact Name',
    type: 'text', 
    operators: ['contains', 'equals']
  },
  {
    field: 'contact_email',
    label: 'Contact Email',
    type: 'text',
    operators: ['contains', 'equals']
  },
  {
    field: 'rating',
    label: 'Rating',
    type: 'rating',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'reviews',
    label: 'Reviews',
    type: 'reviews',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'followers',
    label: 'Followers',
    type: 'followers',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'volume',
    label: 'Volume',
    type: 'volume',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'visited',
    label: 'Visited Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'parlor_coffee_leads',
    label: 'Lead Status',
    type: 'boolean',
    operators: ['equals']
  }
 ]
 
 const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  contains: 'Contains', 
  greaterThan: 'Greater than',
  lessThan: 'Less than',
  between: 'Between',
  startsWith: 'Starts with'
 }
 
 export function CoffeeShopsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof CoffeeShop | null;
    direction: 'asc' | 'desc';
    statusPriority: 'visited' | 'notVisited' | null;
  }>({
    key: null,
    direction: 'asc',
    statusPriority: 'visited',
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const { shops, loading, error, mutate } = useCoffeeShops()
  const [isRecalculating, setIsRecalculating] = useState(false)

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/coffee-shops/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete shop')

      toast({
        title: "Success",
        description: "Coffee shop deleted successfully"
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coffee shop",
        variant: "destructive"
      })
    }
  }
  const handleVisitToggle = async (shop) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visited: !shop.visited })
      })

      if (!response.ok) throw new Error('Failed to update visit status')

      toast({
        title: "Success",
        description: `${shop.title} marked as ${!shop.visited ? 'visited' : 'not visited'}`
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visit status",
        variant: "destructive"
      })
    }
  }
  const handleRecalculatePriorities = async () => {
    setIsRecalculating(true)
    try {
      const response = await fetch('/api/coffee-shops/priority', { 
        method: 'POST' 
      })
      
      if (response.ok) {
        // Optionally refresh the table or show a toast
        toast({
          title: "Priorities Recalculated",
          description: "Shop priorities have been updated"
        })
        // Trigger a reload of the shops data
        mutate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to recalculate priorities",
        variant: "destructive"
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleAddFilter = (filter: Omit<ActiveFilter, 'id'>) => {
    setActiveFilters(prev => [...prev, { ...filter, id: crypto.randomUUID() }])
  }
 
  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId))
  }
 
  const handleClearFilters = () => {
    setActiveFilters([])
  }
 
  const handleCellUpdate = async (
    shop: CoffeeShop,
    field: keyof CoffeeShop,
    value: any
  ) => {
    try {
      const updateData: Partial<CoffeeShop> = {
        [field]: value
      }
 
      console.log('Updating shop:', { field, value, updateData })
 
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      })
 
      if (!response.ok) {
        throw new Error(`Failed to update ${field}`)
      }
 
      toast({
        title: "Updated successfully",
        description: `${shop.title} has been updated.`
      })
 
      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
        variant: "destructive"
      })
      console.error('Update error:', error)
    }
  }
 
  const handleDateUpdate = async (
    shop: CoffeeShop, 
    field: 'first_visit' | 'second_visit' | 'third_visit', 
    date: Date | null
  ) => {
    try {
      console.log('Updating date:', { field, date, shopId: shop.id })
      
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [field]: date?.toISOString(),
          visited: !!date || !!shop.first_visit || !!shop.second_visit || !!shop.third_visit
        })
      })
 
      if (!response.ok) throw new Error(`Failed to update ${field}`)
 
      toast({
        title: "Visit date updated",
        description: `${shop.title} has been updated successfully.`
      })
 
      mutate()
    } catch (error) {
      console.error('Date update error:', error)
      toast({
        title: "Error",
        description: "Failed to update visit date. Please try again.",
        variant: "destructive"
      })
    }
  }
 
  const handleDateRemove = async (
    shop: CoffeeShop,
    field: 'first_visit' | 'second_visit' | 'third_visit'
  ) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [field]: null,
          visited: field !== 'first_visit' || !!shop.second_visit || !!shop.third_visit
        })
      })
 
      if (!response.ok) throw new Error(`Failed to remove ${field}`)
 
      toast({
        title: "Visit date removed",
        description: `${shop.title} has been updated successfully.`
      })
 
      mutate()
    } catch (error) {
      console.error('Date removal error:', error)
      toast({
        title: "Error",
        description: "Failed to remove visit date. Please try again.",
        variant: "destructive"
      })
    }
  }
 
  const filteredShops = useMemo(() => {
    if (!shops) return []
 
    return shops.filter(shop => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.area?.toLowerCase().includes(searchTerm.toLowerCase())
 
      // Active filters
      const matchesFilters = activeFilters.every(filter => {
        const value = shop[filter.field]
 
        switch (filter.operator) {
          case 'equals':
            if (filter.type === 'boolean') {
              return value === (filter.value === 'true')
            }
            return value === filter.value
          
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
          
          case 'greaterThan':
            if (filter.type === 'date') {
              return new Date(value) > new Date(filter.value)
            }
            return Number(value) > Number(filter.value)
          
          case 'lessThan':
            if (filter.type === 'date') {
              return new Date(value) < new Date(filter.value)
            }
            return Number(value) < Number(filter.value)
          
          case 'between':
            if (filter.type === 'date') {
              const date = new Date(value)
              return date >= new Date(filter.value.min) && date <= new Date(filter.value.max)
            }
            return Number(value) >= Number(filter.value.min) && Number(value) <= Number(filter.value.max)
          
          default:
            return true
        }
      })
 
      return matchesSearch && matchesFilters
    })
  }, [shops, searchTerm, activeFilters])
 
const sortedShops = useMemo(() => {
  let sorted = [...filteredShops];

  // Sort by visited status first
  if (sortConfig.statusPriority === 'visited') {
    sorted = sorted.sort((a, b) => Number(b.visited) - Number(a.visited));
  } else if (sortConfig.statusPriority === 'notVisited') {
    sorted = sorted.sort((a, b) => Number(a.visited) - Number(b.visited));
  }

  // Then sort by the selected column
  if (sortConfig.key) {
    sorted = sorted.sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Special handling for dates
      if (sortConfig.key.includes('visit')) {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      // Regular comparison
      const comparison =
        typeof aValue === 'string'
          ? aValue.localeCompare(String(bValue))
          : Number(aValue) - Number(bValue);

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }

  return sorted;
}, [filteredShops, sortConfig]);
 
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
 
  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)
 
  const handleSort = (key: keyof CoffeeShop) => {
    if (key === 'visited') {
      setSortConfig((current) => ({
        ...current,
        statusPriority: current.statusPriority === 'visited' ? 'notVisited' : 'visited',
      }));
    } else {
      setSortConfig((current) => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        statusPriority: null,
      }));
    }
  };
 
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading coffee shops</div>
 
  return (
    <div className="space-y-4">
      {/* Mobile header controls */}
      <div className="flex flex-col gap-4 md">
        <Input
          placeholder="Search coffee shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
              {FILTER_CONFIGS.map((config) => (
                <DropdownMenuSub key={config.field}>
                  <DropdownMenuSubTrigger>
                    {config.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {config.operators.map((operator) => (
                      <DropdownMenuSub key={operator}>
                        <DropdownMenuSubTrigger>
                          {OPERATOR_LABELS[operator]}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="p-2">
                          <div className="space-y-2">
                            <FilterValueInput
                              type={config.type}
                              value={null}
                              onChange={(value) => {
                                handleAddFilter({
                                  field: config.field,
                                  operator,
                                  value,
                                  type: config.type
                                })
                              }}
                              operator={operator}
                            />
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
              {activeFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleClearFilters}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
 
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleRecalculatePriorities}
            disabled={isRecalculating}
          >
            {isRecalculating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Recalculate</span>
          </Button>
        </div>
      </div>
 

    {/* Active filters */}
    {activeFilters.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <span>
              {FILTER_CONFIGS.find(c => c.field === filter.field)?.label}
              {' '}
              {OPERATOR_LABELS[filter.operator]}
              {' '}
              {filter.operator === 'between'
                ? `${filter.value.min} - ${filter.value.max}`
                : String(filter.value)
              }
            </span>
            <XCircle
              className="h-4 w-4 cursor-pointer"
              onClick={() => handleRemoveFilter(filter.id)}
            />
          </Badge>
        ))}
      </div>
    )}

    {/* Mobile Card View */}
    <div className="block md:hidden">
      <MobileCardView
        shops={paginatedShops}
        onVisitToggle={handleVisitToggle}
        onDelete={handleDelete}
      />
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedShops.length === paginatedShops.length}
                onCheckedChange={(checked) => {
                  setSelectedShops(
                    checked
                      ? paginatedShops.map(shop => shop.id)
                      : []
                  )
                }}
              />
            </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Name
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('title')}
                  >
                    {sortConfig.key === 'title' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Area
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('area')}
                  >
                    {sortConfig.key === 'area' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Priority
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('priority')}
                  >
                    {sortConfig.key === 'priority' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>
              <TableHead>Partner Status</TableHead>

              <TableHead>
                <div className="flex items-center gap-2">
                  Manager Present
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('manager_present')}
                  >
                    {sortConfig.key === 'manager_present' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>
              
              <TableHead>
                <div className="flex items-center gap-2">
                  Contact Name
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('contact_name')}
                  >
{sortConfig.key === 'contact_name' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Contact Email
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('contact_email')}
                 >
                   {sortConfig.key === 'contact_email' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>
              <div className="flex items-center gap-2">
                Owners
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('owners')}
                >
                  {sortConfig.key === 'owners' ? (
                    sortConfig.direction === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                  )}
                </Button>
              </div>
            </TableHead>
             <TableHead>
              <div className="flex items-center gap-2">
                Volume
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('volume')}
                >
                  {sortConfig.key === 'volume' ? (
                    sortConfig.direction === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                  )}
                </Button>
              </div>
            </TableHead>
            <TableHead>ARR</TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 First Visit
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('first_visit')}
                 >
                   {sortConfig.key === 'first_visit' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Second Visit
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('second_visit')}
                 >
                   {sortConfig.key === 'second_visit' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Third Visit
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('third_visit')}
                 >
                   {sortConfig.key === 'third_visit' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>Status</TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Rating
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('rating')}
                 >
                   {sortConfig.key === 'rating' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Reviews
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('reviews')}
                 >
                   {sortConfig.key === 'reviews' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Instagram
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('instagram')}
                 >
                   {sortConfig.key === 'instagram' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Followers
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('followers')}
                 >
                   {sortConfig.key === 'followers' ? (
                     sortConfig.direction === 'asc' ? (
                       <ArrowUp className="h-4 w-4" />
                     ) : (
                       <ArrowDown className="h-4 w-4" />
                     )
                   ) : (
                     <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                   )}
                 </Button>
               </div>
             </TableHead>
             <TableHead>Lead</TableHead>
             <TableHead>
              <div className="flex items-center gap-2">
                Notes
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('notes')}
                >
                  {sortConfig.key === 'notes' ? (
                    sortConfig.direction === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                  )}
                </Button>
              </div>
            </TableHead>
             <TableHead className="w-[100px]">Actions</TableHead>
           </TableRow>
         </TableHeader>
         <TableBody>
           {paginatedShops.map((shop) => (
             <TableRow key={shop.id}>
               <TableCell>
                 <Checkbox
                   checked={selectedShops.includes(shop.id)}
                   onCheckedChange={(checked) => {
                     setSelectedShops(
                       checked
                         ? [...selectedShops, shop.id]
                         : selectedShops.filter(id => id !== shop.id)
                     )
                   }}
                 />
               </TableCell>
               <TableCell>
                 <Link
                   href={`/dashboard/coffee-shops/${shop.id}`}
                   className="font-medium hover:underline"
                 >
                   {shop.title}
                 </Link>
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.area}
                   onUpdate={(value) => handleCellUpdate(shop, 'area', value)}
                 />
               </TableCell>

               <TableCell>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <StarRating
                    value={shop.priority || 0}
                    onUpdate={(value) => handleCellUpdate(shop, 'priority', value)}
                    className="group-hover:opacity-100"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={shop.isPartner ? "success" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => handleCellUpdate(shop, 'isPartner', !shop.isPartner)}
                >
                  {shop.isPartner ? (
                    <><Shield className="h-4 w-4 mr-1" /> Partner</>
                  ) : "Not Partner"}
                </Badge>
              </TableCell>


               <TableCell>
                 <EditableCell
                   value={shop.manager_present}
                   onUpdate={(value) => handleCellUpdate(shop, 'manager_present', value)}
                   type="manager"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.contact_name}
                   onUpdate={(value) => handleCellUpdate(shop, 'contact_name', value)}
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.contact_email}
                   onUpdate={(value) => handleCellUpdate(shop, 'contact_email', value)}
                   type="email"
                 />
               </TableCell>
               <TableCell>
                <EditableCell
                  value={shop.owners.map(owner => `${owner.name} (${owner.email})`).join(', ') || null}
                  onUpdate={async (value) => {
                    // Parse owner string into array of objects
                    const owners = value ? value.split(',').map(owner => {
                      const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/);
                      if (match) {
                        return {
                          name: match[1].trim(),
                          email: match[2].trim()
                        };
                      }
                      return null;
                    }).filter(Boolean) : [];
                    
                    await handleCellUpdate(shop, 'owners', owners);
                  }}
                  type="owners"
                />
              </TableCell>
               <TableCell>
                  <EditableCell 
                    value={shop.volume?.toString() || null}
                    onUpdate={(value) => handleCellUpdate(shop, 'volume', value)}
                    type="volume"
                  />
                </TableCell>
                <TableCell>
                  {shop.volume ? (
                    <div className="text-sm">
                      ${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}
                    </div>
                  ) : "-"}
                </TableCell>
               <TableCell>
                 <DateCell
                   date={shop.first_visit ? new Date(shop.first_visit) : null}
                   onUpdate={(date) => handleDateUpdate(shop, 'first_visit', date)}
                   onRemove={() => handleDateRemove(shop, 'first_visit')}
                 />
               </TableCell>
               <TableCell>
                 <DateCell
                   date={shop.second_visit ? new Date(shop.second_visit) : null}
                   onUpdate={(date) => handleDateUpdate(shop, 'second_visit', date)}
                   onRemove={() => handleDateRemove(shop, 'second_visit')}
                 />
               </TableCell>
               <TableCell>
                 <DateCell
                   date={shop.third_visit ? new Date(shop.third_visit) : null}
                   onUpdate={(date) => handleDateUpdate(shop, 'third_visit', date)}
                   onRemove={() => handleDateRemove(shop, 'third_visit')}
                 />
               </TableCell>
               <TableCell>
                 <Badge
                   variant={shop.visited ? "success" : "default"}
                   className="cursor-pointer"
                   onClick={() => handleCellUpdate(shop, 'visited', !shop.visited)}
                 >
                   {shop.visited ? "Visited" : "Not Visited"}
                 </Badge>
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.rating?.toString()}
                   onUpdate={(value) => handleCellUpdate(shop, 'rating', value ? parseFloat(value) : null)}
                   type="number"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.reviews?.toString()}
                   onUpdate={(value) => handleCellUpdate(shop, 'reviews', value ? parseFloat(value) : null)}
                   type="number"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.instagram}
                   onUpdate={(value) => handleCellUpdate(shop, 'instagram', value)}
                   type="instagram"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.followers?.toString()}
                   onUpdate={(value) => handleCellUpdate(shop, 'followers', value ? parseInt(value) : null)}
                   type="number"
                 />
               </TableCell>
               <TableCell>
                 <Badge
                   variant={shop.parlor_coffee_leads ? "warning" : "default"}
                   className="cursor-pointer"
                   onClick={() => handleCellUpdate(shop, 'parlor_coffee_leads', !shop.parlor_coffee_leads)}
                 >
                   {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
                 </Badge>
               </TableCell>
               <TableCell>
                <EditableCell
                  value={shop.notes}
                  onUpdate={(value) => handleCellUpdate(shop, 'notes', value)}
                  type="notes"
                />
                </TableCell>
               <TableCell>
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="sm">
                       <MoreHorizontal className="h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
                     <DropdownMenuItem onClick={() => router.push(`/dashboard/coffee-shops/${shop.id}`)}>
                       <Edit className="mr-2 h-4 w-4" />
                       View Details
                     </DropdownMenuItem>
                     <DropdownMenuItem
                       className="text-red-600"
                       onClick={() => setDeleteId(shop.id)}
                     >
                       <Trash2 className="mr-2 h-4 w-4" />
                       Delete
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </TableCell>
             </TableRow>
           ))}
         </TableBody>
       </Table>
     </div>

    {/* Pagination - Show on both views */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing {paginatedShops.length} of results
      </p>
      <div className="flex items-center justify-end gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>

    {/* Delete Dialog */}
    <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the coffee shop and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => handleDelete(deleteId!)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

     <style jsx>{`
       @media (max-width: 768px) {
         .overflow-x-auto {
           -webkit-overflow-scrolling: touch;
         }
         
         .table {
           min-width: 100%;
         }
       }
       
       @media (min-width: 769px) {
         .overflow-x-auto {
           max-width: 100%;
         }

         .table {
           min-width: 100%;
           width: max-content;
         }

         th, td {
           white-space: nowrap;
           padding: 0.75rem 1rem;
         }

         th:first-child,
         td:first-child {
           position: sticky;
           left: 0;
           background: white;
           z-index: 1;
         }
       }
     `}</style>
   </div>
 )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/domain-search.tsx
// components/domain-search.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search } from "lucide-react"
import type { DomainSearchRequest, DomainSearchResponse } from "@/types/api"

interface DomainSearchProps {
  onEmailsFound: (emails: DomainSearchResponse['response']['email_list']) => void
  onCompanyData?: (data: DomainSearchResponse['response']['company_enrichment']) => void
}

export function DomainSearch({ onEmailsFound, onCompanyData }: DomainSearchProps) {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!domain) return

    setLoading(true)
    try {
      const payload: DomainSearchRequest = {
        company: domain,
        limit: 50,
        email_type: "all",
        company_enrichment: true
      }

      const response = await fetch("/api/domain-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data: DomainSearchResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search domain")
      }

      onEmailsFound(data.response.email_list)
      
      if (data.response.company_enrichment) {
        onCompanyData?.(data.response.company_enrichment)
      }

      toast({
        title: "Search completed",
        description: `Found ${data.response.email_list.length} email addresses`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search domain",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter domain (e.g., company.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch()
        }}
      />
      <Button onClick={handleSearch} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="ml-2">Search</span>
      </Button>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/editable-cell.tsx
// editable-cell.tsx
import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Pencil, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | null;
  onUpdate: (value: string | null) => Promise<void>;
  type?: "text" | "number" | "instagram" | "email" | "manager" | "owners" | "notes" | "volume";
  className?: string;
}

export function EditableCell({ value, onUpdate, type = "text", className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(editValue || null);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {type === "notes" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSave();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(value || "");
              }
            }}
            disabled={isUpdating}
            autoFocus
          />
        ) : (
          <Input
            type={type === "number" || type === "volume" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={cn("w-full", className)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(value || "");
              }
            }}
            disabled={isUpdating}
            autoFocus
          />
        )}
        <Button size="sm" onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <span className="animate-spin">...</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-muted/50",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      {type === "instagram" && value ? (
        <a
          href={`https://instagram.com/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          @{value}
        </a>
      ) : type === "email" && value ? (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <span>{value || "-"}</span>
      )}
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

interface DateCellProps {
  date: Date | null;
  onUpdate: (date: Date | null) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function DateCell({ date, onUpdate, onRemove }: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDateSelect = async (newDate: Date | undefined) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(newDate || null);
      setIsOpen(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onRemove();
      setIsOpen(false);
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[120px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={isUpdating}
        >
          {date ? format(date, "MMM d, yyyy") : "Not set"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        {date && (
          <Button
            variant="destructive"
            size="sm"
            className="mt-2 w-full"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            Remove Date
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface StarRatingProps {
  value: number;
  onUpdate: (value: number) => Promise<void>;
  className?: string;
}

export function StarRating({ value, onUpdate, className }: StarRatingProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newValue: number) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(newValue);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            star <= value ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
          )}
          onClick={() => handleUpdate(star)}
        />
      ))}
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/email-person-add.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  UserPlus, 
  Loader2, 
  Mail,
  Phone,
  Tag 
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Form validation schema
const personFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type PersonFormValues = z.infer<typeof personFormSchema>

interface EmailPersonAddProps {
  email: {
    email: string
    email_type: "generic" | "professional"
    first_name: string | null
    last_name: string | null
    verification: {
      status: string
      last_verified_at: string | null
    }
  }
  coffeeShopId: string
  onPersonAdded?: () => void
  disabled?: boolean
}

export function EmailPersonAdd({ 
  email, 
  coffeeShopId, 
  onPersonAdded,
  disabled = false 
}: EmailPersonAddProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Initialize form with email data
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      firstName: email.first_name || "",
      lastName: email.last_name || "",
      email: email.email,
      phone: "",
      notes: "",
    },
  })

  async function onSubmit(values: PersonFormValues) {
    if (!coffeeShopId) {
      toast({
        title: "Error",
        description: "Coffee shop ID is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          emailType: email.email_type,
          verificationStatus: email.verification.status,
          lastVerifiedAt: email.verification.last_verified_at,
          coffeeShopId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add person")
      }

      toast({
        title: "Success",
        description: "Person added successfully",
      })

      setIsOpen(false)
      onPersonAdded?.()
    } catch (error) {
      console.error("Failed to add person:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add person",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="h-8 w-8 p-0"
        title="Add as person"
      >
        <UserPlus className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
            <DialogDescription>
              Add this email address as a new person
            </DialogDescription>
          </DialogHeader>

          {/* Email verification info */}
          <div className="flex items-center gap-2 my-4">
            <Badge variant={email.email_type === "professional" ? "default" : "secondary"}>
              <Mail className="mr-2 h-4 w-4" />
              {email.email_type}
            </Badge>
            <Badge variant={email.verification.status === "VALID" ? "success" : "secondary"}>
              <Tag className="mr-2 h-4 w-4" />
              {email.verification.status}
            </Badge>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input {...field} readOnly className="bg-muted" />
                        <Badge variant="outline">
                          {email.verification.status}
                        </Badge>
                      </div>
                    </FormControl>
                    <FormDescription>
                      This email was discovered through domain search
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="tel" placeholder="+1 (555) 000-0000" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Optional phone number for contact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes field */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Add any additional notes about this person..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form actions */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Person...
                    </>
                  ) : (
                    "Add Person"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/filter-value-input.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
 DropdownMenuRadioGroup,
 DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"

type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'followers' | 'volume'
type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

interface FilterValueInputProps {
 type: FilterDataType
 value: any
 onChange: (value: any) => void
 operator: FilterOperator
}

export function FilterValueInput({ 
 type, 
 value, 
 onChange, 
 operator 
}: FilterValueInputProps) {
 const [rangeValue, setRangeValue] = useState<{min?: string | number, max?: string | number}>({})

 switch (type) {
   case 'date':
     return (
       <div className="flex flex-col space-y-2">
         <Calendar
           mode={operator === 'between' ? "range" : "single"}
           selected={value}
           onSelect={onChange}
           className="rounded-md border"
         />
       </div>
     )
   
   case 'boolean':
     return (
       <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
         <DropdownMenuRadioItem value="true">Yes</DropdownMenuRadioItem>
         <DropdownMenuRadioItem value="false">No</DropdownMenuRadioItem>
       </DropdownMenuRadioGroup>
     )
   
   case 'number':
   case 'rating':
   case 'followers':
   case 'volume':
     return operator === 'between' ? (
       <div className="flex items-center space-x-2">
         <Input
           type="number"
           value={rangeValue.min ?? ''}
           onChange={e => {
             const newValue = { ...rangeValue, min: e.target.value }
             setRangeValue(newValue)
             onChange(newValue)
           }}
           className="w-20"
           placeholder="Min"
         />
         <span>to</span>
         <Input
           type="number"
           value={rangeValue.max ?? ''}
           onChange={e => {
             const newValue = { ...rangeValue, max: e.target.value }
             setRangeValue(newValue)
             onChange(newValue)
           }}
           className="w-20"
           placeholder="Max"
         />
       </div>
     ) : (
       <Input
         type="number"
         value={value ?? ''}
         onChange={e => onChange(e.target.value)}
         className="w-full"
         placeholder={type === 'rating' ? "0-5" : type === 'followers' ? "Number of followers" : "Enter number"}
       />
     )
   
   default:
     return (
       <Input
         type="text"
         value={value ?? ''}
         onChange={e => onChange(e.target.value)}
         className="w-full"
         placeholder={`Enter ${type}`}
       />
     )
 }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/instagram-cell.tsx
// src/components/coffee-shops/instagram-cell.tsx
"use client"

import { useState } from "react"
import { Instagram, Edit, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { CoffeeShop } from "@prisma/client"

interface InstagramCellProps {
  shop: CoffeeShop
  onUpdate: (value: string) => Promise<void>
}

export function InstagramCell({ shop, onUpdate }: InstagramCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(shop.instagram || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Clean the Instagram handle
      const cleanedValue = editValue
        .trim()
        .replace("@", "")
        .replace("https://www.instagram.com/", "")
        .replace("/", "")

      await onUpdate(cleanedValue)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Instagram handle updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Instagram handle",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatInstagramUrl = (handle: string) => {
    const cleanHandle = handle
      .replace("@", "")
      .replace("https://www.instagram.com/", "")
      .replace("/", "")
    return `https://www.instagram.com/${cleanHandle}`
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Instagram handle"
          className="h-8 w-[200px]"
          disabled={isLoading}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSave()
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setEditValue(shop.instagram || "")
          }}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {shop.instagram ? (
        <Link
          href={formatInstagramUrl(shop.instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <Instagram className="h-4 w-4" />
          {shop.instagram.startsWith("@") ? shop.instagram : `@${shop.instagram}`}
        </Link>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/mobile-card-view.tsx
"use client";

import { useState } from "react";
import { CoffeeShop } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EditableCell, DateCell, StarRating } from "./editable-cell";

interface MobileCardViewProps {
  shops: CoffeeShop[];
  onVisitToggle: (shop: CoffeeShop) => Promise<void>;
  onDelete: (id: string) => void;
  onUpdate: (shop: CoffeeShop, field: keyof CoffeeShop, value: any) => Promise<void>;
}

export function MobileCardView({ shops, onVisitToggle, onDelete, onUpdate }: MobileCardViewProps) {
  return (
    <div className="space-y-4">
      {shops.map((shop) => (
        <Card key={shop.id}>
          <CardHeader>
            <CardTitle>{shop.title}</CardTitle>
            <CardDescription>{shop.area}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center justify-between">
                    <div>Details</div>
                    <Edit className="h-4 w-4" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>Priority</div>
                      <StarRating
                        value={shop.priority || 0}
                        onUpdate={(value) => onUpdate(shop, "priority", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Partner Status</div>
                      <Badge
                        variant={shop.isPartner ? "success" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => onUpdate(shop, "isPartner", !shop.isPartner)}
                      >
                        {shop.isPartner ? "Partner" : "Not Partner"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Manager Present</div>
                      <EditableCell
                        value={shop.manager_present}
                        onUpdate={(value) => onUpdate(shop, "manager_present", value)}
                        type="manager"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Contact Name</div>
                      <EditableCell
                        value={shop.contact_name}
                        onUpdate={(value) => onUpdate(shop, "contact_name", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Contact Email</div>
                      <EditableCell
                        value={shop.contact_email}
                        onUpdate={(value) => onUpdate(shop, "contact_email", value)}
                        type="email"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Owners</div>
                      <EditableCell
                        value={shop.owners.map((owner) => `${owner.name} (${owner.email})`).join(", ") || null}
                        onUpdate={async (value) => {
                          const owners = value
                            ? value
                                .split(",")
                                .map((owner) => {
                                  const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/);
                                  if (match) {
                                    return {
                                      name: match[1].trim(),
                                      email: match[2].trim(),
                                    };
                                  }
                                  return null;
                                })
                                .filter(Boolean)
                            : [];
                          await onUpdate(shop, "owners", owners);
                        }}
                        type="owners"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Volume</div>
                      <EditableCell
                        value={shop.volume?.toString() || null}
                        onUpdate={(value) => onUpdate(shop, "volume", value)}
                        type="volume"
                      />
                    </div>
                    <div>
                      <div>ARR</div>
                      <div>
                        {shop.volume ? (
                          <span>${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}</span>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>First Visit</div>
                      <DateCell
                        date={shop.first_visit ? new Date(shop.first_visit) : null}
                        onUpdate={(date) => onUpdate(shop, "first_visit", date?.toISOString() || null)}
                        onRemove={() => onUpdate(shop, "first_visit", null)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Second Visit</div>
                      <DateCell
                        date={shop.second_visit ? new Date(shop.second_visit) : null}
                        onUpdate={(date) => onUpdate(shop, "second_visit", date?.toISOString() || null)}
                        onRemove={() => onUpdate(shop, "second_visit", null)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Third Visit</div>
                      <DateCell
                        date={shop.third_visit ? new Date(shop.third_visit) : null}
                        onUpdate={(date) => onUpdate(shop, "third_visit", date?.toISOString() || null)}
                        onRemove={() => onUpdate(shop, "third_visit", null)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Rating</div>
                      <EditableCell
                        value={shop.rating?.toString()}
                        onUpdate={(value) => onUpdate(shop, "rating", value ? parseFloat(value) : null)}
                        type="number"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Reviews</div>
                      <EditableCell
                        value={shop.reviews?.toString()}
                        onUpdate={(value) => onUpdate(shop, "reviews", value ? parseInt(value) : null)}
                        type="number"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Instagram</div>
                      <EditableCell
                        value={shop.instagram || ""}
                        onUpdate={(value) => onUpdate(shop, "instagram", value)}
                        type="instagram"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Followers</div>
                      <EditableCell
                        value={shop.followers?.toString()}
                        onUpdate={(value) => onUpdate(shop, "followers", value ? parseInt(value) : null)}
                        type="number"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Lead Status</div>
                      <Badge
                        variant={shop.parlor_coffee_leads ? "warning" : "default"}
                        className="cursor-pointer"
                        onClick={() => onUpdate(shop, "parlor_coffee_leads", !shop.parlor_coffee_leads)}
                      >
                        {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
                      </Badge>
                    </div>
                    <div>
                      <div>Notes</div>
                      <EditableCell
                        value={shop.notes}
                        onUpdate={(value) => onUpdate(shop, "notes", value)}
                        type="notes"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-4 flex items-center justify-between">
              <div>Visit Status</div>
              <Badge
                variant={shop.visited ? "success" : "default"}
                className="cursor-pointer"
                onClick={() => onUpdate(shop, "visited", !shop.visited)}
              >
                {shop.visited ? "Visited" : "Not Visited"}
              </Badge>
            </div>
          </CardContent>
          <CardContent className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(shop.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/mobile-nav.tsx
"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, PlusCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const routes = [
  {
    label: "Coffee Shops",
    href: "/dashboard/coffee-shops",
  },
  {
    label: "Add New",
    href: "/dashboard/coffee-shops/new",
    icon: PlusCircle
  }
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Coffee Shops</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === route.href 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                {route.icon && <route.icon className="mr-2 h-4 w-4" />}
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/new-coffee-shop-form.tsx
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DomainSearch } from "./domain-search"
import { PlaceSearch } from "./place-search"


import {
  ArrowLeft,
  Building,
  Globe,
  Loader2,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import type { DomainSearchEmail } from "@/types/api"

function EmailEditRow({ 
  email, 
  index, 
  onUpdate,
  onDelete  // Add this prop
}: { 
  email: any, 
  index: number, 
  onUpdate: (index: number, updates: { first_name?: string, last_name?: string }) => void,
  onDelete: (index: number) => void  // Add this type
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(email.first_name || '')
  const [lastName, setLastName] = useState(email.last_name || '')

  const handleSave = () => {
    onUpdate(index, {
      first_name: firstName || null,
      last_name: lastName || null
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-4 flex-1">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-[150px]"
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-[150px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setIsEditing(false)
              setFirstName(email.first_name || '')
              setLastName(email.last_name || '')
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <div className="flex items-center gap-4">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{email.email}</div>
          <div 
            className="text-sm text-muted-foreground cursor-pointer hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            {firstName || lastName ? (
              `${firstName} ${lastName}`
            ) : (
              "Click to add name"
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={email.email_type === "professional" ? "default" : "secondary"}>
          {email.email_type}
        </Badge>
        <Badge variant={
          email.verification.status === "VALID" ? "success" :
          email.verification.status === "INVALID" ? "destructive" :
          "secondary"
        }>
          {email.verification.status}
        </Badge>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(index)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


// Form Schemas
const emailSchema = z.object({
  email: z.string().email(),
  email_type: z.enum(["generic", "professional"]),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  verification: z.object({
    status: z.string(),
    last_verified_at: z.string().nullable()
  })
})

const companyDataSchema = z.object({
  size: z.string().nullish(),
  industry: z.string().nullish(),
  founded_in: z.number().nullish(),
  description: z.string().nullish(),
  linkedin: z.string().nullish()
}).optional()

const coffeeShopSchema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  area: z.string().min(2, "Area is required"),
  website: z.string().optional(),
  manager_present: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  followers: z.number().optional(),
  store_doors: z.string().optional(),
  volume: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().optional(),
  price_type: z.string().optional(),
  type: z.string().optional(),
  types: z.array(z.string()).default([]),
  latitude: z.number(),
  longitude: z.number(),
  is_source: z.boolean().default(false),
  parlor_coffee_leads: z.boolean().default(false),
  notes: z.string().optional(),
  emails: z.array(emailSchema).default([]),
  hours: z.string().optional(), // Add this line
  company_data: companyDataSchema
}).transform((data) => ({
  ...data,
  volume: data.volume ? data.volume.toString() : undefined,
  followers: data.followers ? Number(data.followers) : undefined,
  rating: data.rating ? Number(data.rating) : undefined,
  reviews: data.reviews ? Number(data.reviews) : undefined
}))


type FormData = z.infer<typeof coffeeShopSchema>

// Main Form Component
export function NewCoffeeShopForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [geocodeLoading, setGeocodeLoading] = useState(false)
  const [additionalLocations, setAdditionalLocations] = useState<any[]>([]);
  
  const handleWebsiteFound = async (website: string) => {
    console.log("Website found:", website);
    
    try {
      // Clean the website URL
      const cleanUrl = website
        .replace(/^https?:\/\//, '')  // Remove protocol
        .replace(/^www\./, '')        // Remove www
        .replace(/\/$/, '');          // Remove trailing slash
  
      // Update the form's website field
      form.setValue('website', website);
      
      // Make request to our API endpoint
      const response = await fetch("/api/domain-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company: cleanUrl,
          limit: 50,
          email_type: "all",
          company_enrichment: true
        })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search domain");
      }
  
      const data = await response.json();
  
      // Update emails in form
      if (data.response?.email_list?.length > 0) {
        form.setValue('emails', data.response.email_list);
        toast({
          title: "Emails Found",
          description: `Found ${data.response.email_list.length} email addresses`
        });
      }
  
      // Update company data if available
      if (data.response?.company_enrichment) {
        form.setValue('company_data', {
          size: data.response.company_enrichment.size,
          industry: data.response.company_enrichment.industry,
          founded_in: data.response.company_enrichment.founded_in,
          description: data.response.company_enrichment.description,
          linkedin: data.response.company_enrichment.linkedin
        });
      }
  
    } catch (error) {
      console.error("Domain search error:", error);
      toast({
        title: "Domain Search Error",
        description: error instanceof Error ? error.message : "Failed to search domain",
        variant: "destructive"
      });
    }
  };

 
  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(coffeeShopSchema),
    defaultValues: {
      is_source: false,
      parlor_coffee_leads: false,
      types: [],
      latitude: 0,
      longitude: 0,
      emails: [],
    },
  })

  // Handle address geocoding
  const handleAddressBlur = async () => {
    const address = form.getValues("address")
    if (address) {
      setGeocodeLoading(true)
      try {
        console.log("Geocoding address:", address)
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        )
        const data = await response.json()
        console.log("Geocoding response:", data)
        
        if (data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location
          console.log("Setting coordinates:", { lat, lng })
          form.setValue("latitude", lat)
          form.setValue("longitude", lng)
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        toast({
          title: "Geocoding Error",
          description: "Failed to get coordinates from address",
          variant: "destructive"
        })
      } finally {
        setGeocodeLoading(false)
      }
    }
  }

// Replace handlePlacesSelected with this
const handlePlacesSelected = async (placesData: any[]) => {
  if (placesData.length === 0) return;

  // Set the first location data to the form
  const primaryLocation = placesData[0];
  form.reset({
    ...form.getValues(), // Keep existing values
    title: primaryLocation.title,
    address: primaryLocation.address,
    phone: primaryLocation.phone,
    website: primaryLocation.website,
    rating: primaryLocation.rating,
    reviews: primaryLocation.reviews,
    price_type: primaryLocation.price_type,
    latitude: primaryLocation.latitude,
    longitude: primaryLocation.longitude,
    hours: primaryLocation.hours,
    types: primaryLocation.types.filter((type: string) => 
      !['point_of_interest', 'establishment'].includes(type)
    )
  });

  // If there's a website, trigger domain search
  if (primaryLocation.website) {
    await handleWebsiteFound(primaryLocation.website);
  }

  // Store additional locations
  if (placesData.length > 1) {
    setAdditionalLocations(placesData.slice(1));
    toast({
      title: "Multiple Locations Found",
      description: `Primary location loaded in form. ${placesData.length - 1} additional locations will be created after submission.`,
    });
  }
};
  
  // Handle emails found from domain search
  const handleEmailsFound = useCallback((emails: DomainSearchEmail[]) => {
    console.log("Emails found:", emails)
    form.setValue('emails', emails)
  }, [form])

  // Handle company data from domain search
  const handleCompanyData = useCallback((data: any) => {
    console.log("Company data received:", data)
    form.setValue('company_data', {
      size: data.size,
      industry: data.industry,
      founded_in: data.founded_in,
      description: data.description,
      linkedin: data.linkedin
    })
    if (data.website) {
      form.setValue('website', data.website)
    }
  }, [form])

  // Form submission handler
async function onSubmit(data: FormData) {
  setLoading(true);
  try {
    // Create primary location
    const response = await fetch("/api/coffee-shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Failed to create primary location");
    }

    const createdShop = await response.json();

    // Create people from emails for the primary location
    if (data.emails?.length > 0) {
      let successCount = 0;
      for (const email of data.emails) {
        try {
          const personResponse = await fetch("/api/people", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: email.first_name || undefined,
              lastName: email.last_name || undefined,
              email: email.email,
              emailType: email.email_type,
              verificationStatus: email.verification.status,
              lastVerifiedAt: email.verification.last_verified_at,
              company: data.title,  // Add company name
              coffeeShopId: createdShop.id,
              notes: `Added from domain search for ${data.title}`
            })
          });

          if (personResponse.ok) {
            successCount++;
          } else {
            console.error(`Failed to create person for email: ${email.email}`);
          }
        } catch (error) {
          console.error(`Error creating person for email ${email.email}:`, error);
        }
      }

      if (successCount > 0) {
        toast({
          title: "People Added",
          description: `Successfully added ${successCount} people from emails`
        });
      }
    }

    // Create additional locations if any
    if (additionalLocations.length > 0) {
      for (const location of additionalLocations) {
        try {
          const additionalResponse = await fetch("/api/coffee-shops", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...location,
              emails: data.emails,
              company_data: data.company_data,
              is_source: data.is_source,
              parlor_coffee_leads: data.parlor_coffee_leads,
            })
          });

          if (!additionalResponse.ok) {
            console.error(`Failed to create additional location: ${location.title}`);
            continue;
          }

          const additionalShop = await additionalResponse.json();

          // Create people for additional location
          if (data.emails?.length > 0) {
            for (const email of data.emails) {
              try {
                await fetch("/api/people", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    firstName: email.first_name || undefined,
                    lastName: email.last_name || undefined,
                    email: email.email,
                    emailType: email.email_type,
                    verificationStatus: email.verification.status,
                    lastVerifiedAt: email.verification.last_verified_at,
                    company: location.title,
                    coffeeShopId: additionalShop.id,
                    notes: `Added from domain search for ${location.title}`
                  })
                });
              } catch (error) {
                console.error(`Error creating person for email ${email.email} in location ${location.title}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error creating additional location: ${location.title}`, error);
        }
      }
    }

    toast({
      title: "Success",
      description: `Created ${additionalLocations.length + 1} locations successfully`
    });

    router.push(`/dashboard/coffee-shops/${createdShop.id}`);
    router.refresh();
  } catch (error) {
    console.error("Form submission error:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create coffee shops",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/coffee-shops"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to coffee shops
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Coffee Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
          <form 
              // Change this line
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
            {/* Domain Search Section */}
           <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Domain Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <DomainSearch 
                    onEmailsFound={handleEmailsFound}
                    onCompanyData={handleCompanyData}
                  />
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Search Business</CardTitle>
                  <CardDescription>
                    Search for your coffee shop to auto-fill details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <PlaceSearch 
                    onPlacesSelected={handlePlacesSelected} 
                    onWebsiteFound={handleWebsiteFound}
                    onInstagramFound={(instagram) => {
                      form.setValue('instagram', instagram)
                    }}
                    onAreaFound={(area) => {
                      form.setValue('area', area)
                    }}
                    onStoreDoorsUpdate={(count) => {
                      form.setValue('store_doors', count.toString())
                    }}
                  />
                </CardContent>
              </Card>
              {/* Basic Information */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Coffee Shop Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input placeholder="Business district, neighborhood, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address and Location */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Full address"
                          {...field}
                          onBlur={handleAddressBlur}
                        />
                        {geocodeLoading && (
                          <div className="absolute right-2 top-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {geocodeLoading && (
                      <FormDescription>Loading coordinates...</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coordinates */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="40.7128" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="any"
                          placeholder="-74.0060"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                {/* Domain Search Results */}
                {form.watch('emails')?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Found Email Addresses</CardTitle>
                      <CardDescription>
                        Edit names if needed. These emails will be added as people after the coffee shop is created.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.watch('emails').map((email, index) => (
                        <EmailEditRow
                          key={index}
                          email={email}
                          index={index}
                          onUpdate={(index, updates) => {
                            const emails = [...form.watch('emails')];
                            emails[index] = {
                              ...emails[index],
                              ...updates
                            };
                            form.setValue('emails', emails);
                          }}
                          onDelete={(index) => {
                            const emails = [...form.watch('emails')];
                            emails.splice(index, 1);
                            form.setValue('emails', emails);
                          }}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

              {/* Company Data */}
              {form.watch('company_data') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Company Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {form.watch('company_data.size') && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium">Company Size</label>
                            <p className="text-sm text-muted-foreground">
                              {form.watch('company_data.size')}
                            </p>
                          </div>
                        </div>
                      )}
                      {form.watch('company_data.industry') && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium">Industry</label>
                            <p className="text-sm text-muted-foreground">
                              {form.watch('company_data.industry')}
                            </p>
                          </div>
                        </div>
                      )}
                      
                    </div>
                    
                    {form.watch('company_data.description') && (
                      <div className="mt-4">
                        <label className="text-sm font-medium">Description</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {form.watch('company_data.description')}
                        </p>
                      </div>
                    )}
                    
                  </CardContent>
                </Card>
              )}
                {additionalLocations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Locations</CardTitle>
                      <CardDescription>
                        These locations will be created with the same settings after submission
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {additionalLocations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{location.title}</h3>
                            <p className="text-sm text-muted-foreground">{location.address}</p>
                          </div>
                          <Button 
                            variant="ghost"
                            onClick={() => {
                              setAdditionalLocations(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              {/* Contact Information */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="manager_present"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager Present</FormLabel>
                      <FormControl>
                        <Input placeholder="Manager's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact person's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Social and Business Info */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Handle</FormLabel>
                      <FormControl>
                        <Input placeholder="@handle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Followers</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (Weekly)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value || /^\d*\.?\d*$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the weekly volume
                      </FormDescription>
                      {field.value && (
                        <FormDescription>
                          Annual Revenue: ${((parseFloat(field.value) * 52) * 18).toLocaleString()}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Information */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="store_doors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Doors</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reviews"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Reviews</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes about this coffee shop..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Flags */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_source"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Source Location</FormLabel>
                        <FormDescription>
                          Mark this as a source/partner location
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parlor_coffee_leads"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Potential Lead</FormLabel>
                        <FormDescription>
                          Mark this as a potential lead
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => router.push('/dashboard/coffee-shops')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Coffee Shop"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/owner-cell.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Mail, Pencil, UserPlus, X } from "lucide-react"

interface Owner {
 id: string
 name: string
 email: string
}

interface OwnerCellProps {
 owners: Owner[]
 onUpdate: (owners: Owner[]) => Promise<void>
}

export function OwnerCell({ owners, onUpdate }: OwnerCellProps) {
 const [isEditing, setIsEditing] = useState(false)
 const [editingOwners, setEditingOwners] = useState(owners)
 const [isUpdating, setIsUpdating] = useState(false)

 const addOwner = () => {
   setEditingOwners([...editingOwners, { id: Date.now().toString(), name: '', email: '' }])
 }

 const removeOwner = (index: number) => {
   const newOwners = editingOwners.filter((_, i) => i !== index)
   setEditingOwners(newOwners)
 }

 const updateOwner = (index: number, field: 'name' | 'email', value: string) => {
   const newOwners = [...editingOwners]
   newOwners[index] = { ...newOwners[index], [field]: value }
   setEditingOwners(newOwners)
 }

 const handleSave = async () => {
   setIsUpdating(true)
   try {
     await onUpdate(editingOwners)
     setIsEditing(false)
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to update owners",
       variant: "destructive"
     })
   } finally {
     setIsUpdating(false)
   }
 }

 if (isEditing) {
   return (
     <div className="space-y-2">
       {editingOwners.map((owner, index) => (
         <div key={index} className="flex items-center gap-2">
           <Input
             placeholder="Name"
             value={owner.name}
             onChange={(e) => updateOwner(index, 'name', e.target.value)}
             className="w-[120px]"
           />
           <Input
             placeholder="Email"
             value={owner.email}
             onChange={(e) => updateOwner(index, 'email', e.target.value)}
             className="w-[180px]"
           />
           <Button
             variant="ghost"
             size="sm"
             onClick={() => removeOwner(index)}
             disabled={isUpdating}
           >
             <X className="h-4 w-4" />
           </Button>
         </div>
       ))}
       <div className="flex items-center gap-2 mt-2">
         <Button
           variant="outline"
           size="sm"
           onClick={addOwner}
           disabled={isUpdating}
         >
           <UserPlus className="h-4 w-4 mr-2" />
           Add Owner
         </Button>
         <Button
           size="sm"
           onClick={handleSave}
           disabled={isUpdating}
         >
           Save
         </Button>
         <Button
           variant="ghost"
           size="sm"
           onClick={() => {
             setIsEditing(false)
             setEditingOwners(owners)
           }}
           disabled={isUpdating}
         >
           Cancel
         </Button>
       </div>
     </div>
   )
 }

 return (
   <div className="space-y-1">
     {owners.map((owner, index) => (
       <div key={index} className="flex items-center gap-2">
         <span className="text-sm">{owner.name}</span>
         <a
           href={`mailto:${owner.email}`}
           className="text-blue-600 hover:underline text-sm flex items-center gap-1"
           onClick={(e) => e.stopPropagation()}
         >
           <Mail className="h-3 w-3" />
           {owner.email}
         </a>
       </div>
     ))}
     <Button
       variant="ghost"
       size="sm"
       onClick={() => setIsEditing(true)}
     >
       <Pencil className="h-3 w-3" />
     </Button>
   </div>
 )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/place-search.tsx
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
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/responsive-table.tsx
interface ResponsiveTableProps {
  children: React.ReactNode
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <div className="rounded-md border">
        {children}
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/map/DirectionsPanel.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Navigation, ChevronRight } from "lucide-react"

export function DirectionsPanel({ directions, currentStep, onStepChange }) {
  const [steps, setSteps] = useState([])
  const [totalDistance, setTotalDistance] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  useEffect(() => {
    if (directions && directions.routes && directions.routes[0]) {
      const route = directions.routes[0]
      let allSteps = []
      let totalDist = 0
      let totalTime = 0

      route.legs.forEach((leg) => {
        totalDist += leg.distance.value
        totalTime += leg.duration.value
        
        leg.steps.forEach((step) => {
          allSteps.push({
            instructions: step.instructions,
            distance: step.distance.text,
            duration: step.duration.text,
            maneuver: step.maneuver
          })
        })
      })

      setSteps(allSteps)
      setTotalDistance(totalDist / 1000) // Convert to km
      setTotalDuration(Math.round(totalTime / 60)) // Convert to minutes
    }
  }, [directions])

  if (!steps.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Steps</CardTitle>
        <CardDescription>
          {totalDistance.toFixed(1)}km • {totalDuration} mins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                  currentStep === index
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                }`}
                role="button"
                onClick={() => onStepChange(index)}
              >
                <div className="mt-1">
                  {step.maneuver === "turn-right" && (
                    <ChevronRight className="h-4 w-4 -rotate-90" />
                  )}
                  {step.maneuver === "turn-left" && (
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  )}
                  {!step.maneuver && <Navigation className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: step.instructions }}
                  />
                  <div className="text-xs mt-1 opacity-80">
                    {step.distance} • {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/map/destination-reached.tsx
// src/components/coffee-shops/map/destination-reached.tsx
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Check,
  ArrowRight,
  Building,
  Phone,
  Mail,
  DollarSign,
  Clock,
} from "lucide-react"

export function DestinationReached({ 
  show,
  location,
  onMarkVisited,
  onSkip,
  arrivalTime
}) {
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50
    }
  }

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 200,
        delay: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={cardVariants}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-primary">
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  {/* Icon */}
                  <motion.div
                    variants={iconVariants}
                    className="mx-auto"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="h-8 w-8 text-primary" />
                    </div>
                  </motion.div>

                  {/* Arrival Message */}
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-1"
                    >
                      <h2 className="text-2xl font-semibold">
                        You've Arrived!
                      </h2>
                      <p className="text-muted-foreground">
                        {arrivalTime}
                      </p>
                    </motion.div>
                  </div>

                  {/* Location Details */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-medium text-lg">{location.title}</h3>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                        
                        <div className="grid grid-cols-1 gap-2 pt-2">
                          {location.volume && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Volume: {location.volume} | ARR: ${((parseFloat(location.volume) * 52) * 18).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {location.manager_present && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>Manager: {location.manager_present}</span>
                            </div>
                          )}
                          {location.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{location.phone}</span>
                            </div>
                          )}
                          {location.contact_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{location.contact_email}</span>
                            </div>
                          )}
                        </div>

                        {location.visited ? (
                          <Badge variant="success" className="mt-2">Previously Visited</Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-2">New Location</Badge>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        onClick={onMarkVisited}
                        className="w-full"
                        size="lg"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Visited
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={onSkip}
                        className="w-full"
                        size="lg"
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Skip Location
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/map/map-tab-content.tsx
"use client"

import { useState } from "react"
import { RouteMap } from "./route-map"
import { CoffeeShop } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Navigation, 
  MapPin, 
  ArrowRight,
  X,
  Check,
} from "lucide-react"

interface MapTabContentProps {
  shop: CoffeeShop
  nearbyShops: CoffeeShop[]
  maxDistance: number
}

export function MapTabContent({ shop, nearbyShops, maxDistance }: MapTabContentProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentStopIndex, setCurrentStopIndex] = useState(-1)
  const [visitedStops, setVisitedStops] = useState<number[]>([])
  const [optimizedRoute, setOptimizedRoute] = useState<CoffeeShop[]>([])

  const handleStartDirections = () => {
    // Start with the optimized route passed from the map component
    setOptimizedRoute(nearbyShops)
    setCurrentStopIndex(0)
    setVisitedStops([])
    setIsNavigating(true)
  }

  const handleCancelDirections = () => {
    setIsNavigating(false)
    setCurrentStopIndex(-1)
    setVisitedStops([])
    setOptimizedRoute([])
  }

  const handleLocationVisited = () => {
    setVisitedStops(prev => [...prev, currentStopIndex])
    
    // Move to next location if available
    if (currentStopIndex < optimizedRoute.length - 1) {
      setCurrentStopIndex(prev => prev + 1)
    } else {
      // End navigation if all locations visited
      handleCancelDirections()
    }
  }

  const handleSkipLocation = () => {
    if (currentStopIndex < optimizedRoute.length - 1) {
      setCurrentStopIndex(prev => prev + 1)
    }
  }

  const getCurrentLocation = () => {
    if (currentStopIndex === -1) return null
    return optimizedRoute[currentStopIndex]
  }

  return (
    <div className="space-y-4">
      {!isNavigating ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Route Planning</h3>
              <p className="text-sm text-muted-foreground">
                Showing {nearbyShops.length} nearby locations within {maxDistance}km
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <RouteMap
                sourceShop={shop}
                nearbyShops={nearbyShops}
                maxDistance={maxDistance}
                onRouteCalculated={setOptimizedRoute}
                isNavigating={isNavigating}
                currentStopIndex={currentStopIndex}
              />
            </div>

         
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <RouteMap
              sourceShop={shop}
              nearbyShops={[getCurrentLocation()]}
              maxDistance={maxDistance}
              isNavigating={isNavigating}
              currentStopIndex={currentStopIndex}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Destination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                      {currentStopIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getCurrentLocation()?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCurrentLocation()?.address}
                      </p>
                    </div>
                  </div>

                  {/* Location details */}
                  {getCurrentLocation()?.volume && (
                    <div className="mt-2 text-sm">
                      Volume: {getCurrentLocation().volume} | ARR: ${((parseFloat(getCurrentLocation().volume) * 52) * 18).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleLocationVisited}
                    className="w-full"
                    variant="success"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Visited
                  </Button>
                  <Button
                    onClick={handleSkipLocation}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Skip Location
                  </Button>
                  <Button
                    onClick={handleCancelDirections}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Navigation
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Location {currentStopIndex + 1} of {optimizedRoute.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/map/navigation-controls.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Save,
  Map,
  Phone,
  Mail,
  Building,
  DollarSign,
} from "lucide-react"

export function NavigationControls({
  currentLocation,
  canMoveNext,
  canMovePrevious,
  onMoveNext,
  onMovePrevious,
  onLocationUpdate,
  transportMode,
  currentStep,
  totalSteps,
}) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editedLocation, setEditedLocation] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setEditedLocation(currentLocation)
  }, [currentLocation])

  const handleLocationUpdate = async () => {
    setIsUpdating(true)
    try {
      await onLocationUpdate(editedLocation)
      setShowEditDialog(false)
      toast({
        title: "Success",
        description: "Location information updated successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location information.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const generateGoogleMapsUrl = () => {
    if (!currentLocation) return null;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentLocation.latitude},${currentLocation.longitude}&travelmode=${transportMode.toLowerCase()}`;
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-4">
      {/* Current Location Info */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Current Location</h3>
          <Badge variant="outline">
            {currentStep + 1} of {totalSteps}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{currentLocation?.title}</span>
          </div>
          <p className="text-sm text-muted-foreground">{currentLocation?.address}</p>
          
          {currentLocation?.volume && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Volume: {currentLocation.volume} | ARR: ${((parseFloat(currentLocation.volume) * 52) * 18).toLocaleString()}</span>
            </div>
          )}
          
          {currentLocation?.manager_present && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>Manager: {currentLocation.manager_present}</span>
            </div>
          )}

          {currentLocation?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{currentLocation.phone}</span>
            </div>
          )}

          {currentLocation?.contact_email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{currentLocation.contact_email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={onMovePrevious}
          disabled={!canMovePrevious}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onMoveNext}
          disabled={!canMoveNext}
          className="w-full"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              <Edit2 className="mr-2 h-4 w-4" />
              Update Info
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Location Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Manager Present</Label>
                <Input
                  value={editedLocation?.manager_present || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    manager_present: e.target.value
                  })}
                  placeholder="Manager's name"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={editedLocation?.contact_email || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    contact_email: e.target.value
                  })}
                  placeholder="Contact email"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editedLocation?.phone || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    phone: e.target.value
                  })}
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-2">
                <Label>Volume (Weekly)</Label>
                <Input
                  type="number"
                  value={editedLocation?.volume || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    volume: e.target.value
                  })}
                  placeholder="Weekly volume"
                />
                {editedLocation?.volume && (
                  <p className="text-sm text-muted-foreground">
                    ARR: ${((parseFloat(editedLocation.volume) * 52) * 18).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editedLocation?.notes || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    notes: e.target.value
                  })}
                  placeholder="Add notes about this location..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLocationUpdate}
                disabled={isUpdating}
              >
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="secondary" onClick={generateGoogleMapsUrl} className="w-full">
          <Map className="mr-2 h-4 w-4" />
          Open in Maps
        </Button>
      </div>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/map/navigation-panel.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NavigationControls } from "./navigation-controls"

export function NavigationPanel({
  currentLocation,
  nextLocation,
  currentStep,
  totalSteps,
  routeSteps,
  transportMode,
  onStepChange,
  onLocationUpdate,
  onLocationVisited,
  onLocationSkipped,
  onExitNavigation,
  onManualMove,
  isAtDestination,
  arrivalTime,
  timeRemaining,
}) {
  const [showSteps, setShowSteps] = useState(true)

  return (
    <Card className="h-full">
      <CardHeader className="sticky top-0 bg-card z-10 pb-4">
        <CardTitle>Navigation</CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-6">
          {/* Navigation Controls */}
          <NavigationControls
            currentLocation={currentLocation}
            canMoveNext={currentStep < totalSteps - 1}
            canMovePrevious={currentStep > 0}
            onMoveNext={() => onManualMove(currentStep + 1)}
            onMovePrevious={() => onManualMove(currentStep - 1)}
            onLocationUpdate={onLocationUpdate}
            transportMode={transportMode}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />

          {/* Directions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Directions</h3>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {showSteps ? "Hide" : "Show"}
              </button>
            </div>

            {showSteps && (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {routeSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentStep === index
                          ? "bg-primary/10 border border-primary"
                          : index < currentStep
                          ? "bg-muted/50 opacity-50"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => onStepChange(index)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <div
                            dangerouslySetInnerHTML={{ __html: step.instructions }}
                            className="text-sm"
                          />
                          <div className="text-xs mt-1 opacity-80">
                            {step.distance} • {step.duration}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/map/quick-edit-dialog.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Settings2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function QuickEditDialog({ shop, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    manager_present: shop.manager_present || "",
    contact_name: shop.contact_name || "",
    contact_email: shop.contact_email || "",
    volume: shop.volume || "",
    first_visit: shop.first_visit ? new Date(shop.first_visit) : null,
    second_visit: shop.second_visit ? new Date(shop.second_visit) : null,
    third_visit: shop.third_visit ? new Date(shop.third_visit) : null,
  })
  const { toast } = useToast()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onUpdate(formData)
      setIsOpen(false)
      toast({
        title: "Updated successfully",
        description: "Shop details have been updated."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shop details.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Edit - {shop.title}</DialogTitle>
          <DialogDescription>
            Update key information for this location
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Manager Present</Label>
            <Input
              value={formData.manager_present}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                manager_present: e.target.value
              }))}
              placeholder="Manager's name"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input
              value={formData.contact_name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact_name: e.target.value
              }))}
              placeholder="Contact person's name"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact_email: e.target.value
              }))}
              placeholder="contact@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Volume (Weekly)</Label>
            <Input
              type="number"
              value={formData.volume}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                volume: e.target.value
              }))}
              placeholder="Weekly volume"
            />
            {formData.volume && (
              <p className="text-sm text-muted-foreground">
                ARR: ${((parseFloat(formData.volume) * 52) * 18).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Visit Dates</Label>
            
            {/* First Visit */}
            <div className="flex items-center gap-4">
              <Label className="w-24">First Visit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.first_visit ? (
                      format(formData.first_visit, 'PPP')
                    ) : (
                      <span>Not set</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.first_visit}
                    onSelect={handleDateSelect('first_visit')}
                    disabled={(date) =>
                      date > new Date() ||
                      (formData.second_visit && date > formData.second_visit)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Second Visit */}
            <div className="flex items-center gap-4">
              <Label className="w-24">Second Visit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.second_visit ? (
                      format(formData.second_visit, 'PPP')
                    ) : (
                      <span>Not set</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.second_visit}
                    onSelect={handleDateSelect('second_visit')}
                    disabled={(date) =>
                      date > new Date() ||
                      (formData.first_visit && date < formData.first_visit) ||
                      (formData.third_visit && date > formData.third_visit)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Third Visit */}
            <div className="flex items-center gap-4">
              <Label className="w-24">Third Visit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.third_visit ? (
                      format(formData.third_visit, 'PPP')
                    ) : (
                      <span>Not set</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.third_visit}
                    onSelect={handleDateSelect('third_visit')}
                    disabled={(date) =>
                      date > new Date() ||
                      (formData.second_visit && date < formData.second_visit)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/map/route-map.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { format, addMinutes } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { NavigationPanel } from "./navigation-panel"
import { DestinationReached } from "./destination-reached"
import { Car, Navigation , Badge} from "lucide-react"

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

interface RouteStep {
  instructions: string
  distance: string
  duration: string
  maneuver?: string
  start_location: google.maps.LatLng
}

export function RouteMap({ sourceShop, nearbyShops, maxDistance, onRouteCalculated }) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [currentMarker, setCurrentMarker] = useState<google.maps.Marker | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [navigationMode, setNavigationMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([])
  const [transportMode, setTransportMode] = useState<'DRIVING' | 'WALKING'>('DRIVING')
  const [isAtDestination, setIsAtDestination] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      // if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      //   toast({
      //     title: "Configuration Error",
      //     description: "Google Maps API key is missing.",
      //     variant: "destructive"
      //   })
      //   return
      // }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      script.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load Google Maps.",
          variant: "destructive"
        })
      }
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }

    loadGoogleMaps()

    // Cleanup
    return () => {
      markers.forEach(marker => marker.setMap(null))
      if (currentMarker) currentMarker.setMap(null)
      if (directionsRenderer) directionsRenderer.setMap(null)
    }
  }, [])

  const initializeMap = useCallback(() => {
    try {
      const mapInstance = new window.google.maps.Map(
        document.getElementById("route-map")!,
        {
          center: { 
            lat: sourceShop.latitude, 
            lng: sourceShop.longitude 
          },
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }
      )

      // Add traffic layer
      const trafficLayer = new window.google.maps.TrafficLayer()
      trafficLayer.setMap(mapInstance)

      const directionsServiceInstance = new window.google.maps.DirectionsService()
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        preserveViewport: false
      })

      setMap(mapInstance)
      setDirectionsService(directionsServiceInstance)
      setDirectionsRenderer(directionsRendererInstance)

      addMarkers(mapInstance)
    } catch (error) {
      console.error('Failed to initialize map:', error)
      toast({
        title: "Error",
        description: "Failed to initialize the map.",
        variant: "destructive"
      })
    }
  }, [sourceShop])

  const clearMarkers = useCallback(() => {
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])
  }, [markers])

  const addMarkers = useCallback((mapInstance: google.maps.Map) => {
    try {
      clearMarkers()

      // Add source marker
      const sourceMarker = new window.google.maps.Marker({
        position: { 
          lat: sourceShop.latitude, 
          lng: sourceShop.longitude 
        },
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: sourceShop.title,
        label: {
          text: "S",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold"
        }
      })

      const newMarkers = [sourceMarker]

      // Add nearby shop markers
      nearbyShops.forEach((shop, index) => {
        const marker = new window.google.maps.Marker({
          position: { 
            lat: shop.latitude, 
            lng: shop.longitude 
          },
          map: mapInstance,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: shop.visited ? "#22c55e" : "#3b82f6",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
          title: shop.title,
          label: {
            text: (index + 1).toString(),
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "bold"
          }
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-bold text-lg">${shop.title}</h3>
              <p class="text-sm text-muted-foreground">${shop.address}</p>
              ${shop.volume ? `
                <p class="text-sm mt-2">
                  Volume: ${shop.volume} | ARR: $${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}
                </p>
              ` : ''}
              ${shop.manager_present ? `
                <p class="text-sm">Manager: ${shop.manager_present}</p>
              ` : ''}
              ${shop.visited ? 
                `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Visited</span>` : 
                `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">Not Visited</span>`
              }
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
        })

        newMarkers.push(marker)
      })

      setMarkers(newMarkers)
    } catch (error) {
      console.error('Failed to add markers:', error)
      toast({
        title: "Error",
        description: "Failed to add location markers.",
        variant: "destructive"
      })
    }
  }, [sourceShop, nearbyShops, clearMarkers])

  const calculateRoute = useCallback(async () => {
    if (!directionsService || !directionsRenderer || nearbyShops.length === 0) {
      toast({
        title: "Error",
        description: "Map services not ready.",
        variant: "destructive"
      })
      return
    }

    setIsCalculating(true)

    try {
      const waypoints = nearbyShops.map(shop => ({
        location: { lat: shop.latitude, lng: shop.longitude },
        stopover: true
      }))

      const request = {
        origin: { lat: sourceShop.latitude, lng: sourceShop.longitude },
        destination: { lat: sourceShop.latitude, lng: sourceShop.longitude },
        waypoints,
        optimizeWaypoints: true,
        travelMode: transportMode,
      }

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === 'OK') resolve(result)
          else reject(new Error(`Directions failed: ${status}`))
        })
      })
  

      directionsRenderer.setDirections(result)
    
      // Calculate total duration from Google's response
      let totalDuration = 0
      const allSteps: RouteStep[] = []
      
      result.routes[0].legs.forEach(leg => {
        // Add the duration value from Google
        totalDuration += leg.duration!.value // this is in seconds
        
        leg.steps.forEach(step => {
          allSteps.push({
            instructions: step.instructions,
            distance: step.distance!.text,
            duration: step.duration!.text,
            maneuver: step.maneuver,
            start_location: step.start_location
          })
        })
      })
  
      // Get current time
      const now = new Date()
      
      // Calculate arrival time using Google's duration estimate
      const arrivalTime = new Date(now.getTime() + (totalDuration * 1000)) // Convert seconds to milliseconds
      
      // Format the times
      setEstimatedArrival(format(arrivalTime, 'h:mm a'))
      
      // Use Google's duration for time remaining
      const hours = Math.floor(totalDuration / 3600)
      const minutes = Math.floor((totalDuration % 3600) / 60)
      setTimeRemaining(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
  
      setRouteSteps(allSteps)
      onRouteCalculated?.(nearbyShops)
  

    } catch (error) {
      console.error('Route calculation error:', error)
      toast({
        title: "Error",
        description: "Failed to calculate route.",
        variant: "destructive"
      })
    } finally {
      setIsCalculating(false)
    }
  }, [directionsService, directionsRenderer, sourceShop, nearbyShops, transportMode])

  const handleManualMove = useCallback(async (newStep: number) => {
    if (newStep >= 0 && newStep < nearbyShops.length) {
      setCurrentStep(newStep)
      setIsAtDestination(false)

      // Update map view
      if (map && routeSteps[newStep]) {
        const targetLocation = nearbyShops[newStep]
        const targetLatLng = new google.maps.LatLng(
          targetLocation.latitude,
          targetLocation.longitude
        )
        
        map.panTo(targetLatLng)
        map.setZoom(16)

        // Update current marker if exists
        if (currentMarker) {
          currentMarker.setPosition(targetLatLng)
        }
      }
    }
  }, [map, nearbyShops, routeSteps, currentMarker])

  const handleLocationUpdate = useCallback(async (updatedLocation) => {
    try {
      const response = await fetch(`/api/coffee-shops/${updatedLocation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLocation)
      })

      if (!response.ok) throw new Error('Failed to update location')

      // Update local state
      const updatedShops = nearbyShops.map(shop =>
        shop.id === updatedLocation.id ? updatedLocation : shop
      )
      onRouteCalculated(updatedShops)

      toast({
        title: "Success",
        description: "Location information updated successfully."
      })
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: "Failed to update location information.",
        variant: "destructive"
      })
      throw error
    }
  }, [nearbyShops, onRouteCalculated])

  const handleLocationVisited = useCallback(async (location) => {
    try {
      const response = await fetch(`/api/coffee-shops/${location.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visited: true })
      })

      if (!response.ok) throw new Error('Failed to update location')

      setCurrentStep(prev => prev + 1)
      setIsAtDestination(false)

      toast({
        title: "Location Updated",
        description: "Location marked as visited.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive"
      })
    }
  }, [])

  const generateGoogleMapsUrl = useCallback(() => {
    if (!nearbyShops.length) return null;

    let url = 'https://www.google.com/maps/dir/?api=1'
    url += `&origin=${sourceShop.latitude},${sourceShop.longitude}`
    url += `&destination=${sourceShop.latitude},${sourceShop.longitude}`

    const waypoints = nearbyShops
      .map(shop => `${shop.latitude},${shop.longitude}`)
      .join('|')
    
    url += `&waypoints=${waypoints}`
    url += `&travelmode=${transportMode.toLowerCase()}`

    window.open(url, '_blank')
  }, [sourceShop, nearbyShops, transportMode])

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Map and Controls */}
      <div className="md:col-span-2 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <RadioGroup
              defaultValue={transportMode}
              onValueChange={(value) => setTransportMode(value as 'DRIVING' | 'WALKING')}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DRIVING" id="driving" />
                <Label htmlFor="driving" className="flex items-center gap-2">
                  <Car className="h-4 w-4" /> Driving
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WALKING" id="walking" />
                <Label htmlFor="walking" className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" /> Walking
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2">
              {!navigationMode ? (
                <>
                  <Button 
                    onClick={calculateRoute} 
                    disabled={isCalculating}
                  >
                    {isCalculating ? "Calculating..." : "Calculate Route"}
                  </Button>
                  {routeSteps.length > 0 && (
                    <>
                      <Button 
                        onClick={() => {
                          setNavigationMode(true)
                          setCurrentStep(0)
                        }}
                        variant="secondary"
                      >
                        Start Navigation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={generateGoogleMapsUrl}
                      >
                        Open in Google Maps
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Button 
                  onClick={() => {
                    setNavigationMode(false)
                    setCurrentStep(0)
                    setIsAtDestination(false)
                  }} 
                  variant="outline"
                >
                  Exit Navigation
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div
          id="route-map"
          className="h-[700px] w-full rounded-lg border bg-muted"
        />
      </div>

      {/* Navigation Panel */}
      <div className="md:col-span-1">
        {navigationMode ? (
          <NavigationPanel
            currentLocation={nearbyShops[currentStep]}
            nextLocation={nearbyShops[currentStep + 1]}
            currentStep={currentStep}
            totalSteps={nearbyShops.length}
            routeSteps={routeSteps}
            transportMode={transportMode}
            onStepChange={handleManualMove}
            onLocationUpdate={handleLocationUpdate}
            onLocationVisited={handleLocationVisited}
            onLocationSkipped={() => {
              setCurrentStep(prev => prev + 1)
              setIsAtDestination(false)
            }}
            onExitNavigation={() => {
              setNavigationMode(false)
              setCurrentStep(0)
              setIsAtDestination(false)
            }}
            onManualMove={handleManualMove}
            isAtDestination={isAtDestination}
            arrivalTime={estimatedArrival}
            timeRemaining={timeRemaining}
          />
        ) : (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Visit Order</h3>
                  <span className="text-sm text-muted-foreground">
                    {nearbyShops.length} locations
                  </span>
                </div>

                {/* Source Location */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">S</span>
                  </div>
                  <div>
                    <p className="font-medium">{sourceShop.title}</p>
                    <p className="text-sm text-muted-foreground">Starting Point</p>
                  </div>
                </div>

                {/* Destination List */}
                <div className="space-y-2">
                  {nearbyShops.map((shop, index) => (
                    <div
                      key={shop.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{shop.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {shop.address}
                        </p>
                      </div>
                      {shop.visited && (
                        <Badge variant="success" className="flex-shrink-0">
                          Visited
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Destination Reached Modal */}
      <DestinationReached
        show={isAtDestination}
        location={nearbyShops[currentStep]}
        onMarkVisited={() => handleLocationVisited(nearbyShops[currentStep])}
        onSkip={() => {
          setCurrentStep(prev => prev + 1)
          setIsAtDestination(false)
        }}
        arrivalTime={estimatedArrival}
      />
    </div>
  )
}________________________________________________________________________________
