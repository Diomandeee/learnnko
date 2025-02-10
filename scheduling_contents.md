### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/routes/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-[2000px] mx-auto p-4 md:px-6 md:py-6">
    {children}
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/routes/page.tsx
"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouteStore } from "@/store/route-store";
import { LocationSelector } from "@/components/routes/controls/location-selector";
import {
 Map,
 FileSpreadsheet,
 Calendar,
 Share2,
 Settings,
 Navigation,
 MapPin,
 LocateFixed,
 Trash2,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { DeliverySchedule } from "@/components/routes/delivery/delivery-schedule";
import { useCoffeeShops } from "@/hooks/use-coffee-shops";
// Dynamically import components with proper typing
const RouteMap = dynamic(
 () => import("@/components/routes/map/route-map").then(mod => ({ 
   default: mod.RouteMap 
 })),
 {
   ssr: false,
   loading: () => (
     <Card className="h-[2000ox]">
       <span className="text-muted-foreground">Loading map...</span>
     </Card>
   ),
 }
);

const RouteControls = dynamic(
 () => import("@/components/routes/controls/route-controls").then(mod => ({
   default: mod.RouteControls
 })),
 { ssr: false }
);

const RouteList = dynamic(
 () => import("@/components/routes/list/route-list").then(mod => ({
   default: mod.RouteList
 })),
 { ssr: false }
);

export default function RoutesPage() {
 const [isExporting, setIsExporting] = useState(false);
 const [isLocating, setIsLocating] = useState(false);
 const { shops, loading } = useCoffeeShops();

 const { 
   clearRoute, 
   exportToCalendar, 
   shareRoute, 
   openInGoogleMaps,
   updateCurrentLocation,
   currentLocation,
   currentRoute 
 } = useRouteStore();
 const { toast } = useToast();

 const handleExport = useCallback(async () => {
   setIsExporting(true);
   try {
     // Export implementation here
     setIsExporting(false);
     toast({
       title: "Route Exported",
       description: "Your route has been exported successfully."
     });
   } catch (error) {
     toast({
       title: "Export Failed",
       description: "Failed to export route. Please try again.",
       variant: "destructive"
     });
     setIsExporting(false);
   }
 }, [toast]);

 const handleLocateMe = useCallback(async () => {
   setIsLocating(true);
   try {
     const position = await new Promise<GeolocationPosition>((resolve, reject) => {
       navigator.geolocation.getCurrentPosition(resolve, reject);
     });
     
     updateCurrentLocation({
       lat: position.coords.latitude,
       lng: position.coords.longitude
     });

     toast({
       title: "Location Updated",
       description: "Your current location has been updated."
     });
   } catch (error) {
     toast({
       title: "Location Error",
       description: "Failed to get your current location. Please check your permissions.",
       variant: "destructive"
     });
   } finally {
     setIsLocating(false);
   }
 }, [updateCurrentLocation, toast]);

 return (
   <PageContainer>
     <div className="flex flex-col gap-6 p-6"> 
       {/* Header */}
       <div className="flex flex-col gap-4">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">Route Planning</h1>
           <p className="text-muted-foreground">
             Plan and optimize your coffee shop visits
           </p>
         </div>
         <div className="flex flex-wrap items-center gap-2">
           <Button 
             variant="outline" 
             onClick={handleLocateMe} 
             disabled={isLocating}
             className="min-w-[140px]"
           >
             <LocateFixed className="mr-2 h-4 w-4" />
             {isLocating ? "Locating..." : "Locate Me"}
           </Button>

           <Button 
             variant="outline" 
             onClick={() => openInGoogleMaps()}
             disabled={currentRoute.length === 0}
             className="min-w-[140px]"
           >
             <Navigation className="mr-2 h-4 w-4" />
             Open in Maps
           </Button>

           <Button 
             variant="outline" 
             onClick={handleExport} 
             disabled={isExporting}
           >
             <FileSpreadsheet className="mr-2 h-4 w-4" />
             Export Route
           </Button>

           <Button 
             variant="outline" 
             onClick={shareRoute}
             disabled={currentRoute.length === 0}
           >
             <Share2 className="mr-2 h-4 w-4" />
             Share Route
           </Button>

           <Button 
             variant="destructive" 
             onClick={clearRoute}
             disabled={currentRoute.length === 0}
           >
             <Trash2 className="mr-2 h-4 w-4" />
             Clear Route
           </Button>
         </div>
       </div>

       {/* Current Location Indicator */}
       {currentLocation && (
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <MapPin className="h-4 w-4" />
           <span>
             Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
           </span>
         </div>
       )}

       {/* Main Content */}
       <div className="grid grid-cols-12 gap-6">
         {/* Left Column: Location Selector */}
         <div className="col-span-12 lg:col-span-3 space-y-6">
           <LocationSelector />
           <DeliverySchedule shops={shops || []} />
         </div>

         {/* Center Column: Map and Route List */}
         <div className="col-span-12 lg:col-span-6 space-y-6">
           {/* Map */}
           <RouteMap />

           {/* Route List */}
           <RouteList />
         </div>

         {/* Right Column: Route Controls */}
         <div className="col-span-12 lg:col-span-3">
           <RouteControls />
         </div>
       </div>
     </div>
   </PageContainer>
 );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/shared/route-metrics.tsx
// src/components/routes/shared/route-metrics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouteStore } from "@/store/route-store";
import { Clock, MapPin, Navigation } from "lucide-react";

export function RouteMetrics() {
  const { metrics, settings } = useRouteStore();

  if (!metrics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">
              {metrics.totalDistance.toFixed(1)} km
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold">
              {Math.round(metrics.totalDuration)} min
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Stops</p>
            <p className="text-2xl font-bold">{metrics.numberOfStops}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Arrival</p>
            <p className="text-2xl font-bold">{metrics.estimatedArrival}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            <span>{settings.transportMode.toLowerCase()}</span>
          </div>
          {settings.avoidHighways && (
            <span>Avoiding highways</span>
          )}
          {settings.avoidTolls && (
            <span>Avoiding tolls</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/visit/visit-form.tsx
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { useVisitStore } from "@/store/use-visit"
import { VisitFormData } from "@/types/visit"

const visitFormSchema = z.object({
  date: z.date(),
  managerPresent: z.boolean(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  samplesDropped: z.boolean(),
  sampleDetails: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.date().optional(),
  photos: z.array(z.instanceof(File)).optional(),
})

interface VisitFormProps {
  shopId: string;
  onComplete: () => void;
}

export function VisitForm({ shopId, onComplete }: VisitFormProps) {
  const [loading, setLoading] = useState(false)
  const { addVisit } = useVisitStore()

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      date: new Date(),
      managerPresent: false,
      samplesDropped: false,
    },
  })

  async function onSubmit(data: VisitFormData) {
    setLoading(true)
    try {
      await addVisit(shopId, data)
      onComplete()
    } catch (error) {
      console.error("Failed to save visit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="managerPresent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Manager Present</FormLabel>
                <FormDescription>
                  Was the manager present during the visit?
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

        {form.watch("managerPresent") && (
          <>
            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Contact</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="samplesDropped"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Samples Dropped</FormLabel>
                <FormDescription>
                  Did you leave any samples during this visit?
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

        {form.watch("samplesDropped") && (
          <FormField
            control={form.control}
            name="sampleDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Details</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="List the samples provided..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add any notes about the visit..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    field.onChange(files)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextVisitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date <= new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onComplete}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Visit"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/visit/visit-history.tsx
"use client"

import { formatDistanceToNow as formatDistance } from "date-fns"
import { Visit } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VisitHistoryProps {
  visits: Visit[]
}

export function VisitHistory({ visits }: VisitHistoryProps) {
  if (!visits.length) {
    return <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="flex flex-col space-y-2 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Visit #{visit.visitNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(new Date(visit.date), new Date(), { addSuffix: true })}
              </p>
            </div>

            {visit.managerPresent && (
              <p className="text-sm">
                Manager present: {visit.managerName || "Yes"}
              </p>
            )}

            {visit.samplesDropped && (
              <p className="text-sm">
                Samples: {visit.sampleDetails || "Dropped off"}
              </p>
            )}

            {visit.notes && (
              <p className="text-sm text-muted-foreground">{visit.notes}</p>
            )}

            {visit.nextVisitDate && (
              <p className="text-xs text-muted-foreground">
                Next visit planned: {formatDistance(new Date(visit.nextVisitDate), new Date(), { addSuffix: true })}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/visit/visit-management.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitForm } from "./visit-form"
import { VisitHistory } from "./visit-history"
import { useShopVisits } from "@/hooks/use-shop-visits"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CoffeeShop } from "@prisma/client"

interface VisitManagementProps {
  shop: CoffeeShop | null;
}

export function VisitManagement({ shop }: VisitManagementProps) {
  const { visits, loading, error, mutate } = useShopVisits(shop?.id || null)
  const [showForm, setShowForm] = useState(false)

  if (!shop) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a coffee shop to view visit history
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading visits...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading visits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading the visit history.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Visit History - {shop.title}</CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Visit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showForm ? (
          <VisitForm 
            shopId={shop.id} 
            onComplete={() => {
              setShowForm(false)
              mutate() // Refresh visits list
            }} 
          />
        ) : (
          <VisitHistory visits={visits || []} />
        )}
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/visit/visit-scheduler.tsx
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/controls/location-selector.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouteStore } from "@/store/route-store";
import { useCoffeeShops } from "@/hooks/use-coffee-shops";
import {
  Search,
  MapPin,
  DollarSign,
  Building2,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LocationSelector() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [showVisited, setShowVisited] = useState("all");
  const { shops, loading } = useCoffeeShops();
  const { addLocation, addLocations, selectedLocations } = useRouteStore();

  // Filter for partner shops
  const partnerShops = shops?.filter(shop => shop.isPartner) || [];

  const filteredShops = shops?.filter(shop => {
    const matchesSearch = shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = selectedArea === "all" || shop.area === selectedArea;
    
    const matchesVisited = showVisited === "all" ||
      (showVisited === "visited" && shop.visited) ||
      (showVisited === "not_visited" && !shop.visited);

    const isNotSelected = !selectedLocations.find(loc => loc.id === shop.id);

    return matchesSearch && matchesArea && matchesVisited && isNotSelected;
  }) || [];

  const areas = shops ? [...new Set(shops.map(shop => shop.area).filter(Boolean))] : [];

  const handleAddAllPartners = () => {
    // Filter out partners that are already selected
    const newPartners = partnerShops.filter(
      partner => !selectedLocations.find(loc => loc.id === partner.id)
    );
    addLocations(newPartners);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Loading locations...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Add Locations</CardTitle>
          {partnerShops.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={handleAddAllPartners}
              className="whitespace-nowrap"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Add Partners ({partnerShops.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select locations to add to your route
          </p>
        </div>
          
          {/* Search and filter */}
            
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={showVisited}
              onValueChange={setShowVisited}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Visit status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="visited">Visited Only</SelectItem>
                <SelectItem value="not_visited">Not Visited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredShops.map(shop => (
              <div
                key={shop.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-medium truncate">{shop.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {shop.address}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shop.volume && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{shop.volume}</span>
                      </div>
                    )}
                    {shop.visited && (
                      <Badge variant="success" className="text-xs">
                        Visited
                      </Badge>
                    )}
                    {shop.parlor_coffee_leads && (
                      <Badge variant="warning" className="text-xs">
                        Lead
                      </Badge>
                    )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addLocation(shop)}
                >
                  Add
                </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredShops.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No locations found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/controls/navigation-controller.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouteStore } from "@/store/route-store"
import { useToast } from "@/components/ui/use-toast"
import {
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Navigation,
  Check,
} from "lucide-react"

export function NavigationController() {
  const {
    currentRoute,
    isNavigating,
    currentStep,
    startNavigation,
    stopNavigation,
    nextStep,
    previousStep,
  } = useRouteStore()
  const { toast } = useToast()

  const currentLocation = currentRoute[currentStep]

  const handleStartNavigation = () => {
    if (currentRoute.length === 0) {
      toast({
        title: "No route selected",
        description: "Please create a route first.",
        variant: "destructive"
      })
      return
    }
    startNavigation()
  }

  if (!isNavigating) {
    return (
      <Button 
        className="w-full" 
        onClick={handleStartNavigation}
      >
        <Play className="mr-2 h-4 w-4" />
        Start Navigation
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Navigation</CardTitle>
          <Badge variant="secondary">
            Stop {currentStep + 1} of {currentRoute.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{currentLocation?.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentLocation?.address}
          </p>
          {currentLocation?.volume && (
            <p className="text-sm">
              Volume: {currentLocation.volume} | ARR: ${((parseFloat(currentLocation.volume) * 52) * 18).toLocaleString()}
            </p>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={nextStep}
            disabled={currentStep === currentRoute.length - 1}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="secondary"
            onClick={() => {
              // Mark current location as visited
              // Update visit status
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark Visited
          </Button>
          <Button 
            variant="destructive"
            onClick={stopNavigation}
          >
            <X className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/controls/route-controls.tsx
// src/components/routes/controls/route-controls.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useRouteStore } from "@/store/route-store";
import { Settings2, Navigation, Car } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RouteControls() {
  const {
    settings,
    updateSettings,
    optimizeRoute,
    isOptimizing,
  } = useRouteStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Max Stops */}
        <div className="space-y-2">
          <Label>Maximum Stops</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[settings.maxStops]}
              onValueChange={(value) => updateSettings({ maxStops: value[0] })}
              min={5}
              max={50}
              step={5}
              className="flex-1"
            />
            <span className="min-w-[4ch] text-right">{settings.maxStops}</span>
          </div>
        </div>

        {/* Max Distance */}
        <div className="space-y-2">
          <Label>Maximum Distance (km)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[settings.maxDistance]}
              onValueChange={(value) => updateSettings({ maxDistance: value[0] })}
              min={1}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="min-w-[4ch] text-right">{settings.maxDistance}km</span>
          </div>
        </div>

        {/* Transport Mode */}
        <div className="space-y-2">
          <Label>Transport Mode</Label>
          <Select
            value={settings.transportMode}
            onValueChange={(value) => updateSettings({ transportMode: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRIVING">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>Driving</span>
                </div>
              </SelectItem>
              <SelectItem value="WALKING">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span>Walking</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Route Optimization */}
        <div className="space-y-2">
          <Label>Optimize By</Label>
          <Select
            value={settings.optimizeBy}
            onValueChange={(value) => updateSettings({ optimizeBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="volume">Volume Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-highways">Avoid Highways</Label>
            <Switch
              id="avoid-highways"
              checked={settings.avoidHighways}
              onCheckedChange={(checked) => 
                updateSettings({ avoidHighways: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-tolls">Avoid Tolls</Label>
            <Switch
              id="avoid-tolls"
              checked={settings.avoidTolls}
              onCheckedChange={(checked) => 
                updateSettings({ avoidTolls: checked })
              }
            />
          </div>
        </div>

        {/* Optimize Button */}
        <Button 
          className="w-full" 
          onClick={() => optimizeRoute()}
          disabled={isOptimizing}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          {isOptimizing ? "Optimizing..." : "Optimize Route"}
        </Button>
      </CardContent>
    </Card>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/location-action-dialog.tsx
"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { RouteGenerationDialog } from "./route-generation-dialog"

interface LocationActionDialogProps {
  shop: CoffeeShop
  onGenerateRoute: (shop: CoffeeShop) => void
  onVisitRecorded: () => void
}

export function LocationActionDialog({
  shop,
  onGenerateRoute,
  onVisitRecorded,
}: LocationActionDialogProps) {
  const { toast } = useToast()
  const [managerPresent, setManagerPresent] = useState(false)
  const [staffSize, setStaffSize] = useState("")
  const [showRouteDialog, setShowRouteDialog] = useState(false)

  const handleVisitRecord = async () => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managerPresent,
          staffSize: parseInt(staffSize),
          date: new Date(),
        }),
      })

      if (!response.ok) throw new Error("Failed to record visit")

      toast({
        title: "Visit Recorded",
        description: "The visit has been successfully recorded.",
      })
      onVisitRecorded()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record visit. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shop.title}</DialogTitle>
          <DialogDescription>
            {shop.address}
            <div className="flex gap-2 mt-2">
              {shop.visited && <Badge variant="success">Visited</Badge>}
              {shop.is_source && <Badge variant="default">Source Location</Badge>}
              {shop.parlor_coffee_leads && <Badge variant="warning">Lead</Badge>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Manager Present</Label>
            <Switch
              checked={managerPresent}
              onCheckedChange={setManagerPresent}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-2">Estimated Staff Size</Label>
            <Input
              type="number"
              value={staffSize}
              onChange={(e) => setStaffSize(e.target.value)}
              className="col-span-2"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => setShowRouteDialog(true)}
            className="w-full"
          >
            Generate Route from Here
          </Button>
          <Button
            type="submit"
            onClick={handleVisitRecord}
            className="w-full"
            variant={shop.visited ? "outline" : "default"}
          >
            {shop.visited ? "Update Visit" : "Mark as Visited"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <RouteGenerationDialog
        open={showRouteDialog}
        onOpenChange={setShowRouteDialog}
        startingPoint={shop}
        onGenerate={onGenerateRoute}
      />
    </Dialog>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/map-preview.tsx
"use client"

import { useEffect, useState } from "react"
import { CoffeeShop } from "@prisma/client"
import { MapContainer, TileLayer, Circle, Marker } from "react-leaflet"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapPreviewProps {
  startingPoint: CoffeeShop
  maxDistance: number
  className?: string
}

export function MapPreview({
  startingPoint,
  maxDistance,
  className
}: MapPreviewProps) {
  return (
    <div className={className}>
      <MapContainer
        center={[startingPoint.latitude, startingPoint.longitude]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[startingPoint.latitude, startingPoint.longitude]}
        />
        <Circle
          center={[startingPoint.latitude, startingPoint.longitude]}
          radius={maxDistance * 1000}
          pathOptions={{ fillColor: "blue", fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/map.tsx
"use client"

import { useEffect, useRef } from "react"
import { useMapStore } from "@/store/use-map"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { ShopMarker } from "./shop-marker"
import { RouteLayer } from "./route-layer"
import { useShops } from "@/hooks/use-shops"

export function Map() {
  const mapRef = useRef(null)
  const { shops = [], loading } = useShops()
  const { center, zoom, selectedShop, setSelectedShop } = useMapStore()

  if (loading) {
    return <div>Loading map...</div>
  }

  return (
    <div className="h-[800px] rounded-lg border">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {shops?.map((shop) => (
          <ShopMarker
            key={shop.id}
            shop={shop}
            selected={selectedShop?.id === shop.id}
            onSelect={setSelectedShop}
          />
        ))}

        <RouteLayer />
      </MapContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-controls.tsx
"use client"

import { useState } from "react"
import { useRouteStore } from "@/store/use-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useShops } from "@/hooks/use-shops"

export function RouteControls() {
  const [loading, setLoading] = useState(false)
  const { generateRoute, clearRoute, settings, updateSettings } = useRouteStore()
  const { shops, loading: shopsLoading } = useShops()

  // Filter source shops (either is_source=true or visited=true)
  const sourceShops = shops?.filter(shop => shop.is_source || shop.visited) || []

  const handleGenerateRoute = async () => {
    setLoading(true)
    await generateRoute()
    setLoading(false)
  }

  if (shopsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route Settings</CardTitle>
        </CardHeader>
        <CardContent>
          Loading source shops...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label>Starting Point</label>
          <Select
            value={settings.startingPoint}
            onValueChange={(value) => updateSettings({ startingPoint: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a starting point" />
            </SelectTrigger>
            <SelectContent>
              {sourceShops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.title}
                  {shop.is_source && " (Partner)"}
                  {shop.visited && !shop.is_source && " (Visited)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select a partner shop or previously visited location
          </p>
        </div>

        <div className="space-y-2">
          <label>Max Stops</label>
          <Input
            type="number"
            value={settings.maxStops}
            onChange={(e) => updateSettings({ maxStops: parseInt(e.target.value) })}
            min={1}
            max={20}
          />
          <p className="text-sm text-muted-foreground">
            Maximum number of stops in the route
          </p>
        </div>

        <div className="space-y-2">
          <label>Max Distance (km)</label>
          <Slider
            value={[settings.maxDistance]}
            onValueChange={(value) => updateSettings({ maxDistance: value[0] })}
            min={1}
            max={10}
            step={0.5}
          />
          <p className="text-sm text-muted-foreground">
            Maximum distance between stops
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleGenerateRoute} 
            className="w-full"
            disabled={loading || !settings.startingPoint}
          >
            {loading ? "Generating..." : "Generate Route"}
          </Button>
          <Button 
            onClick={clearRoute}
            variant="outline" 
            className="w-full"
          >
            Clear Route
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-generation-dialog.tsx
"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPreview } from "./map-preview"

interface RouteGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  startingPoint: CoffeeShop
  onGenerate: (shop: CoffeeShop) => void
}

export function RouteGenerationDialog({
  open,
  onOpenChange,
  startingPoint,
  onGenerate,
}: RouteGenerationDialogProps) {
  const [maxStops, setMaxStops] = useState(5)
  const [maxDistance, setMaxDistance] = useState(2)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/routes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startingPoint: startingPoint.id,
          maxStops,
          maxDistance,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate route")

      const route = await response.json()
      onGenerate(route)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to generate route:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Route</DialogTitle>
          <DialogDescription>
            Generate a route starting from {startingPoint.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Maximum Stops</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxStops]}
                onValueChange={(value) => setMaxStops(value[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-center">{maxStops}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Distance (km)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxDistance]}
                onValueChange={(value) => setMaxDistance(value[0])}
                min={0.5}
                max={5}
                step={0.5}
                className="flex-1"
              />
              <span className="w-12 text-center">{maxDistance}</span>
            </div>
          </div>

          <MapPreview
            startingPoint={startingPoint}
            maxDistance={maxDistance}
            className="h-[200px] rounded-lg border"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-layer.tsx
"use client"

import { Polyline } from "react-leaflet"
import { CoffeeShop } from "@prisma/client"

interface RouteLayerProps {
  route?: CoffeeShop[]
  color?: string
}

export function RouteLayer({ route, color = "#3B82F6" }: RouteLayerProps) {
  if (!route || route.length < 2) return null

  const positions = route.map(shop => [shop.latitude, shop.longitude])

  return (
    <Polyline
      positions={positions as [number, number][]}
      pathOptions={{
        color,
        weight: 3,
        opacity: 0.7,
      }}
    />
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-map.tsx

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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/shop-marker.tsx
"use client"

import { useState } from "react"
import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { CoffeeShop } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouteStore } from "@/store/use-route"
import "leaflet/dist/leaflet.css"

interface ShopMarkerProps {
  shop: CoffeeShop
  selected?: boolean
  onSelect?: (shop: CoffeeShop) => void
}

export function ShopMarker({ shop, selected, onSelect }: ShopMarkerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [visitDialogOpen, setVisitDialogOpen] = useState(false)
  const [managerPresent, setManagerPresent] = useState(false)
  const [managerName, setManagerName] = useState("")
  const [samplesDropped, setSamplesDropped] = useState(false)
  const [sampleDetails, setSampleDetails] = useState("")
  const [notes, setNotes] = useState("")
  const { updateSettings, generateRoute } = useRouteStore()

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="
        w-8 h-8 rounded-full flex items-center justify-center text-white
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${shop.visited ? 'bg-green-500' : shop.is_source ? 'bg-red-500' : 'bg-blue-500'}
        ${shop.parlor_coffee_leads ? 'border-2 border-yellow-400' : ''}
      ">
        ${shop.visited ? '✓' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

  const handleMarkVisited = async () => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date(),
          managerPresent,
          managerName: managerName || undefined,
          samplesDropped,
          sampleDetails: sampleDetails || undefined,
          notes: notes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to record visit')

      toast({
        title: "Visit recorded",
        description: "The shop has been marked as visited",
      })

      setVisitDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record visit",
        variant: "destructive",
      })
    }
  }

  const handleGenerateRoute = async () => {
    try {
      await updateSettings({ startingPoint: shop.id })
      await generateRoute()
      toast({
        title: "Route generated",
        description: `Route generated from ${shop.title}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate route",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Marker
        position={[shop.latitude, shop.longitude]}
        icon={customIcon}
        eventHandlers={{
          click: () => onSelect?.(shop),
        }}
      >
        <Popup>
          <div className="min-w-[200px] space-y-4">
            <div>
              <h3 className="font-bold mb-1">{shop.title}</h3>
              <p className="text-sm mb-1">{shop.address}</p>
              {shop.rating && (
                <p className="text-sm mb-1">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              )}
              {shop.visited && (
                <p className="text-sm text-green-600">✓ Visited</p>
              )}
              {shop.parlor_coffee_leads && (
                <p className="text-sm text-yellow-600">🎯 Lead</p>
              )}
              {shop.is_source && (
                <p className="text-sm text-red-600">📍 Source Location</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleGenerateRoute}
                className="w-full"
              >
                Generate Route From Here
              </Button>
              
              {!shop.visited && (
                <Button 
                  onClick={() => setVisitDialogOpen(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Mark as Visited
                </Button>
              )}

              {shop.website && (
                <Button 
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Popup>
      </Marker>

      <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Visit - {shop.title}</DialogTitle>
            <DialogDescription>
              Record details about your visit to this coffee shop
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="manager-present">Manager Present</Label>
              <Switch
                id="manager-present"
                checked={managerPresent}
                onCheckedChange={setManagerPresent}
              />
            </div>

            {managerPresent && (
              <div className="space-y-2">
                <Label htmlFor="manager-name">Manager's Name</Label>
                <Input
                  id="manager-name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Enter manager's name"
                />
              </div>
            )}

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="samples-dropped">Samples Dropped</Label>
              <Switch
                id="samples-dropped"
                checked={samplesDropped}
                onCheckedChange={setSamplesDropped}
              />
            </div>

            {samplesDropped && (
              <div className="space-y-2">
                <Label htmlFor="sample-details">Sample Details</Label>
                <Input
                  id="sample-details"
                  value={sampleDetails}
                  onChange={(e) => setSampleDetails(e.target.value)}
                  placeholder="Enter sample details"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the visit"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkVisited}>
              Record Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/list/route-list.tsx
// src/components/routes/list/route-list.tsx
"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouteStore } from "@/store/route-store";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  GripVertical,
  MapPin,
  Building2,
  Users,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";

export function RouteList() {
  const {
    currentRoute,
    updateRoute,
    removeLocation,
    isNavigating,
    currentStep,
  } = useRouteStore();

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(currentRoute);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateRoute(items);
  }, [currentRoute, updateRoute]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route Stops</CardTitle>
          <Badge variant="secondary">
            {currentRoute.length} stops
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="route-stops">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {currentRoute.map((location, index) => (
                    <Draggable
                      key={location.id}
                      draggableId={location.id}
                      index={index}
                      isDragDisabled={isNavigating}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 rounded-lg border ${
                            snapshot.isDragging ? "border-primary" : "border-border"
                          } ${
                            isNavigating && index === currentStep 
                              ? "bg-primary/10 border-primary" 
                              : "bg-background"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-1.5 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {location.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {location.address}
                                  </p>
                                </div>
                              </div>

                              {!isNavigating && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 float-right"
                                  onClick={() => removeLocation(location.id)}
                                >
                                  <ArrowUpDown className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/delivery/delivery-schedule.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWeeklyDeliveries } from "@/hooks/use-weekly-deliveries"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Truck,
  Package,
  AlertCircle,
  Clock,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouteStore } from "@/store/route-store"

interface DeliveryScheduleProps {
  shops: any[]
}

export function DeliverySchedule({ shops }: DeliveryScheduleProps) {
  const { toast } = useToast()
  const { 
    currentWeek,
    weeklyDeliveries,
    totalVolume,
    changeWeek,
    error
  } = useWeeklyDeliveries(shops)

  const { addLocations, clearRoute } = useRouteStore()

  const generateDeliveryRoute = () => {
    if (weeklyDeliveries.length === 0) {
      toast({
        title: "No deliveries",
        description: "There are no deliveries scheduled for this week",
        variant: "destructive"
      })
      return
    }
    
    clearRoute()
    const shopsForDelivery = weeklyDeliveries.map(delivery => delivery.shop)
    addLocations(shopsForDelivery)

    toast({
      title: "Route Generated",
      description: `Created route for ${shopsForDelivery.length} deliveries`
    })
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Week {currentWeek} Deliveries</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeWeek(currentWeek - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="secondary">
                  Week {currentWeek}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeWeek(currentWeek + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={generateDeliveryRoute}
              disabled={weeklyDeliveries.length === 0}
              className="w-full"
            >
              <Truck className="mr-2 h-4 w-4" />
              Generate Route for Week {currentWeek}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
       

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {weeklyDeliveries.map(({ shop, volume }) => (
                  <div
                    key={shop.id}
                    className="p-3 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{shop.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {shop.address}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="gap-1">
                            <Package className="h-3 w-3" />
                            {volume} units
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {shop.delivery_frequency?.toLowerCase() || 'weekly'}
                          </Badge>
                          <Badge variant="outline">
                            First: Week {shop.first_delivery_week}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {weeklyDeliveries.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No deliveries scheduled for this week
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Weekly Volume:</span>
              <span className="text-xl font-bold">{totalVolume.toFixed(1)} units</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Average Per Partner:</span>
              <span>
                {weeklyDeliveries.length > 0 
                  ? (totalVolume / weeklyDeliveries.length).toFixed(1) 
                  : 0} units
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Partners This Week:</span>
              <span>{weeklyDeliveries.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/leads-analytics.tsx
"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"
import { CoffeeShop } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LeadsAnalytics() {
  const { shops, loading } = useShops()
  const [leads, setLeads] = useState<CoffeeShop[]>([])

  useEffect(() => {
    if (shops) {
      const leadShops = shops
        .filter(shop => shop.parlor_coffee_leads)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      setLeads(leadShops)
    }
  }, [shops])

  if (loading) {
    return <div>Loading leads...</div>
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {leads.map((shop) => (
          <div key={shop.id} className="flex items-start space-x-4">
            <Badge variant={shop.visited ? "success" : "default"}>
              {shop.visited ? "Visited" : "New Lead"}
            </Badge>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{shop.title}</p>
              <p className="text-sm text-muted-foreground">{shop.area}</p>
              {shop.rating && (
                <p className="text-xs">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground">No leads generated yet</p>
        )}
      </div>
    </ScrollArea>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/route-analytics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitStats } from "./visit-stats"
import { VisitChart } from "./visit-chart"
import { LeadsAnalytics } from "./leads-analytics"

export function RouteAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Visit Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitStats />
          <VisitChart />
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsAnalytics />
        </CardContent>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/visit-chart.tsx
"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useShops } from "@/hooks/use-shops"

interface VisitData {
  area: string
  totalShops: number
  visitedShops: number
  leads: number
}

export function VisitChart() {
  const { shops, loading } = useShops()
  const [data, setData] = useState<VisitData[]>([])

  useEffect(() => {
    if (shops && shops.length > 0) {
      // Group shops by area
      const areaData = shops.reduce((acc, shop) => {
        const area = shop.area || 'Unknown'
        if (!acc[area]) {
          acc[area] = {
            area,
            totalShops: 0,
            visitedShops: 0,
            leads: 0
          }
        }
        
        acc[area].totalShops++
        if (shop.visited) acc[area].visitedShops++
        if (shop.parlor_coffee_leads) acc[area].leads++
        
        return acc
      }, {} as Record<string, VisitData>)

      setData(Object.values(areaData))
    }
  }, [shops])

  if (loading) {
    return <div>Loading chart...</div>
  }

  return (
    <div className="h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalShops" name="Total Shops" fill="#94a3b8" />
          <Bar dataKey="visitedShops" name="Visited" fill="#22c55e" />
          <Bar dataKey="leads" name="Leads" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/visit-stats.tsx
"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"

interface VisitStats {
  totalVisits: number
  totalShops: number
  visitedShops: number
  visitRate: number
  leadsGenerated: number
  conversionRate: number
}

export function VisitStats() {
  const { shops, loading } = useShops()
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    totalShops: 0,
    visitedShops: 0,
    visitRate: 0,
    leadsGenerated: 0,
    conversionRate: 0
  })

  useEffect(() => {
    if (shops && shops.length > 0) {
      const visitedShops = shops.filter(shop => shop.visited).length
      const leadsGenerated = shops.filter(shop => shop.parlor_coffee_leads).length

      setStats({
        totalVisits: 0, // This would come from Visit records
        totalShops: shops.length,
        visitedShops,
        visitRate: (visitedShops / shops.length) * 100,
        leadsGenerated,
        conversionRate: (leadsGenerated / visitedShops) * 100 || 0
      })
    }
  }, [shops])

  if (loading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Visit Rate"
        value={`${stats.visitRate.toFixed(1)}%`}
        description={`${stats.visitedShops} of ${stats.totalShops} shops`}
      />
      <StatCard
        title="Leads Generated"
        value={stats.leadsGenerated.toString()}
        description="Potential opportunities"
      />
      <StatCard
        title="Conversion Rate"
        value={`${stats.conversionRate.toFixed(1)}%`}
        description="Visits to leads"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/bulk-actions.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
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
import { 
  MoreHorizontal, 
  Trash2, 
  Mail, 
  Share2, 
  Download,
  Edit,
  Star,
  UserCheck,
  Shield,
  Tag,
  Calendar,
  RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CoffeeShop } from "@prisma/client"
import { EmailDialog } from "../email/email-dialog"

interface BulkActionsProps {
  selectedIds: string[]
  onDeleteSelected: () => Promise<void>
  onUpdateSelected?: (field: keyof CoffeeShop, value: any) => Promise<void>
  onExportSelected?: () => Promise<void>
  disabled?: boolean
  selectedCount?: number
  selectedShops: CoffeeShop[]
}

export function BulkActions({
  selectedIds,
  onDeleteSelected,
  onUpdateSelected,
  onExportSelected,
  disabled = false,
  selectedCount = 0,
  selectedShops = []
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await onDeleteSelected()
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailClick = () => {
    console.group('Bulk Actions - Email Click')
    console.log('Selected IDs:', selectedIds)
    console.log('Selected Shops:', selectedShops)
    console.log('Shops with emails:', selectedShops.filter(shop => shop?.contact_email))
    console.log('Email addresses:', selectedShops.map(shop => shop?.contact_email).filter(Boolean))
    console.groupEnd()
    setShowEmailDialog(true)
  }

  const shopsWithEmailCount = selectedShops.filter(shop => shop?.contact_email).length

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={selectedIds.length === 0 || disabled}
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Bulk Actions
            {selectedIds.length > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2"
              >
                {selectedIds.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Visit Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              Visit Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('visited', true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Visited
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('visited', false)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Not Visited
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Partner Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="h-4 w-4 mr-2" />
              Partner Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('isPartner', true)}
              >
                Mark as Partner
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('isPartner', false)}
              >
                Mark as Not Partner
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Lead Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Tag className="h-4 w-4 mr-2" />
              Lead Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => 
                  onUpdateSelected?.('parlor_coffee_leads', true)
                }
              >
                Mark as Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => 
                  onUpdateSelected?.('parlor_coffee_leads', false)
                }
              >
                Remove Lead Status
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Priority */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Star className="h-4 w-4 mr-2" />
              Set Priority
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {[1, 2, 3, 4, 5].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => onUpdateSelected?.('priority', priority)}
                >
                  {Array(priority)
                    .fill('★')
                    .join('')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleEmailClick}>
            <Mail className="h-4 w-4 mr-2" />
            Email Selected
            <span className="ml-2 text-xs text-muted-foreground">
              ({shopsWithEmailCount} with email)
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => alert('Share feature coming soon')}>
            <Share2 className="h-4 w-4 mr-2" />
            Share List
          </DropdownMenuItem>

          {onExportSelected && (
            <DropdownMenuItem onClick={onExportSelected}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog */}
      {showEmailDialog && (
        <EmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          selectedShops={selectedShops}
        />
      )}
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/coffee-shops-table.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { CoffeeShop } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { TableFilters } from "./table-filters"
import { TableHeader as CustomTableHeader } from "./table-header"
import { TableRow as CustomTableRow } from "./table-row"
import { TablePagination } from "./table-pagination"
import { BulkActions } from "./bulk-actions"
import { MobileCardView } from "./mobile-card-view"
import { VisitReport } from "./visit-reports"
import { TableExport } from "./table-export"

const ITEMS_PER_PAGE = 50;

interface CoffeeShopsTableProps {
  shops: CoffeeShop[]
}

export function CoffeeShopsTable({ shops }: CoffeeShopsTableProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState([])
  const [savedFilters, setSavedFilters] = useState([])
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CoffeeShop | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc'
  })

  // Load saved filters on mount
  useEffect(() => {
    const fetchSavedFilters = async () => {
      try {
        const response = await fetch('/api/coffee-shops/filters')
        if (!response.ok) throw new Error('Failed to fetch saved filters')
        const data = await response.json()
        setSavedFilters(data)

        const defaultFilter = data.find(filter => filter.isDefault)
        if (defaultFilter && activeFilters.length === 0) {
          setActiveFilters(defaultFilter.filters)
        }
      } catch (error) {
        console.error('Error fetching saved filters:', error)
      }
    }

    fetchSavedFilters()
  }, [])

  const handleSort = useCallback((key: keyof CoffeeShop) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const handleUpdate = useCallback(async (shop: CoffeeShop, field: keyof CoffeeShop, value: any) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })

      if (!response.ok) throw new Error('Failed to update shop')

      toast({
        title: "Success",
        description: "Coffee shop updated successfully"
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coffee shop",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/coffee-shops/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete shop')

      toast({
        title: "Success",
        description: "Coffee shop deleted successfully"
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coffee shop",
        variant: "destructive"
      })
    }
  }, [toast])

  const filteredShops = shops.filter(shop => {
    if (searchTerm && !shop.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return !activeFilters.some(filter => {
      const value = shop[filter.field]
      switch (filter.operator) {
        case 'equals':
          return value !== filter.value
        case 'contains':
          return !String(value).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'greaterThan':
          return Number(value) <= Number(filter.value)
        case 'lessThan':
          return Number(value) >= Number(filter.value)
        case 'between':
          return Number(value) < Number(filter.value.min) || Number(value) > Number(filter.value.max)
        default:
          return false
      }
    })
  })

  const sortedShops = [...filteredShops].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    // Special handling for date fields
    if (['first_visit', 'second_visit', 'third_visit'].includes(sortConfig.key)) {
      // Handle null/undefined values - always put them at the bottom
      if (!aVal && !bVal) return 0
      if (!aVal) return 1  // Move a to the bottom
      if (!bVal) return -1 // Move b to the bottom

      // Compare actual dates
      const aDate = new Date(aVal).getTime()
      const bDate = new Date(bVal).getTime()

      // Handle invalid dates
      if (isNaN(aDate)) return 1
      if (isNaN(bDate)) return -1

      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
    }

    // Handle numeric fields
    if (['volume', 'rating', 'reviews', 'followers', 'priority'].includes(sortConfig.key)) {
      const aNum = Number(aVal)
      const bNum = Number(bVal)

      // Handle NaN values
      if (isNaN(aNum) && isNaN(bNum)) return 0
      if (isNaN(aNum)) return 1
      if (isNaN(bNum)) return -1

      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
    }

    // Default string comparison
    const aStr = String(aVal || '').toLowerCase()
    const bStr = String(bVal || '').toLowerCase()
    
    if (aStr === bStr) return 0
    if (!aVal) return 1  // Move empty values to the bottom
    if (!bVal) return -1

    const compareResult = aStr > bStr ? 1 : -1
    return sortConfig.direction === 'asc' ? compareResult : -compareResult
  })

  // Apply pagination after sorting
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilters={activeFilters}
          onAddFilter={(filter) => setActiveFilters([...activeFilters, filter])}
          onRemoveFilter={(id) => setActiveFilters(activeFilters.filter(f => f.id !== id))}
          onClearFilters={() => setActiveFilters([])}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <BulkActions
            selectedIds={selectedIds}
            onMailSelected={() => {/* Implement mail action */}}
            onDeleteSelected={async () => {
              await Promise.all(selectedIds.map(handleDelete))
              setSelectedIds([])
            }}
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <VisitReport />
          <TableExport data={shops} />
        </div>
      </div>

      <div className="block md:hidden">
        <div className="space-y-2">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p>Showing {paginatedShops.length} of {sortedShops.length} shops</p>
            {selectedIds.length > 0 && (
              <p className="text-muted-foreground">
                {selectedIds.length} selected
              </p>
            )}
          </div>
          
          <MobileCardView 
            shops={paginatedShops}
            onVisitToggle={async (shop) => {
              await handleUpdate(shop, 'visited', !shop.visited)
            }}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      </div>

      <div className="hidden md:block border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <CustomTableHeader 
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedAll={selectedIds.length === paginatedShops.length}
                onSelectAll={(checked) => {
                  setSelectedIds(
                    checked 
                      ? paginatedShops.map(shop => shop.id)
                      : []
                  )
                }}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedShops.map((shop) => (
              <CustomTableRow
                key={shop.id}
                shop={shop}
                isSelected={selectedIds.includes(shop.id)}
                onSelect={(checked) => {
                  setSelectedIds(prev => 
                    checked 
                      ? [...prev, shop.id]
                      : prev.filter(id => id !== shop.id)
                  )
                }}
                onUpdate={(field, value) => handleUpdate(shop, field, value)}
                onDelete={() => handleDelete(shop.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="overflow-x-auto">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={sortedShops.length}
        />
      </div>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/date-cell.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format, isValid } from "date-fns"
import { 
  CalendarIcon, 
  X, 
  Check, 
  Calendar as CalendarIcon2,
  Loader2 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface DateCellProps {
  date: Date | null
  onUpdate: (date: Date | null) => Promise<void>
  onRemove?: () => Promise<void>
  disabled?: boolean
  className?: string
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
  description?: string
  label?: string
}

export function DateCell({
  date,
  onUpdate,
  onRemove,
  disabled = false,
  className,
  showTime = false,
  minDate,
  maxDate,
  description,
  label
}: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const handleSelect = async (newDate: Date | undefined) => {
    if (!newDate || !isValid(newDate)) return

    try {
      setIsUpdating(true)
      await onUpdate(newDate)
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Date updated successfully"
      })
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
    if (!onRemove) return

    try {
      setIsUpdating(true)
      await onRemove()
      setShowConfirmDialog(false)
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Date removed successfully"
      })
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

  const formattedDate = date ? format(date, "MM-dd-yyyy") : null
  
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={date ? "outline" : "ghost"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled || isUpdating}
          >
            <div className="flex items-center gap-2">
              {formattedDate ?? "Not set"}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-3">
            {label && (
              <div className="font-medium">{label}</div>
            )}
            {description && (
              <div className="text-sm text-muted-foreground">
                {description}
              </div>
            )}
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={handleSelect}
              disabled={disabled || isUpdating || (date => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              })}
              initialFocus
            />
            {onRemove && date && (
              <div className="border-t pt-3">
                <Button
                  variant="destructive"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={disabled || isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Date
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirm Remove Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Date</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this date? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Helper function to format distance to now 
function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/delivery-cell.tsx
"use client"

import { CoffeeShop } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DELIVERY_FREQUENCIES } from "@/types/delivery"

interface DeliveryCellProps {
  shop: CoffeeShop
  onUpdate: (field: keyof CoffeeShop, value: any) => Promise<void>
  disabled?: boolean
}

export function DeliveryCell({ shop, onUpdate, disabled }: DeliveryCellProps) {
  return (
    <Select
      value={shop.delivery_frequency || undefined}
      onValueChange={(value) => onUpdate("delivery_frequency", value)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Select frequency" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DELIVERY_FREQUENCIES).map(([key, value]) => (
          <SelectItem key={key} value={value}>
            {key.replace(/_/g, ' ').toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/editable-cell.tsx
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
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/filter-configs.ts
// src/components/coffee-shops/table/filter-configs.ts

import { CoffeeShop } from "@prisma/client"

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'
export type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'volume' | 'priority' | 'email' | 'instagram' | 'phone' | 'stage'
export const DELIVERY_FREQUENCY_LABELS = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  THREE_WEEKS: "Every 3 weeks",
  FOUR_WEEKS: "Every 4 weeks",
  FIVE_WEEKS: "Every 5 weeks",
  SIX_WEEKS: "Every 6 weeks"
} as const

export interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterDataType
  operators: FilterOperator[]
  placeholder?: string
  help?: string
}

export const FILTER_CONFIGS: FilterConfig[] = [
  {
    field: 'title',
    label: 'Name',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter shop name...'
  },
  {
    field: 'area',
    label: 'Area',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter area...'
  },
  {
    field: 'address',
    label: 'Address',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: 'Enter address...'
  },
  {
    field: 'priority',
    label: 'Priority',
    type: 'priority',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter priority (1-5)...',
    help: 'Priority ranges from 1 to 5'
  },
  {
    field: 'isPartner',
    label: 'Partner Status',
    type: 'boolean',
    operators: ['equals'],
  },
  {
    field: "stage",
    label: "Stage",
    type: "stage",
    operators: ["equals"],
    options: [
      { value: "PROSPECTING", label: "Prospecting" },
      { value: "QUALIFICATION", label: "Qualification" },
      { value: "MEETING", label: "Meeting" },
      { value: "PROPOSAL", label: "Proposal" },
      { value: "NEGOTIATION", label: "Negotiation" },
      { value: "PAUSED", label: "Paused" },
      { value: "WON", label: "Won" },
      { value: "LOST", label: "Lost" }
    ]
  },
  {
    field: 'manager_present',
    label: 'Manager',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: "Enter manager's name..."
  },
  {
    field: 'contact_name',
    label: 'Contact Name',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: "Enter contact's name..."
  },
  {
    field: 'contact_email',
    label: 'Contact Email',
    type: 'email',
    operators: ['contains', 'equals'],
    placeholder: 'Enter email address...'
  },
  {
    field: 'volume',
    label: 'Volume',
    type: 'volume',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter weekly volume...',
    help: 'Weekly volume in units'
  },
  {
    field: 'delivery_frequency',
    label: 'Delivery Frequency',
    type: 'select',
    operators: ['equals'],
    options: Object.entries(DELIVERY_FREQUENCY_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  },
  {
    field: 'first_delivery_week',
    label: 'First Delivery Week',
    type:  'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter week number...'
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
    field: 'visited',
    label: 'Visit Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'rating',
    label: 'Rating',
    type: 'rating',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter rating (1-5)...',
    help: 'Rating ranges from 1 to 5'
  },
  {
    field: 'reviews',
    label: 'Reviews',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter number of reviews...'
  },
  {
    field: 'instagram',
    label: 'Instagram',
    type: 'instagram',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter Instagram handle...'
  },
  {
    field: 'followers',
    label: 'Followers',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter number of followers...'
  },
  {
    field: 'parlor_coffee_leads',
    label: 'Lead Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'notes',
    label: 'Notes',
    type: 'text',
    operators: ['contains'],
    placeholder: 'Search in notes...'
  }
]

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  contains: 'Contains',
  greaterThan: 'Greater than',
  lessThan: 'Less than',
  between: 'Between',
  startsWith: 'Starts with'
}

export const FILTER_TYPE_CONFIGS = {
  text: {
    component: 'Input',
    props: {
      type: 'text'
    }
  },
  number: {
    component: 'Input',
    props: {
      type: 'number'
    }
  },
  boolean: {
    component: 'Select',
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]
  },
  date: {
    component: 'DatePicker'
  },
  rating: {
    component: 'Input',
    props: {
      type: 'number',
      min: 1,
      max: 5
    }
  },
  volume: {
    component: 'Input',
    props: {
      type: 'number',
      min: 0
    }
  },
  priority: {
    component: 'Input',
    props: {
      type: 'number',
      min: 1,
      max: 5
    }
  },
  email: {
    component: 'Input',
    props: {
      type: 'email'
    }
  },
  instagram: {
    component: 'Input',
    props: {
      type: 'text'
    }
  },
  phone: {
    component: 'Input',
    props: {
      type: 'tel'
    }
  }
} as const

// Helper functions for filter validation
export const validateFilterValue = (type: FilterDataType, value: any): boolean => {
  switch (type) {
    case 'rating':
    case 'priority':
      const num = Number(value)
      return !isNaN(num) && num >= 1 && num <= 5
    case 'volume':
    case 'number':
      return !isNaN(Number(value))
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'date':
      return !isNaN(Date.parse(value))
    default:
      return true
  }
}

export const formatFilterValue = (type: FilterDataType, value: any): any => {
  switch (type) {
    case 'rating':
    case 'priority':
    case 'volume':
    case 'number':
      return Number(value)
    case 'date':
      return new Date(value).toISOString()
    case 'boolean':
      return value === 'true'
    default:
      return value
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/filter-value-input.tsx
// src/components/coffee-shops/table/filter-value-input.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { 
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger, 
 SelectValue 
} from "@/components/ui/select"
import {
 Popover,
 PopoverContent,
 PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { FilterDataType } from "./filter-configs"

interface FilterValueInputProps {
 type: FilterDataType
 operator: string
 value: any
 onChange: (value: any) => void
 className?: string
 disabled?: boolean
 placeholder?: string
}

export function FilterValueInput({
 type,
 operator,
 value,
 onChange,
 className,
 disabled,
 placeholder
}: FilterValueInputProps) {
 const [isOpen, setIsOpen] = useState(false)

 if (type === 'boolean') {
   return (
     <Select
       value={String(value)}
       onValueChange={(val) => onChange(val === 'true')}
       disabled={disabled}
     >
       <SelectTrigger>
         <SelectValue placeholder="Select..." />
       </SelectTrigger>
       <SelectContent>
         <SelectItem value="true">Yes</SelectItem>
         <SelectItem value="false">No</SelectItem>
       </SelectContent>
     </Select>
   )
 }

 if (type === 'date') {
   if (operator === 'between') {
     return (
       <div className="space-y-2">
         <div className="flex items-center gap-2">
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className={cn(
                   "justify-start text-left font-normal",
                   !value?.min && "text-muted-foreground"
                 )}
                 disabled={disabled}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {value?.min ? format(value.min, "PPP") : "Start date"}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0">
               <Calendar
                 mode="single"
                 selected={value?.min}
                 onSelect={(date) => 
                   onChange({ ...value, min: date })
                 }
                 disabled={disabled}
                 initialFocus
               />
             </PopoverContent>
           </Popover>
           <span>to</span>
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className={cn(
                   "justify-start text-left font-normal",
                   !value?.max && "text-muted-foreground"
                 )}
                 disabled={disabled}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {value?.max ? format(value.max, "PPP") : "End date"}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0">
               <Calendar
                 mode="single"
                 selected={value?.max}
                 onSelect={(date) => 
                   onChange({ ...value, max: date })
                 }
                 disabled={(date) => 
                   value?.min ? date < value.min : false
                 }
                 initialFocus
               />
             </PopoverContent>
           </Popover>
         </div>
       </div>
     )
   }

   return (
     <Popover open={isOpen} onOpenChange={setIsOpen}>
       <PopoverTrigger asChild>
         <Button
           variant="outline"
           className={cn(
             "justify-start text-left font-normal",
             !value && "text-muted-foreground"
           )}
           disabled={disabled}
         >
           <CalendarIcon className="mr-2 h-4 w-4" />
           {value ? format(value, "PPP") : "Pick a date"}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-auto p-0">
         <Calendar
           mode="single"
           selected={value}
           onSelect={(date) => {
             onChange(date)
             setIsOpen(false)
           }}
           disabled={disabled}
           initialFocus
         />
       </PopoverContent>
     </Popover>
   )
 }

 if (operator === 'between') {
   return (
     <div className="space-y-2">
       <div>
         <Label>From</Label>
         <Input
           type={type === 'number' || type === 'volume' ? 'number' : 'text'}
           value={value?.min || ''}
           onChange={(e) => onChange({ ...value, min: e.target.value })}
           className={className}
           disabled={disabled}
           placeholder={placeholder}
         />
       </div>
       <div>
         <Label>To</Label>
         <Input
           type={type === 'number' || type === 'volume' ? 'number' : 'text'}
           value={value?.max || ''}
           onChange={(e) => onChange({ ...value, max: e.target.value })}
           className={className}
           disabled={disabled}
           placeholder={placeholder}
         />
       </div>
     </div>
   )
 }

 // Default text/number input
 return (
   <Input
     type={type === 'number' || type === 'volume' ? 'number' : 'text'}
     value={value || ''}
     onChange={(e) => onChange(e.target.value)}
     className={className}
     disabled={disabled}
     placeholder={placeholder}
   />
 )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/index.tsx
export { CoffeeShopsTable } from './coffee-shops-table';
export { TableHeader } from './table-header';
export { TableRow } from './table-row';
export { TablePagination } from './table-pagination';
export { TableFilters } from './table-filters';
export { BulkActions } from './bulk-actions';
export { SortHeader } from './sort-header';
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/mobile-card-view.tsx
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
import Link from "next/link";

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
           <Link 
             href={`/dashboard/coffee-shops/${shop.id}`}
             className="hover:underline cursor-pointer"
           >
             <CardTitle>{shop.title}</CardTitle>
           </Link>
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
               <DropdownMenuItem asChild>
                 <Link 
                   href={`/dashboard/coffee-shops/${shop.id}`}
                   className="cursor-pointer"
                 >
                   <Edit className="mr-2 h-4 w-4" />
                   View Details
                 </Link>
               </DropdownMenuItem>
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
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/priority-calculator-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Calculator, Loader2 } from "lucide-react"

interface PriorityCalculatorButtonProps {
  onCalculated?: () => void
  disabled?: boolean
}

export function PriorityCalculatorButton({ 
  onCalculated, 
  disabled = false 
}: PriorityCalculatorButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coffee-shops/priority', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to recalculate priorities')

      const data = await response.json()
      toast({
        title: "Success",
        description: "Shop priorities have been recalculated"
      })

      if (onCalculated) {
        onCalculated()
      }
    } catch (error) {
      console.error('Error calculating priorities:', error)
      toast({
        title: "Error",
        description: "Failed to recalculate priorities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="gap-2" 
      onClick={handleCalculate}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calculator className="h-4 w-4" />
      )}
      {loading ? "Calculating..." : "Recalculate Priorities"}
    </Button>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/sort-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { CoffeeShop } from "@prisma/client"

interface SortHeaderProps {
  label: string
  sortKey: keyof CoffeeShop
  currentSort: {
    key: keyof CoffeeShop | null
    direction: 'asc' | 'desc'
  }
  onSort: (key: keyof CoffeeShop) => void
}

export function SortHeader({ 
  label,
  sortKey, 
  currentSort,
  onSort 
}: SortHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {label}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
      >
        {currentSort.key === sortKey ? (
          currentSort.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
        )}
      </Button>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/stage-cell.tsx
"use client"

import { Stage } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const STAGE_CONFIG = {
  PROSPECTING: { 
    label: "Prospecting", 
    className: "bg-gray-500 text-white hover:bg-gray-600" 
  },
  QUALIFICATION: { 
    label: "Qualification", 
    className: "bg-yellow-500 text-white hover:bg-yellow-600"
  },
  MEETING: { 
    label: "Meeting", 
    className: "bg-blue-500 text-white hover:bg-blue-600"
  },
  PROPOSAL: { 
    label: "Proposal", 
    className: "bg-purple-500 text-white hover:bg-purple-600"
  },
  NEGOTIATION: { 
    label: "Negotiation", 
    className: "bg-orange-500 text-white hover:bg-orange-600"
  },
  PAUSED: { 
    label: "Paused", 
    className: "bg-slate-500 text-white hover:bg-slate-600"
  },
  WON: { 
    label: "Won", 
    className: "bg-green-500 text-white hover:bg-green-600"
  },
  LOST: { 
    label: "Lost", 
    className: "bg-red-500 text-white hover:bg-red-600"
  }
} as const

interface StageCellProps {
  stage: Stage
  onUpdate: (stage: Stage) => Promise<void>
  disabled?: boolean
}

export function StageCell({ stage, onUpdate, disabled }: StageCellProps) {
  const config = STAGE_CONFIG[stage]

  if (!config) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full text-xs font-semibold",
            config.className
          )}
          disabled={disabled}
        >
          {config.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(STAGE_CONFIG).map(([stageKey, { label, className }]) => (
          <DropdownMenuItem
            key={stageKey}
            onClick={() => onUpdate(stageKey as Stage)}
            disabled={disabled || stageKey === stage}
          >
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              className
            )}>
              {label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/star-rating.tsx
"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onUpdate: (value: number) => void
  className?: string
  disabled?: boolean
}

export function StarRating({ 
  value, 
  onUpdate, 
  className,
  disabled 
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  return (
    <div 
      className={cn(
        "flex items-center gap-1", 
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            (hoverValue || value) >= star 
              ? "fill-yellow-500 text-yellow-500" 
              : "text-muted-foreground hover:text-yellow-500",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => {
            if (!disabled) {
              onUpdate(star)
            }
          }}
          onMouseEnter={() => {
            if (!disabled) {
              setHoverValue(star)
            }
          }}
          onMouseLeave={() => {
            if (!disabled) {
              setHoverValue(null)
            }
          }}
        />
      ))}
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-export.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileDown, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';
import { CoffeeShop } from "@prisma/client";

interface TableExportProps {
  data: CoffeeShop[];
}

// Define available columns and their labels
const AVAILABLE_COLUMNS = [
  { key: 'title', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'area', label: 'Area' },
  { key: 'website', label: 'Website' },
  { key: 'manager_present', label: 'Manager Present' },
  { key: 'contact_name', label: 'Contact Name' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'visited', label: 'Visited' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'followers', label: 'Followers' },
  { key: 'store_doors', label: 'Store Doors' },
  { key: 'volume', label: 'Volume' },
  { key: 'rating', label: 'Rating' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'price_type', label: 'Price Type' },
  { key: 'type', label: 'Type' },
  { key: 'types', label: 'Types' },
  { key: 'first_visit', label: 'First Visit' },
  { key: 'second_visit', label: 'Second Visit' },
  { key: 'third_visit', label: 'Third Visit' },
  { key: 'notes', label: 'Notes' },
  { key: 'priority', label: 'Priority' },
  { key: 'isPartner', label: 'Is Partner' },
  { key: 'stage', label: 'Stage' },
  { key: 'service_options', label: 'Service Options' },
  { key: 'hours', label: 'Hours' },
  { key: 'quality_score', label: 'Quality Score' },
  { key: 'parlor_coffee_leads', label: 'Parlor Coffee Leads' },
] as const;

export function TableExport({ data }: TableExportProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['title', 'address', 'area']);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(current => {
      const newSelection = new Set(current);
      if (newSelection.has(columnKey)) {
        newSelection.delete(columnKey);
      } else {
        newSelection.add(columnKey);
      }
      return Array.from(newSelection);
    });
  };

  const handleGenerateExport = () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one column to export",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format data for export
      const exportData = data.map(shop => {
        const row: Record<string, any> = {};
        selectedColumns.forEach(column => {
          let value = shop[column];
          
          // Format specific fields
          if (column === 'first_visit' || column === 'second_visit' || column === 'third_visit') {
            value = value ? new Date(value).toLocaleDateString() : '';
          } else if (column === 'types') {
            value = Array.isArray(value) ? value.join(', ') : '';
          } else if (column === 'isPartner' || column === 'visited' || column === 'parlor_coffee_leads') {
            value = value ? 'Yes' : 'No';
          } else if (column === 'service_options') {
            value = value ? JSON.stringify(value) : '';
          } else if (column === 'volume' && value) {
            const arr = ((parseFloat(value) * 52) * 18);
            row['ARR'] = arr ? `$${arr.toLocaleString()}` : '';
          }
          
          row[AVAILABLE_COLUMNS.find(col => col.key === column)?.label || column] = value || '';
        });
        return row;
      });

      // Generate CSV
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `coffee-shops-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "Table exported successfully"
      });
    } catch (error) {
      console.error('Error exporting table:', error);
      toast({
        title: "Error",
        description: "Failed to export table",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[150px] justify-between">
            <FileDown className="mr-2 h-4 w-4" />
            <span>Select Columns</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search columns..." />
            <CommandList>
              <CommandEmpty>No columns found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {AVAILABLE_COLUMNS.map((column) => (
                    <CommandItem
                      key={column.key}
                      onSelect={() => toggleColumn(column.key)}
                      className="flex items-center space-x-2 px-4 py-2 cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedColumns.includes(column.key)}
                        className="mr-2"
                        onCheckedChange={() => toggleColumn(column.key)}
                      />
                      <span>{column.label}</span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        onClick={handleGenerateExport}
        size="sm"
        disabled={selectedColumns.length === 0 || isLoading}
      >
        {isLoading ? (
          <>
            <Download className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export Table
          </>
        )}
      </Button>
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-filters.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search, Plus } from "lucide-react"
import { FILTER_CONFIGS, OPERATOR_LABELS } from "./filter-configs"
import { FilterValueInput } from "./filter-value-input"
import { useToast } from "@/components/ui/use-toast"
import { CoffeeShop } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { SavedFiltersMenu } from "./saved-filters/saved-filters-menu"
import { PriorityCalculatorButton } from "./priority-calculator-button"

interface TableFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  activeFilters: Array<{
    id: string
    field: keyof CoffeeShop
    operator: string
    value: any
    label: string
    type: string
  }>
  onAddFilter: (filter: any) => void
  onRemoveFilter: (id: string) => void
  onClearFilters: () => void
  onLoadSavedFilters?: (filters: any[]) => void
  filterConfigs?: typeof FILTER_CONFIGS
}

export function TableFilters({
  searchTerm,
  onSearchChange,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onLoadSavedFilters,
  filterConfigs = FILTER_CONFIGS
}: TableFiltersProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [tempFilterValue, setTempFilterValue] = useState<any>(null)
  const { toast } = useToast()

  const handleAddFilter = (field: keyof CoffeeShop, operator: string, type: string) => {
    if (!tempFilterValue) {
      toast({
        title: "Error",
        description: "Please enter a filter value",
        variant: "destructive"
      })
      return
    }

    const config = filterConfigs.find(c => c.field === field)
    if (!config) return

    const newFilter = {
      id: crypto.randomUUID(),
      field,
      operator,
      value: tempFilterValue,
      type,
      label: `${config.label} ${OPERATOR_LABELS[operator]} ${
        typeof tempFilterValue === 'object'
          ? `${tempFilterValue.min} - ${tempFilterValue.max}`
          : tempFilterValue
      }`
    }

    onAddFilter(newFilter)
    setTempFilterValue(null)
    setFilterMenuOpen(false)
  }

  const handleLoadSavedFilters = (filters: any[]) => {
    onClearFilters()
    filters.forEach(filter => onAddFilter(filter))
    if (onLoadSavedFilters) {
      onLoadSavedFilters(filters)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search and Filters Row */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coffee shops..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
              
              {filterConfigs.map((config) => (
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
                              operator={operator}
                              value={tempFilterValue}
                              onChange={setTempFilterValue}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddFilter(config.field, operator, config.type)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Filter
                              </Button>
                            </div>
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
                    className="text-red-600 focus:text-red-600"
                    onClick={onClearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Saved Filters Menu */}
          <SavedFiltersMenu
            activeFilters={activeFilters}
            onLoadFilter={handleLoadSavedFilters}
          />
                    <PriorityCalculatorButton onCalculated={() => {
    // Optionally trigger a refresh of the table data
    // if you have a refresh function, pass it here
  }} />
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="flex items-center gap-2 pl-2 pr-1 py-1"
              >
              <span>{filter.label}</span>
               <Button
                 variant="ghost"
                 size="sm"
                 className="h-5 w-5 p-0 hover:bg-transparent"
                 onClick={() => onRemoveFilter(filter.id)}
               >
                 <X className="h-3 w-3" />
               </Button>
             </Badge>
           ))}
           <Button
             variant="ghost"
             size="sm"
             className="text-muted-foreground"
             onClick={onClearFilters}
           >
             Clear all
           </Button>
         </div>
       )}
     </div>
   </Card>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-header.tsx
"use client"

import { TableHead } from "@/components/ui/table"
import { SortHeader } from "./sort-header"
import { CoffeeShop } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"

interface TableHeaderProps {
  sortConfig: {
    key: keyof CoffeeShop | null
    direction: 'asc' | 'desc'
  }
  onSort: (key: keyof CoffeeShop) => void
  selectedAll?: boolean
  onSelectAll?: (checked: boolean) => void
}

export function TableHeader({ 
  sortConfig, 
  onSort,
  selectedAll,
  onSelectAll
}: TableHeaderProps) {
  return (
    <>
      <TableHead className="w-12">
        <Checkbox 
          checked={selectedAll}
          onCheckedChange={onSelectAll}
        />
      </TableHead>
      
      <TableHead>
        <SortHeader 
          label="Name"
          sortKey="title"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Website"
          sortKey="website"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Area"
          sortKey="area"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Address"
          sortKey="address"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Priority"
          sortKey="priority"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Partner Status</TableHead>
      <TableHead>
        <SortHeader 
          label="Stage"
          sortKey="stage"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>
      <TableHead>
        <SortHeader 
          label="Manager Present"
          sortKey="manager_present"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Contact Name"
          sortKey="contact_name"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Contact Email"
          sortKey="contact_email"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Owners"
          sortKey="owners"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Volume"
          sortKey="volume"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>


      <TableHead>
        <SortHeader 
          label="Delivery Frequency"
          sortKey="delivery_frequency"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="First Delivery"
          sortKey="first_delivery_week"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>ARR</TableHead>

      <TableHead>
        <SortHeader 
          label="First Visit"
          sortKey="first_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Second Visit"
          sortKey="second_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Third Visit"
          sortKey="third_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Status</TableHead>

      <TableHead>
        <SortHeader 
          label="Rating"
          sortKey="rating"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Reviews"
          sortKey="reviews"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Instagram"
          sortKey="instagram"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Followers"
          sortKey="followers"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Lead</TableHead>

      <TableHead>
        <SortHeader 
          label="Notes"
          sortKey="notes"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead className="w-[100px]">Actions</TableHead>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-pagination.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  totalItems: number
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing {Math.min(itemsPerPage * currentPage, totalItems)} of {totalItems} results
      </p>
      <div className="flex items-center justify-end gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-row.tsx
"use client"

import { useState } from "react"
import { TableCell, TableRow as UITableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Shield,
  Edit 
} from "lucide-react"
import Link from "next/link"
import { EditableCell } from "../editable-cell"
import { DateCell } from "./date-cell"
import { StarRating } from "./star-rating"
import { CoffeeShop } from "@prisma/client"
import { StageCell } from "./stage-cell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateARR } from "./utils"
import { DeliveryCell } from "./delivery-cell"

interface TableRowProps {
  shop: CoffeeShop
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onUpdate: (field: keyof CoffeeShop, value: any) => Promise<void>
  onDelete: () => void
}

export function TableRow({ 
  shop: initialShop, 
  isSelected, 
  onSelect,
  onUpdate,
  onDelete
}: TableRowProps) {
  const [loading, setLoading] = useState(false)
  const [shop, setShop] = useState(initialShop)

  const handleUpdate = async (field: keyof CoffeeShop, value: any) => {
    setLoading(true)
    try {
      // Validate delivery frequency
      if (field === 'delivery_frequency') {
        const validFrequencies = ["WEEKLY", "BIWEEKLY", "THREE_WEEKS", "FOUR_WEEKS", "FIVE_WEEKS", "SIX_WEEKS"];
        if (value && !validFrequencies.includes(value)) {
          toast({
            title: "Error",
            description: "Invalid delivery frequency",
            variant: "destructive"
          });
          return;
        }
      }
  
      // Validate first delivery week
      if (field === 'first_delivery_week') {
        const weekNum = parseInt(value);
        if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
          toast({
            title: "Error",
            description: "First delivery week must be between 1 and 53",
            variant: "destructive"
          });
          return;
        }
  
        // Ensure delivery frequency is set when setting first delivery week
        if (!shop.delivery_frequency) {
          // Update both fields together
          const updatedData = {
            first_delivery_week: weekNum,
            delivery_frequency: "WEEKLY" // Default to weekly
          };
  
          setShop(prev => ({
            ...prev,
            ...updatedData
          }));
  
          await onUpdate('first_delivery_week', weekNum);
          await onUpdate('delivery_frequency', "WEEKLY");
          
          toast({
            description: "Delivery schedule set to weekly by default"
          });
          
          return;
        }
      }
  
      // Optimistically update the local state
      setShop(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Make the API call
      await onUpdate(field, value);
  
      // Show success message for delivery-related updates
      if (field === 'delivery_frequency' || field === 'first_delivery_week') {
        toast({
          description: `${field.split('_').join(' ')} updated successfully`
        });
      }
  
    } catch (error) {
      // Revert on error
      setShop(prev => ({
        ...prev,
        [field]: initialShop[field]
      }));
  
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive"
      });
  
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return (
    <UITableRow>
      <TableCell>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelect}
          disabled={loading}
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
          value={shop.website}
          onUpdate={(value) => handleUpdate('website', value)}
          type="url"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.area}
          onUpdate={(value) => handleUpdate('area', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.address}
          onUpdate={(value) => handleUpdate('address', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2 group cursor-pointer">
          <StarRating
            value={shop.priority || 0}
            onUpdate={(value) => handleUpdate('priority', value)}
            className="group-hover:opacity-100"
            disabled={loading}
          />
        </div>
      </TableCell>

      <TableCell>
        <Badge 
          variant={shop.isPartner ? "success" : "secondary"}
          className="cursor-pointer"
          onClick={() => handleUpdate('isPartner', !shop.isPartner)}
        >
          {shop.isPartner ? (
            <><Shield className="h-4 w-4 mr-1" /> Partner</>
          ) : "Not Partner"}
        </Badge>
      </TableCell>
      <TableCell>
      <StageCell
        stage={shop.stage}
        onUpdate={(value) => handleUpdate('stage', value)}
        disabled={loading}
      />
    </TableCell>

      <TableCell>
        <EditableCell
          value={shop.manager_present}
          onUpdate={(value) => handleUpdate('manager_present', value)}
          type="manager"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.contact_name}
          onUpdate={(value) => handleUpdate('contact_name', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.contact_email}
          onUpdate={(value) => handleUpdate('contact_email', value)}
          type="email"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.owners.map(owner => `${owner.name} (${owner.email})`).join(', ') || null}
          onUpdate={async (value) => {
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
            
            await handleUpdate('owners', owners);
          }}
          type="owners"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell 
          value={shop.volume?.toString() || null}
          onUpdate={(value) => handleUpdate('volume', value)}
          type="volume"
          disabled={loading}
        />
      </TableCell>
      <TableCell>
        <DeliveryCell 
          shop={shop}
          onUpdate={handleUpdate}
          disabled={loading}
        />
      </TableCell>



      <TableCell>
        <EditableCell
          value={shop.first_delivery_week?.toString()}
          onUpdate={(value) => handleUpdate("first_delivery_week", value ? parseInt(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

    <TableCell>
      {shop.volume ? (
        <div className="text-sm">
          ${calculateARR(shop.volume, shop.delivery_frequency).toLocaleString()}
        </div>
      ) : "-"}
    </TableCell>

      <TableCell>
        <DateCell
          date={shop.first_visit ? new Date(shop.first_visit) : null}
          onUpdate={(date) => handleUpdate('first_visit', date)}
          onRemove={() => handleUpdate('first_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DateCell
          date={shop.second_visit ? new Date(shop.second_visit) : null}
          onUpdate={(date) => handleUpdate('second_visit', date)}
          onRemove={() => handleUpdate('second_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DateCell
          date={shop.third_visit ? new Date(shop.third_visit) : null}
          onUpdate={(date) => handleUpdate('third_visit', date)}
          onRemove={() => handleUpdate('third_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Badge
          variant={shop.visited ? "success" : "default"}
          className="cursor-pointer"
          onClick={() => handleUpdate('visited', !shop.visited)}
        >
          {shop.visited ? "Visited" : "Not Visited"}
        </Badge>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.rating?.toString()}
          onUpdate={(value) => handleUpdate('rating', value ? parseFloat(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.reviews?.toString()}
          onUpdate={(value) => handleUpdate('reviews', value ? parseFloat(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.instagram}
          onUpdate={(value) => handleUpdate('instagram', value)}
          type="instagram"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.followers?.toString()}
          onUpdate={(value) => handleUpdate('followers', value ? parseInt(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Badge
          variant={shop.parlor_coffee_leads ? "warning" : "default"}
          className="cursor-pointer"
          onClick={() => handleUpdate('parlor_coffee_leads', !shop.parlor_coffee_leads)}
        >
          {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
        </Badge>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.notes}
          onUpdate={(value) => handleUpdate('notes', value)}
          type="notes"
          disabled={loading}
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
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/coffee-shops/${shop.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={onDelete}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </UITableRow>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/types.ts
import { CoffeeShop } from "@prisma/client"

export type SortConfig = {
  key: keyof CoffeeShop | null
  direction: 'asc' | 'desc'
}

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

export type FilterType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'volume'
type DeliveryFrequency = 'WEEKLY' | 'BIWEEKLY';

export interface Filter {
  id: string
  field: keyof CoffeeShop
  operator: FilterOperator
  value: any
  type: FilterType
}

export interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterType
  operators: FilterOperator[]
}

export const STAGE_COLORS = {
  PROSPECTING: "blue",
  QUALIFICATION: "yellow",
  MEETING: "purple",
  PROPOSAL: "cyan",
  NEGOTIATION: "orange",
  PAUSED: "gray",
  WON: "green",
  LOST: "red"
} as const

export const STAGE_LABELS = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualification",
  MEETING: "Meeting",
  PROPOSAL: "Proposal", 
  NEGOTIATION: "Negotiation",
  PAUSED: "Paused",
  WON: "Won",
  LOST: "Lost"
} as const

export const DELIVERY_FREQUENCY = {
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  THREE_WEEKS: "THREE_WEEKS",
  FOUR_WEEKS: "FOUR_WEEKS",
  FIVE_WEEKS: "FIVE_WEEKS",
  SIX_WEEKS: "SIX_WEEKS"
} as const

export const DELIVERY_FREQUENCY_LABELS = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  THREE_WEEKS: "Every 3 weeks",
  FOUR_WEEKS: "Every 4 weeks",
  FIVE_WEEKS: "Every 5 weeks",
  SIX_WEEKS: "Every 6 weeks"
} as const


interface VolumeData {
  amount: number;
  frequency: DeliveryFrequency;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/utils.ts
// src/components/coffee-shops/table/utils.ts

import { CoffeeShop } from "@prisma/client"
import { SortConfig, Filter } from "./types"

/**
 * Sort shops based on sort configuration
 */
export function sortShops(shops: CoffeeShop[], sortConfig: SortConfig): CoffeeShop[] {
  if (!sortConfig.key) return shops

  return [...shops].sort((a, b) => {
    const aVal = a[sortConfig.key!]
    const bVal = b[sortConfig.key!]

    // Special handling for date fields with null values
    const dateFields = ['first_visit', 'second_visit', 'third_visit']
    if (dateFields.includes(sortConfig.key)) {
      // Move null/undefined values to the bottom regardless of sort direction
      if (!aVal && !bVal) return 0
      if (!aVal) return 1  // Move 'a' to the bottom
      if (!bVal) return -1 // Move 'b' to the bottom
      
      const aDate = new Date(aVal).getTime()
      const bDate = new Date(bVal).getTime()
      
      // Handle invalid dates
      if (isNaN(aDate)) return 1
      if (isNaN(bDate)) return -1
      
      return sortConfig.direction === 'asc'
        ? aDate - bDate
        : bDate - aDate
    }

 

    // Default string comparison
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    return sortConfig.direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })
}

// Rest of the utils.ts file remains the same...

/**
 * Search shops based on search term
 */
export function searchShops(shops: CoffeeShop[], searchTerm: string): CoffeeShop[] {
  if (!searchTerm) return shops

  const normalizedSearch = searchTerm.toLowerCase().trim()
  const searchFields: (keyof CoffeeShop)[] = [
    'title',
    'area',
    'address',
    'manager_present',
    'contact_name',
    'contact_email',
    'instagram',
    'notes'
  ]

  return shops.filter(shop => {
    // Search in main fields
    const mainFieldsMatch = searchFields.some(field => {
      const value = shop[field]
      return value && String(value).toLowerCase().includes(normalizedSearch)
    })

    if (mainFieldsMatch) return true

    // Search in owners
    const ownersMatch = shop.owners?.some(owner => 
      owner.name.toLowerCase().includes(normalizedSearch) ||
      owner.email.toLowerCase().includes(normalizedSearch)
    )

    return ownersMatch
  })
}

/**
 * Calculate ARR (Annual Recurring Revenue)
 */
export function calculateARR(volume: string | number | null, frequency: string | null): number {
  if (!volume) return 0
  const weeklyVolume = typeof volume === 'string' ? parseFloat(volume) : volume
  
  // Calculate number of deliveries per year based on frequency
  let deliveriesPerYear = 52; // Default to weekly
  switch (frequency) {
    case 'WEEKLY':
      deliveriesPerYear = 52;
      break;
    case 'BIWEEKLY':
      deliveriesPerYear = 26;
      break;
    case 'THREE_WEEKS':
      deliveriesPerYear = 17;
      break;
    case 'FOUR_WEEKS':
      deliveriesPerYear = 13;
      break;
    case 'FIVE_WEEKS':
      deliveriesPerYear = 10;
      break;
    case 'SIX_WEEKS':
      deliveriesPerYear = 9;
      break;
  }

  return (weeklyVolume * deliveriesPerYear) * 18;
}

/**
 * Format ARR for display
 */
export function formatARR(volume: string | number | null): string {
  const arr = calculateARR(volume)
  return arr ? `$${arr.toLocaleString()}` : '-'
}

/**
 * Parse owner string into owner objects
 */
export function parseOwners(ownerString: string): Array<{ name: string; email: string }> {
  if (!ownerString) return []

  return ownerString
    .split(',')
    .map(owner => {
      const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/)
      if (match) {
        return {
          name: match[1].trim(),
          email: match[2].trim()
        }
      }
      return null
    })
    .filter((owner): owner is { name: string; email: string } => owner !== null)
}

/**
 * Format owners for display
 */
export function formatOwners(owners: Array<{ name: string; email: string }>): string {
  return owners.map(owner => `${owner.name} (${owner.email})`).join(', ')
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/visit-reports.tsx
// src/components/coffee-shops/table/visit-report.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";
import { Download, Calendar as CalendarIcon, Loader2, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';

export function VisitReport() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        ...(endDate && { endDate: endDate.toISOString() })
      });

      const response = await fetch(`/api/coffee-shops/reports/visits?${params}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `visit-report-${format(startDate, 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "Report downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            disabled={(date) => startDate ? date < startDate : false}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button 
            onClick={handleGenerateReport}
            size="sm"
            disabled={!startDate || isLoading}
            className="min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Visits
              </>
            )}
          </Button>
        </HoverCardTrigger>
      </HoverCard>
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/saved-filters/index.ts
export * from './saved-filters-menu';
export * from './types';
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/saved-filters/saved-filters-menu.tsx
"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Filter, Save, Star, Trash2, BookMarked } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SavedFilter {
  id: string
  name: string
  filters: any[]
  isDefault: boolean
}

interface SavedFiltersMenuProps {
  activeFilters: any[]
  onLoadFilter: (filters: any[]) => void
  disabled?: boolean
}

export function SavedFiltersMenu({
  activeFilters,
  onLoadFilter,
  disabled = false
}: SavedFiltersMenuProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load saved filters
  useEffect(() => {
    const fetchSavedFilters = async () => {
      try {
        const response = await fetch('/api/coffee-shops/filters')
        if (!response.ok) throw new Error('Failed to fetch saved filters')
        const data = await response.json()
        setSavedFilters(data)
      } catch (error) {
        console.error('Error fetching saved filters:', error)
      }
    }

    fetchSavedFilters()
  }, [])

  // Load default filter if exists
  useEffect(() => {
    const defaultFilter = savedFilters.find(filter => filter.isDefault)
    if (defaultFilter && activeFilters.length === 0) {
      onLoadFilter(defaultFilter.filters)
    }
  }, [savedFilters, activeFilters.length, onLoadFilter])

  const handleSave = async () => {
    if (!saveName) {
      toast({
        title: "Error",
        description: "Please enter a name for your filter",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName,
          filters: activeFilters,
          isDefault
        })
      })

      if (!response.ok) throw new Error('Failed to save filter')

      const savedFilter = await response.json()
      setSavedFilters(prev => [savedFilter, ...prev])
      setShowSaveDialog(false)
      setSaveName("")
      setIsDefault(false)

      toast({
        title: "Success",
        description: "Filter saved successfully"
      })
    } catch (error) {
      console.error('Error saving filter:', error)
      toast({
        title: "Error",
        description: "Failed to save filter",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to delete filter')

      setSavedFilters(prev => prev.filter(filter => filter.id !== id))
      
      toast({
        title: "Success",
        description: "Filter deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting filter:', error)
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={disabled}>
            <BookMarked className="h-4 w-4" />
            Saved Filters
            {savedFilters.length > 0 && (
              <Badge variant="secondary">
                {savedFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
          
          {savedFilters.length > 0 ? (
            <>
              {savedFilters.map(filter => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => onLoadFilter(filter.filters)}
                >
                  <span className="flex-1">{filter.name}</span>
                  {filter.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 ml-2" />
                  )}
                  <Trash2
                    className="h-4 w-4 text-destructive ml-2 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(filter.id)
                    }}
                  />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : (
            <DropdownMenuItem disabled>
              No saved filters
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => setShowSaveDialog(true)}
            disabled={activeFilters.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Save your current filter configuration for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Filter Name</Label>
              <Input
                id="name"
                placeholder="Enter a name for your filter"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="default">Set as default filter</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Filter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/saved-filters/types.ts
export interface SavedFilter {
  id: string
  name: string
    filters: Filter[]
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Filter {
  id: string
  field: string
  operator: string
  value: any
  type: string
  label: string
}

export interface SavedFilterInput {
  name: string
  filters: Filter[]
  isDefault?: boolean
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { revalidatePath } from "next/cache"
import { Stage } from "@prisma/client"
import { isValidDeliveryFrequency } from "@/types/delivery"

// Helper function to calculate stage
function calculateStage(shop: { isPartner?: boolean; visited?: boolean }): Stage {
  if (shop.isPartner) return "WON"
  if (shop.visited) return "QUALIFICATION"
  return "PROSPECTING"
}

const DELIVERY_FREQUENCIES = [
  "WEEKLY",
  "BIWEEKLY",
  "THREE_WEEKS",
  "FOUR_WEEKS",
  "FIVE_WEEKS",
  "SIX_WEEKS"
] as const



function parseNumericFields(data: any) {
  return {
    ...data,
    followers: data.followers ? parseInt(data.followers) : null,
    volume: data.volume ? parseFloat(data.volume) : null,
    rating: data.rating ? parseFloat(data.rating) : null,
    reviews: data.reviews ? parseInt(data.reviews) : null,
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
    priority: data.priority ? parseInt(data.priority) : 0,
    first_delivery_week: data.first_delivery_week ? parseInt(data.first_delivery_week) : null
  }
}
// Helper function to clean company data
function cleanCompanyData(data: any) {
  if (!data.company_data) return null
  
  return {
    size: data.company_data.size || null,
    industry: data.company_data.industry || null,
    founded_in: data.company_data.founded_in || null,
    description: data.company_data.description || null,
    linkedin: data.company_data.linkedin || null
  }
}

export async function POST(request: Request) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 3. Get and validate coffee shop data
    const data = await request.json()
    
    // 4. Parse numeric values and clean data
    const parsedData = parseNumericFields(data)
    const companyData = cleanCompanyData(data)
    
    // Ensure visited is true if first_visit is set
    if (parsedData.first_visit) {
      parsedData.visited = true
    }
    
    // Calculate initial stage based on first visit
    const initialStage = parsedData.first_visit ? "QUALIFICATION" : calculateStage({
      isPartner: parsedData.isPartner,
      visited: parsedData.visited
    })

    // 5. Create the coffee shop with all necessary fields
    const coffeeShop = await prisma.coffeeShop.create({
      data: {
        title: parsedData.title,
        address: parsedData.address,
        website: parsedData.website || null,
        manager_present: parsedData.manager_present || null,
        contact_name: parsedData.contact_name || null,
        contact_email: parsedData.contact_email || null,
        phone: parsedData.phone || null,
        visited: parsedData.visited || false,
        instagram: parsedData.instagram || null,
        followers: parsedData.followers,
        store_doors: parsedData.store_doors || null,
        volume: parsedData.volume,
        rating: parsedData.rating,
        reviews: parsedData.reviews,
        price_type: parsedData.price_type || null,
        type: parsedData.type || null,
        types: parsedData.types || [],
        service_options: parsedData.service_options || null,
        hours: parsedData.hours || null,
        operating_hours: parsedData.operating_hours || null,
        latitude: parsedData.latitude,
        longitude: parsedData.longitude,
        area: parsedData.area || null,
        is_source: parsedData.is_source || false,
        parlor_coffee_leads: parsedData.parlor_coffee_leads || false,
        notes: parsedData.notes || null,
        priority: parsedData.priority || 0,
        stage: parsedData.stage || initialStage,
        userId: user.id,
        company_data: companyData,
        owners: parsedData.owners ? {
          create: parsedData.owners.map((owner: any) => ({
            name: owner.name,
            email: owner.email
          }))
        } : undefined,
        people: parsedData.people ? {
          create: parsedData.people.map((person: any) => ({
            ...person,
            userId: user.id
          }))
        } : undefined
      }
    })

    console.log("[COFFEE_SHOPS_POST] Created coffee shop:", coffeeShop)
    revalidatePath('/dashboard/coffee-shops')

    return NextResponse.json(coffeeShop, { status: 201 })

  } catch (error) {
    console.error("[COFFEE_SHOPS_POST] Error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to create coffee shop" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase()
    const area = searchParams.get('area')
    const isPartner = searchParams.get('isPartner') === 'true'
    const visited = searchParams.get('visited') === 'true'
    const stage = searchParams.get('stage') as Stage | null

    // Build where clause
    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { area: { contains: search, mode: 'insensitive' } },
          ]
        } : {},
        area ? { area: { equals: area } } : {},
        isPartner ? { isPartner: true } : {},
        visited ? { visited: true } : {},
        stage ? { stage: stage } : {},
      ]
    }

    const coffeeShops = await prisma.coffeeShop.findMany({
      where,
      include: {
        owners: true,
        people: true
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json(coffeeShops)
  } catch (error) {
    console.error("[COFFEE_SHOPS_GET] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, owners, people, domainEmails, ...updateData } = data

    // Validate delivery frequency if present
    if (updateData.delivery_frequency) {
      if (!isValidDeliveryFrequency(updateData.delivery_frequency)) {
        return NextResponse.json(
          { error: "Invalid delivery frequency" },
          { status: 400 }
        )
      }
    }

    // Validate first delivery week if present
    if (updateData.first_delivery_week !== undefined) {
      const weekNum = parseInt(updateData.first_delivery_week)
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
        return NextResponse.json(
          { error: "First delivery week must be between 1 and 53" },
          { status: 400 }
        )
      }
    }

    // Parse numeric values
    const parsedData = parseNumericFields(updateData)

    // Handle date fields
    if (parsedData.first_visit) parsedData.first_visit = new Date(parsedData.first_visit)
    if (parsedData.second_visit) parsedData.second_visit = new Date(parsedData.second_visit)
    if (parsedData.third_visit) parsedData.third_visit = new Date(parsedData.third_visit)

    // Handle domain search updates
    if (domainEmails) {
      parsedData.domainEmails = domainEmails
      parsedData.lastDomainSearch = new Date()
    }

    // Update stage if partner or visited status changes
    if (parsedData.isPartner !== undefined || parsedData.visited !== undefined) {
      const currentShop = await prisma.coffeeShop.findUnique({
        where: { id },
        select: { isPartner: true, visited: true }
      })

      if (currentShop) {
        parsedData.stage = calculateStage({
          isPartner: parsedData.isPartner ?? currentShop.isPartner,
          visited: parsedData.visited ?? currentShop.visited
        })
      }
    }

    // Ensure delivery frequency is set when first delivery week is set
    if (parsedData.first_delivery_week && !parsedData.delivery_frequency) {
      parsedData.delivery_frequency = "WEEKLY" // Default to weekly if not specified
    }

    // Log the update for debugging
    console.log("Updating shop with data:", {
      id,
      delivery_frequency: parsedData.delivery_frequency,
      first_delivery_week: parsedData.first_delivery_week
    })

    const updatedShop = await prisma.coffeeShop.update({
      where: { id },
      data: {
        ...parsedData,
        owners: owners ? {
          deleteMany: {},
          create: owners.map((owner: any) => ({
            name: owner.name,
            email: owner.email
          }))
        } : undefined,
        people: people ? {
          createMany: {
            data: people.map((person: any) => ({
              ...person,
              userId: session.user.id
            }))
          }
        } : undefined
      },
      include: {
        owners: true,
        people: true
      }
    })

    console.log("Shop updated successfully:", {
      id: updatedShop.id,
      delivery_frequency: updatedShop.delivery_frequency,
      first_delivery_week: updatedShop.first_delivery_week
    })

    revalidatePath('/dashboard/coffee-shops')
    revalidatePath(`/dashboard/coffee-shops/${id}`)

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH] Error:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id } = data

    if (!id) {
      return NextResponse.json(
        { error: "Missing coffee shop ID" },
        { status: 400 }
      )
    }

    // Delete related records in a transaction
    await prisma.$transaction([
      prisma.person.deleteMany({
        where: { coffeeShopId: id }
      }),
      prisma.owner.deleteMany({
        where: { coffeeShopId: id }
      }),
      prisma.coffeeShop.delete({
        where: { id }
      })
    ])

    revalidatePath('/dashboard/coffee-shops')

    return NextResponse.json(
      { message: "Coffee shop deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE] Error:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/filters/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

const filterSchema = z.object({
  id: z.string(),
  field: z.string(),
  operator: z.string(),
  value: z.any(),
  type: z.string(),
  label: z.string()
})

const savedFilterSchema = z.object({
  name: z.string().min(1, "Filter name is required"),
  filters: z.array(filterSchema),
  isDefault: z.boolean().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const savedFilters = await prisma.savedFilter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(savedFilters)
  } catch (error) {
    console.error("[SAVED_FILTERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch saved filters" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const json = await request.json()
    const { name, filters, isDefault } = savedFilterSchema.parse(json)

    // If setting as default, remove existing default
    if (isDefault) {
      await prisma.savedFilter.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    const savedFilter = await prisma.savedFilter.create({
      data: {
        name,
        filters,
        isDefault: isDefault || false,
        userId: user.id
      }
    })

    return NextResponse.json(savedFilter)
  } catch (error) {
    console.error("[SAVED_FILTERS_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to save filter" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json(
        { error: "Filter ID is required" },
        { status: 400 }
      )
    }

    await prisma.savedFilter.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Filter deleted successfully" })
  } catch (error) {
    console.error("[SAVED_FILTERS_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete filter" },
      { status: 500 }
    )
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/priority/route.ts
// src/app/api/coffee-shops/priority/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { 
  calculatePriority, 
  updateAllShopPriorities 
} from "@/lib/coffee-shops/priority-calculator"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check user role (optional, you might want to restrict to admins)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Trigger priority recalculation
    await updateAllShopPriorities()

    return NextResponse.json(
      { 
        message: "Priorities recalculated successfully",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PRIORITY_RECALCULATION] Error:", error)
    return NextResponse.json(
      { error: "Failed to recalculate priorities" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch current priority distribution
    const priorityDistribution = await prisma.coffeeShop.groupBy({
      by: ['priority'],
      _count: {
        id: true
      },
      orderBy: {
        priority: 'asc'
      }
    })

    return NextResponse.json(
      { 
        distribution: priorityDistribution,
        lastUpdated: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PRIORITY_DISTRIBUTION] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch priority distribution" },
      { status: 500 }
    )
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/[id]/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Missing shop ID", { status: 400 })
    }

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    // Handle date conversions
    const updateData = {
      ...body,
      // Only convert dates if they exist in the payload
      ...(body.first_visit && { first_visit: new Date(body.first_visit) }),
      ...(body.second_visit && { second_visit: new Date(body.second_visit) }),
      ...(body.third_visit && { third_visit: new Date(body.third_visit) }),
      // Update visited status if setting first visit
      ...(body.first_visit && { visited: true }),
      updatedAt: new Date()
    }

    const coffeeShop = await prisma.coffeeShop.update({
      where: {
        id: params.id
      },
      data: updateData
    })

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH]", error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.message,
          details: "Failed to update coffee shop"
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Missing shop ID", { status: 400 })
    }

    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: {
        id: params.id
      }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_GET]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Validate ID parameter
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: "Coffee shop ID is required" },
        { status: 400 }
      )
    }

    // 3. Delete associated people first
    await prisma.person.deleteMany({
      where: { coffeeShopId: id }
    })

    // 4. Delete the coffee shop
    await prisma.coffeeShop.delete({
      where: { id }
    })

    // 5. Return success response
    return NextResponse.json(
      { message: "Coffee shop deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE] Error:", error)
    
    return NextResponse.json(
      { error: "Failed to delete coffee shop" },
      { status: 500 }
    )
  }
}
 ________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/[id]/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const visits = await prisma.visit.findMany({
      where: {
        coffeeShopId: params.id
      },
      orderBy: {
        date: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const json = await request.json()

    // Get previous visits count for visitNumber
    const visitCount = await prisma.visit.count({
      where: { 
        coffeeShopId: params.id 
      }
    })

    const visit = await prisma.visit.create({
      data: {
        ...json,
        coffeeShopId: params.id,
        userId: session.user.id,
        visitNumber: visitCount + 1
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Update coffee shop's visited status
    await prisma.coffeeShop.update({
      where: { id: params.id },
      data: { visited: true }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISIT_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/email/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import nodemailer from "nodemailer"
import { z } from "zod"

const emailSchema = z.object({
  to: z.array(z.string().email()),
  subject: z.string(),
  body: z.string(),
  shopIds: z.array(z.string())
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const { to, subject, body, shopIds } = emailSchema.parse(json)

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      },
      secure: true
    })

    // Send emails
    await Promise.all(
      to.map(async (email) => {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject,
          html: body
        })
      })
    )

    // Log email activity
    await prisma.activity.createMany({
      data: shopIds.map((shopId) => ({
        type: "EMAIL_SENT",
        description: `Email sent: ${subject}`,
        userId: session.user.id,
        shopId,
        metadata: {
          recipients: to,
          subject,
          sentAt: new Date()
        }
      }))
    })

    return NextResponse.json({ 
      message: `Emails sent successfully to ${to.length} recipients`
    })
  } catch (error) {
    console.error("[EMAIL_SEND]", error)
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    )
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/reports/route.ts
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/reports/visits/route.ts
// src/app/api/coffee-shops/reports/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      )
    }

    const shops = await prisma.coffeeShop.findMany({
      where: {
        visited: true,
        first_visit: {
          gte: new Date(startDate),
          ...(endDate && { lte: new Date(endDate) })
        }
      },
      include: {
        visits: {
          where: {
            date: {
              gte: new Date(startDate),
              ...(endDate && { lte: new Date(endDate) })
            }
          }
        }
      },
      orderBy: {
        first_visit: 'desc'
      }
    })

    const shopsWithNotes = shops.map(shop => {
      const arr = shop.volume ? ((parseFloat(shop.volume) * 52) * 18) : 0
      
      let note = `First visited on ${new Date(shop.first_visit!).toLocaleDateString()}. `
      
      if (shop.manager_present) {
        note += `Manager ${shop.manager_present} present. `
      } else {
        note += 'No manager information. '
      }

      if (shop.volume) {
        note += `Weekly volume: ${shop.volume} units. `
      }

      if (arr > 0) {
        note += `Potential annual revenue: $${arr.toLocaleString()}.`
      }

      return {
        name: shop.title,
        address: shop.address,
        area: shop.area || '',
        website: shop.website || '',
        store_doors: shop.store_doors || '',
        manager_present: shop.manager_present || '',
        contact_name: shop.contact_name || '',
        contact_email: shop.contact_email || '',
        weeklyVolume: shop.volume || '',
        annualRevenue: arr > 0 ? `$${arr.toLocaleString()}` : '',
        visitDate: shop.first_visit ? new Date(shop.first_visit).toLocaleDateString() : '',
        stage: shop.stage || '',
        rating: shop.rating || '',
        notes: note
      }
    })

    return NextResponse.json(shopsWithNotes)
  } catch (error) {
    console.error("[VISIT_REPORT_GET]", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/prisma/analytics.prisma
model AnalyticsSnapshot {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  date          DateTime
  metrics       Json
  type          String   // UTILIZATION, LABOR_COST, COVERAGE
  filters       Json?
  createdAt     DateTime @default(now())
}

model Report {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  description   String?
  type          String
  filters       Json
  schedule      Json?    // For automated reports
  lastRun       DateTime?
  createdBy     String   @db.ObjectId
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Alert {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  type          String
  severity      String
  message       String
  metadata      Json?
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/prisma/schema.prisma
generator client {
 provider = "prisma-client-js"
}

datasource db {
 provider = "mongodb"
 url      = env("DATABASE_URL")
}

enum Stage {
  PROSPECTING
  QUALIFICATION
  MEETING
  PROPOSAL
  NEGOTIATION
  PAUSED
  WON
  LOST
}

model User {
  id            String       @id @default(auto()) @map("_id") @db.ObjectId
  email         String      @unique
  name          String?
  password      String
  role          Role        @default(USER)
  contacts      Contact[]
  bio           String?
  phoneNumber   String?
  preferences   Json?
  notifications Json?
  activities    Activity[]
  orders        Order[]
  quickNotes    QuickNote[]
  menuItems     MenuItem[]
  visits        Visit[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  qrCodes       QRCode[]
  folders       Folder[]
  coffeeShops   CoffeeShop[] // Add this line to complete the relation
  people        Person[]    // Add relation to Person model
  filterHistory   FilterHistory[]
  savedFilters    SavedFilter[]
  followUps        FollowUp[]

}


model SavedFilter {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  filters     Json
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FilterHistory {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  filters     Json
  results     Int
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}

model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  contactId   String   @db.ObjectId
  type        String
  description String
  metadata    Json?
  createdAt   DateTime @default(now())
  contact     Contact  @relation(fields: [contactId], references: [id])
}

model Contact {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName   String
  lastName    String
  email       String
  phone       String?
  company     String?
  notes       String?
  status      Status     @default(NEW)
  userId      String     @db.ObjectId
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities  Activity[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  shop        Shop?      @relation(fields: [shopId], references: [id])
  shopId      String?    @db.ObjectId
}

model Person {
  id                String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName         String?
  lastName          String?
  email             String
  phone             String?
  emailType         String?    // "professional" or "generic"
  verificationStatus String?   // "VALID", "INVALID", etc.
  lastVerifiedAt    DateTime?
  notes             String?
  userId            String     @db.ObjectId
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  coffeeShop        CoffeeShop @relation(fields: [coffeeShopId], references: [id])
  coffeeShopId      String     @db.ObjectId
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  company     String?

}


model MenuItem {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  category    String
  popular     Boolean     @default(false)
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  userId      String      @db.ObjectId
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
}

model Order {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber     Int
  customerName    String
  status          OrderStatus @default(PENDING)
  timestamp       DateTime    @default(now())
  total          Float
  isComplimentary Boolean     @default(false)
  queueTime      Float
  preparationTime Float?
  startTime      DateTime?
  customerEmail  String?
  customerPhone  String?
  leadInterest   Boolean?
  notes          String?
  items          OrderItem[]
  userId         String      @db.ObjectId
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model OrderItem {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
  menuItemId  String    @db.ObjectId
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String    @db.ObjectId
  quantity    Int
  price       Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model QuickNote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  content   String
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Folder {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  color     String?  @default("#94a3b8")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  qrCodes   QRCode[]
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QRCode {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  defaultUrl    String
  shortCode     String         @unique
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  userId        String         @db.ObjectId
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  folderId      String?        @db.ObjectId
  folder        Folder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
  deviceRules   DeviceRule[]
  scheduleRules ScheduleRule[]
  design        QRDesign?
  scans         Scan[]
}

model QRDesign {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  size                  Int      @default(300)
  backgroundColor       String   @default("#FFFFFF")
  foregroundColor       String   @default("#000000")
  logoImage            String?
  logoWidth            Int?
  logoHeight           Int?
  dotStyle             String    @default("squares")
  margin               Int       @default(20)
  errorCorrectionLevel String    @default("M")
  style                Json
  logoStyle            Json?
  imageRendering       String    @default("auto")
  qrCodeId             String    @unique @db.ObjectId
  qrCode               QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Scan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId    String   @db.ObjectId
  qrCode      QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  userAgent   String?
  ipAddress   String?
  location    String?
  device      String?
  browser     String?
  os          String?
  timestamp   DateTime @default(now())
}

model DeviceRule {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String   @db.ObjectId
  qrCode     QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  deviceType String
  browsers   String[]
  os         String[]
  targetUrl  String
  priority   Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ScheduleRule {
  id         String    @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String    @db.ObjectId
  qrCode     QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  startDate  DateTime
  endDate    DateTime?
  timeZone   String
  daysOfWeek Int[]
  startTime  String?
  endTime    String?
  targetUrl  String
  priority   Int
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Staff {
  id                String            @id @default(auto()) @map("_id") @db.ObjectId
  email             String            @unique
  name              String
  role              StaffRole         @default(BARISTA)
  certifications    String[]
  maxHoursPerWeek   Int               @default(40)
  hourlyRate        Float
  shifts           ShiftAssignment[]
  availability     Availability[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  shiftPreferences Json?
  maxShiftsPerWeek Int               @default(5)
  preferredShiftLength Int           @default(8)
  preferredDays    Int[]
  blackoutDates    DateTime[]
  timeOff          TimeOff[]
  emergencyContact String?
  address          String?
  preferredShifts  String[]
  maxHoursPerDay   Int               @default(8)
  notes            String?
}

model Shift {
  id            String            @id @default(auto()) @map("_id") @db.ObjectId
  type          ShiftType
  startTime     DateTime
  endTime       DateTime
  status        ShiftStatus       @default(DRAFT)
  notes         String?
  requiredRoles Json
  assignedStaff ShiftAssignment[]
  breaks        Break[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model ShiftAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  status    String   @default("SCHEDULED")
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Break {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  startTime DateTime
  duration  Int
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Availability {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  staffId   String   @db.ObjectId
  dayOfWeek Int
  startTime String
  endTime   String
  recurring Boolean  @default(true)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SchedulingRule {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId
  name                 String
  description          String?
  isActive             Boolean  @default(true)
  ruleType             RuleType @default(BASIC)
  minStaffPerShift     Int?
  maxStaffPerShift     Int?
  requireCertification Boolean  @default(false)
  requiredCertifications String[]
  minHoursBetweenShifts Int?
  maxWeeklyHours       Int?
  preferredDays        Int[]
  preferredHours       String[]
  roleRequirements     Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model TimeOff {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  staffId     String       @db.ObjectId
  staff       Staff        @relation(fields: [staffId], references: [id])
  startDate   DateTime
  endDate     DateTime
  type        TimeOffType
  status      TimeOffStatus @default(PENDING)
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}


model FollowUp {
  id              String       @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String       @db.ObjectId
  coffeeShop      CoffeeShop   @relation(fields: [coffeeShopId], references: [id])
  type            FollowUpType
  status          FollowUpStatus @default(PENDING)
  priority        Int          @default(3) // 1-5 scale
  dueDate         DateTime
  completedDate   DateTime?
  notes           String?
  contactMethod   String?      // email, text, visit, call
  contactDetails  String?      // phone number, email address
  assignedTo      String       @db.ObjectId
  user            User         @relation(fields: [assignedTo], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum FollowUpType {
  INITIAL_CONTACT
  SAMPLE_DELIVERY
  PROPOSAL_FOLLOW
  TEAM_MEETING
  CHECK_IN
  GENERAL
}

enum FollowUpStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RESCHEDULED
}


model CoffeeShop {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  title                 String
  address               String
  website               String?
  manager_present       String?
  contact_name          String?
  contact_email         String?
  phone                 String?
  visited               Boolean   @default(false)
  instagram            String?
  followers            Int?
  store_doors          String?
  volume               String?
  first_visit          DateTime?
  second_visit         DateTime?
  third_visit          DateTime?
  rating               Float?
  reviews              Int?
  price_type           String?
  type                 String?
  types                String[]
  service_options      Json?
  hours                String?
  operating_hours      Json?
  gps_coordinates      Json?
  latitude             Float
  longitude            Float
  area                 String?
  is_source            Boolean   @default(false)
  quality_score        Float?
  parlor_coffee_leads  Boolean   @default(false)
  visits               Visit[]
  userId               String?   @db.ObjectId
  user                 User?     @relation(fields: [userId], references: [id])
  owners               Owner[]
  notes                String?
  priority             Int       @default(0)
  isPartner            Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  priorityLastUpdated  DateTime?
  // Add these fields
  emails               Json?     // Stores array of discovered emails
  company_data         Json?     // Stores company enrichment data
  people               Person[]  // Relation to people discovered from emails
  stage     Stage     @default(PROSPECTING)
  delivery_frequency String? // Values: "WEEKLY", "BIWEEKLY", "THREE_WEEKS", "FOUR_WEEKS", "FIVE_WEEKS", "SIX_WEEKS"
  first_delivery_week Int?
  followUps         FollowUp[]
  lastFollowUp      DateTime?
  nextFollowUpDate  DateTime?
  followUpCount     Int         @default(0)
  relationshipStage String?     // INITIAL, SAMPLES_DELIVERED, PROPOSAL_SENT, etc.
  potential         Int?        // 1-5 scale
  interest          Int?        // 1-5 scale
  decisionMaker     String?     // Name of the decision maker
  decisionMakerRole String?     // Role of the decision maker
  communicationPreference String? // email, phone, in-person
  bestTimeToVisit   String?
  competitors       String[]    // Other coffee suppliers they work with
  budget           Float?      // Estimated monthly budget
  closingNotes     String?     // Notes about closing strategy
}



model Owner {
 id            String      @id @default(auto()) @map("_id") @db.ObjectId
 name          String
 email         String
 coffeeShopId  String      @db.ObjectId
 coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id], onDelete: Cascade)
 createdAt     DateTime    @default(now())
 updatedAt     DateTime    @updatedAt
}

model Visit {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  shopId        String    @db.ObjectId
  userId        String    @db.ObjectId
  visitNumber   Int
  date          DateTime
  managerPresent Boolean  @default(false)
  managerName   String?
  managerContact String?
  samplesDropped Boolean  @default(false)
  sampleDetails String?
  notes         String?
  nextVisitDate DateTime?
  photos        Photo[]   
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  shop          Shop      @relation(fields: [shopId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id])

}

model Photo {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  visitId   String   @db.ObjectId
  url       String
  caption   String?
  createdAt DateTime @default(now())
  visit     Visit    @relation(fields: [visitId], references: [id])
}

model Shop {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  address     String
  latitude    Float
  longitude   Float
  rating      Float?
  reviews     Int?
  website     String?
  phone       String?
  visited     Boolean   @default(false)
  visits      Visit[]
  contacts    Contact[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}

enum Status {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum StaffRole {
  BARISTA
  SOMMELIER
  MANAGER
  EXECUTIVE
}

enum ShiftType {
  COFFEE
  WINE
}

enum ShiftStatus {
  DRAFT
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum RuleType {
  BASIC
  ADVANCED
  CERTIFICATION
  TIME_CONSTRAINT
  ROLE_BASED
}

enum TimeOffType {
  VACATION
  SICK
  PERSONAL
  OTHER
}

enum TimeOffStatus {
  PENDING
  APPROVED
  REJECTED
}



________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { INITIAL_MENU_ITEMS } from '../src/constants/pos-data';

const prisma = new PrismaClient();

async function main() {
 console.log('Starting seeding...');

 // Seed menu items
 for (const item of INITIAL_MENU_ITEMS) {
   const existingItem = await prisma.menuItem.findFirst({
     where: {
       name: item.name,
     },
   });

   if (!existingItem) {
     await prisma.menuItem.create({
       data: item,
     });
     console.log(`Created menu item: ${item.name}`);
   } else {
     console.log(`Menu item already exists: ${item.name}`);
   }
 }

 console.log('Seeding finished.');
}

main()
 .catch((e) => {
   console.error(e);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });
________________________________________________________________________________
