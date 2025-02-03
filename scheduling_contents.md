### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/coffee-shops/page.tsx
"use client"

import { useState, useEffect } from "react"
import { CoffeeShopsTable } from "@/components/coffee-shops/table"
import { CoffeeShop } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { CoffeeShopStats } from "@/components/coffee-shops/coffee-shop-stats"
import { PageContainer } from "@/components/layout/page-container"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"

export default function CoffeeShopsPage() {
  const [shops, setShops] = useState<CoffeeShop[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  
  useEffect(() => {
    async function fetchShops() {
      try {
        const response = await fetch('/api/coffee-shops')
        if (!response.ok) throw new Error('Failed to fetch shops')
        
        const data = await response.json()
        setShops(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load coffee shops",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [toast])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <PageContainer>

    <div>
      <div className="flex flex-col space-y-2 p-4 sm:p-6 lg:p-8">
        <CoffeeShopHeader />
      </div>

      <CoffeeShopStats  />
      <CoffeeShopsTable shops={shops} />
    </div>
    </PageContainer>

  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/coffee-shops/new/page.tsx
// src/app/dashboard/coffee-shops/new/page.tsx
import { Metadata } from "next"
import { NewCoffeeShopForm } from "@/components/coffee-shops/new-coffee-shop-form"
import { ClientOnly } from "@/components/providers/client-only"

export const metadata: Metadata = {
  title: "Add Coffee Shop | Milk Man CRM",
  description: "Add a new coffee shop to your network",
}

export default function NewCoffeeShopPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ClientOnly>
        <NewCoffeeShopForm />
      </ClientOnly>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/coffee-shops/[id]/page.tsx
import { CoffeeShopProfile } from "@/components/coffee-shops/coffee-shop-profile"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import { PageContainer } from "@/components/layout/page-container"

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

  return    <PageContainer>
  <CoffeeShopProfile shop={coffeeShop} />
</PageContainer>
}
________________________________________________________________________________
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
import RouteMap from "./route-map"
import { CoffeeShop } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
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
                        {getCurrentLocation()?.address}w
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
import { useEffect, useState, useCallback } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { NavigationPanel } from "./navigation-panel"
import { Car, Navigation, Badge, RefreshCw, ChevronLeft, ChevronRight, Map, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

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

export default function RouteMap({ sourceShop, nearbyShops, maxDistance, onRouteCalculated }) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null)
  const [shopMarkers, setShopMarkers] = useState<google.maps.Marker[]>([])
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [navigationMode, setNavigationMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([])
  const [transportMode, setTransportMode] = useState<'DRIVING' | 'WALKING'>('DRIVING')
  const [isAtDestination, setIsAtDestination] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [showUserLocation, setShowUserLocation] = useState(false)
  const { toast } = useToast()

  
  // Clean up function for markers and info windows
  const cleanupMarkers = useCallback(() => {
    shopMarkers.forEach(marker => marker.setMap(null))
    setShopMarkers([])
    infoWindows.forEach(window => window.close())
    setInfoWindows([])
    if (userMarker) {
      userMarker.setMap(null)
      setUserMarker(null)
    }
  }, [shopMarkers, infoWindows, userMarker])

  const addShopMarkers = useCallback((mapInstance: google.maps.Map) => {
    cleanupMarkers()
    
    const newMarkers = []
    const newInfoWindows = []

    // Source shop marker
    const sourceMarker = new window.google.maps.Marker({
      position: { lat: sourceShop.latitude, lng: sourceShop.longitude },
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

    const sourceInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-bold text-lg">${sourceShop.title}</h3>
          <p class="text-sm text-muted-foreground">${sourceShop.address || 'Starting Point'}</p>
        </div>
      `
    })

    sourceMarker.addListener('click', () => {
      infoWindows.forEach(window => window.close())
      sourceInfoWindow.open(mapInstance, sourceMarker)
    })

    newMarkers.push(sourceMarker)
    newInfoWindows.push(sourceInfoWindow)

    // Nearby shop markers
    nearbyShops.forEach((shop, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: shop.latitude, lng: shop.longitude },
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
        infoWindows.forEach(window => window.close())
        infoWindow.open(mapInstance, marker)
      })

      newMarkers.push(marker)
      newInfoWindows.push(infoWindow)
    })

    setShopMarkers(newMarkers)
    setInfoWindows(newInfoWindows)
  }, [sourceShop, nearbyShops, cleanupMarkers, infoWindows])

  const updateUserMarker = useCallback((position: google.maps.LatLngLiteral, mapInstance: google.maps.Map) => {
    if (!userMarker) {
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: "Your Location"
      })
      setUserMarker(marker)
    } else {
      userMarker.setPosition(position)
    }
  }, [userMarker])

  const startLocationTracking = useCallback(async (mapInstance: google.maps.Map) => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Error",
        description: "Geolocation is not supported in your browser.",
        variant: "destructive"
      })
      return
    }

    try {
      // Request location permission
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      if (permission.state === 'denied') {
        toast({
          title: "Permission Denied",
          description: "Please enable location access to use navigation features.",
          variant: "destructive"
        })
        return
      }

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          setUserLocation(userPos)
          setLocationEnabled(true)
          updateUserMarker(userPos, mapInstance)

          if (navigationMode) {
            mapInstance.panTo(userPos)
            mapInstance.setZoom(16)
          }

          // Start continuous tracking
          const id = navigator.geolocation.watchPosition(
            async (newPosition) => {
              const newPos = {
                lat: newPosition.coords.latitude,
                lng: newPosition.coords.longitude
              }

              setUserLocation(newPos)
              updateUserMarker(newPos, mapInstance)

              // Check distance to destination
              if (nearbyShops.length > 0 && currentStep < nearbyShops.length) {
                const nextDestination = nearbyShops[currentStep]
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(newPos.lat, newPos.lng),
                  new google.maps.LatLng(nextDestination.latitude, nextDestination.longitude)
                )

                if (distance < 50) {
                  setIsAtDestination(true)
                }
              }

              // Update map view in navigation mode
              if (navigationMode) {
                mapInstance.panTo(newPos)
              }

              // Recalculate route if needed
              if (routeSteps.length > 0) {
                const lastPos = userLocation
                if (lastPos) {
                  const movement = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(lastPos.lat, lastPos.lng),
                    new google.maps.LatLng(newPos.lat, newPos.lng)
                  )
                  if (movement > 50) {
                    await calculateRoute()
                  }
                }
              }
            },
            (error) => {
              console.error("Location tracking error:", error)
              toast({
                title: "Location Error",
                description: "Failed to track location.",
                variant: "destructive"
              })
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000
            }
          )

          setWatchId(id)
        },
        (error) => {
          console.error("Location error:", error)
          toast({
            title: "Location Error",
            description: "Failed to get your location.",
            variant: "destructive"
          })
        }
      )
    } catch (error) {
      console.error("Location initialization error:", error)
      toast({
        title: "Error",
        description: "Failed to initialize location tracking.",
        variant: "destructive"
      })
    }
  }, [navigationMode, nearbyShops, currentStep, userLocation, routeSteps.length, updateUserMarker])

  const stopLocationTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    if (userMarker) {
      userMarker.setMap(null)
      setUserMarker(null)
    }
    setLocationEnabled(false)
  }, [watchId, userMarker])

  const calculateRoute = useCallback(async () => {
    if (!directionsService || !directionsRenderer || nearbyShops.length === 0) return

    setIsCalculating(true)

    try {
      const waypoints = nearbyShops.map(shop => ({
        location: { lat: shop.latitude, lng: shop.longitude },
        stopover: true
      }))

      const origin = userLocation || { lat: sourceShop.latitude, lng: sourceShop.longitude }

      const request = {
        origin,
        destination: { lat: sourceShop.latitude, lng: sourceShop.longitude },
        waypoints,
        optimizeWaypoints: true,
        travelMode: transportMode === 'WALKING' ? 
          google.maps.TravelMode.WALKING : 
          google.maps.TravelMode.DRIVING,
      }

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === 'OK') resolve(result)
          else reject(new Error(`Directions failed: ${status}`))
        })
      })

      directionsRenderer.setDirections(result)

      let totalDuration = 0
      const allSteps: RouteStep[] = []
      
      result.routes[0].legs.forEach(leg => {
        totalDuration += leg.duration!.value
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

      const now = new Date()
      const arrivalTime = new Date(now.getTime() + (totalDuration * 1000))
      
      setEstimatedArrival(format(arrivalTime, 'h:mm a'))
      
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
  }, [directionsService, directionsRenderer, sourceShop, nearbyShops, transportMode, userLocation])

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

      // Update markers and route
      if (map) {
        addShopMarkers(map)
        await calculateRoute()
      }

      toast({
        title: "Success",
        description: "Location marked as visited.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive"
      })
    }
  }, [map, addShopMarkers, calculateRoute])

  const handleRefresh = useCallback(async () => {
    setIsCalculating(true)
    try {
      if (map) {
        addShopMarkers(map)
        await calculateRoute()
      }
      toast({
        title: "Map Refreshed",
        description: "Route and markers have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh map.",
        variant: "destructive"
      })
    } finally {
      setIsCalculating(false)
    }
  }, [map, addShopMarkers, calculateRoute])

  const handleNextLocation = useCallback(async () => {
    if (currentStep < nearbyShops.length - 1) {
      setCurrentStep(prev => prev + 1)
      setIsAtDestination(false)
      
      const nextLocation = nearbyShops[currentStep + 1]
      if (map) {
        map.panTo({ lat: nextLocation.latitude, lng: nextLocation.longitude })
        map.setZoom(16)
        await calculateRoute()
      }
    }
  }, [currentStep, nearbyShops, map, calculateRoute])

  const handlePreviousLocation = useCallback(async () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setIsAtDestination(false)
      
      const previousLocation = nearbyShops[currentStep - 1]
      if (map) {
        map.panTo({ lat: previousLocation.latitude, lng: previousLocation.longitude })
        map.setZoom(16)
        await calculateRoute()
      }
    }
  }, [currentStep, nearbyShops, map, calculateRoute])

  const generateGoogleMapsUrl = useCallback(() => {
    if (!nearbyShops.length) return null

    let url = 'https://www.google.com/maps/dir/?api=1'
    const startPoint = userLocation || { lat: sourceShop.latitude, lng: sourceShop.longitude }
    
    url += `&origin=${startPoint.lat},${startPoint.lng}`
    url += `&destination=${sourceShop.latitude},${sourceShop.longitude}`

    const waypoints = nearbyShops
      .map(shop => `${shop.latitude},${shop.longitude}`)
      .join('|')
    
    url += `&waypoints=${waypoints}`
    url += `&travelmode=${transportMode.toLowerCase()}`

    return url
  }, [sourceShop, nearbyShops, transportMode, userLocation])

  useEffect(() => {
    const loadGoogleMaps = () => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = () => {
        const mapInstance = new window.google.maps.Map(
          document.getElementById("route-map")!,
          {
            center: { lat: sourceShop.latitude, lng: sourceShop.longitude },
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

        addShopMarkers(mapInstance)
        startLocationTracking(mapInstance)
      }

      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }

    loadGoogleMaps()

    return () => {
      stopLocationTracking()
      cleanupMarkers()
      if (directionsRenderer) {
        directionsRenderer.setMap(null)
      }
    }
  }, [])

  return (
    <div className="flex flex-col space-y-4">
      {/* Controls Card - Full width on mobile */}
      <Card className="p-4 w-full">
  <div className="flex flex-col space-y-4">
    {/* Transport Mode Selection */}
    <div className="w-full">
      <RadioGroup
        defaultValue={transportMode}
        onValueChange={async (value) => {
          setTransportMode(value as 'DRIVING' | 'WALKING')
          if (routeSteps.length > 0) {
            await calculateRoute()
          }
        }}
        className="flex justify-center sm:justify-start gap-4"
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
    </div>

    {/* Primary Action Buttons */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowUserLocation(!showUserLocation)}
        className="w-full"
      >
        <User className="h-4 w-4 mr-2" />
        {showUserLocation ? "Hide" : "Show"} Location
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isCalculating}
        className="w-full"
      >
        <RefreshCw className={cn(
          "h-4 w-4 mr-2",
          isCalculating && "animate-spin"
        )} />
        Refresh
      </Button>

      {locationEnabled && !navigationMode && (
        <>
          <Button 
            onClick={calculateRoute} 
            disabled={isCalculating}
            className="w-full"
          >
            {isCalculating ? "Calculating..." : "Calculate"}
          </Button>
          
          {routeSteps.length > 0 && (
            <>
              <Button 
                onClick={() => {
                  setNavigationMode(true)
                  setCurrentStep(0)
                }}
                variant="secondary"
                className="w-full"
              >
                Start
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const url = generateGoogleMapsUrl()
                  if (url) window.open(url, '_blank')
                }}
                className="w-full"
              >
                Open Maps
              </Button>
            </>
          )}
        </>
      )}
    </div>

    {/* Navigation Controls - Only show when in navigation mode */}
    {navigationMode && (
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline"
          onClick={handlePreviousLocation}
          disabled={currentStep === 0}
          className="w-full"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={handleNextLocation}
          disabled={currentStep === nearbyShops.length - 1}
          className="w-full"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
        
        <Button 
          onClick={() => {
            setNavigationMode(false)
            setCurrentStep(0)
            setIsAtDestination(false)
          }}
          variant="outline"
          className="w-full"
        >
          Exit
        </Button>
      </div>
    )}
  </div>
</Card>
  
      {/* Main Content Grid - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container - Full width on mobile */}
        <div className="lg:col-span-2 space-y-4">
          <div
            id="route-map"
            className="h-[50vh] sm:h-[60vh] lg:h-[700px] w-full rounded-lg border bg-muted"
          />
        </div>
  
        {/* Side Panel - Full width on mobile */}
        <div className="lg:col-span-1">
          {navigationMode ? (
            <NavigationPanel
              currentLocation={nearbyShops[currentStep]}
              nextLocation={nearbyShops[currentStep + 1]}
              currentStep={currentStep}
              totalSteps={nearbyShops.length}
              routeSteps={routeSteps}
              transportMode={transportMode}
              onStepChange={async (newStep) => {
                setCurrentStep(newStep)
                setIsAtDestination(false)
                if (map && nearbyShops[newStep]) {
                  const targetLocation = nearbyShops[newStep]
                  map.panTo({ lat: targetLocation.latitude, lng: targetLocation.longitude })
                  map.setZoom(16)
                  await calculateRoute()
                }
              }}
              onLocationUpdate={async (updatedLocation) => {
                try {
                  const response = await fetch(`/api/coffee-shops/${updatedLocation.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedLocation)
                  })
  
                  if (!response.ok) throw new Error('Failed to update location')
  
                  toast({
                    title: "Success",
                    description: "Location information updated."
                  })
  
                  if (map) {
                    addShopMarkers(map)
                    await calculateRoute()
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to update location.",
                    variant: "destructive"
                  })
                }
              }}
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
              onPreviousLocation={handlePreviousLocation}
              onNextLocation={handleNextLocation}
              isAtDestination={isAtDestination}
              arrivalTime={estimatedArrival}
              timeRemaining={timeRemaining}
              className="h-[calc(50vh-4rem)] sm:h-auto overflow-y-auto"
            />
          ) : (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Visit Order</h3>
                  <span className="text-sm text-muted-foreground">
                    {nearbyShops.length} locations
                  </span>
                </div>
  
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">S</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{sourceShop.title}</p>
                    <p className="text-sm text-muted-foreground truncate">Starting Point</p>
                  </div>
                </div>
  
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {nearbyShops.map((shop, index) => (
                    <div
                      key={shop.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
          )}
        </div>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/route.ts
// app/api/coffee-shops/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    console.log("[COFFEE_SHOPS_POST] Session data:", {
      email: session?.user?.email,
      exists: !!session
    })

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // 2. Find user
    let user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log("[COFFEE_SHOPS_POST] Found user:", user)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 3. Get and validate coffee shop data
    const data = await request.json()
    console.log("[COFFEE_SHOPS_POST] Received data:", data)

    // 4. Clean up the company_data field
    const cleanCompanyData = data.company_data ? {
      size: data.company_data.size || null,
      industry: data.company_data.industry || null,
      founded_in: data.company_data.founded_in || null,
      description: data.company_data.description || null,
      linkedin: data.company_data.linkedin || null
    } : undefined

    // 5. Parse numeric values
    const parsedData = {
      ...data,
      followers: data.followers ? parseInt(data.followers) : null,
      volume: data.volume ? parseFloat(data.volume) : null,
      rating: data.rating ? parseFloat(data.rating) : null,
      reviews: data.reviews ? parseInt(data.reviews) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      priority: data.priority ? parseInt(data.priority) : null,
    }

    // 6. Create the coffee shop
    const coffeeShop = await prisma.coffeeShop.create({
      data: {
        title: parsedData.title,
        address: parsedData.address,
        website: parsedData.website || null,
        manager_present: parsedData.manager_present || null,
        contact_name: parsedData.contact_name || null,
        contact_email: parsedData.contact_email || null,
        phone: parsedData.phone || null,
        visited: false,
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
        priority: parsedData.priority,
        userId: user.id,
        company_data: cleanCompanyData,
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
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("[COFFEE_SHOPS_GET] Session:", session)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      }
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

    console.log(`Found ${coffeeShops.length} coffee shops`)
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

    // Handle numeric fields
    if (updateData.volume) updateData.volume = parseFloat(updateData.volume)
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating)
    if (updateData.reviews) updateData.reviews = parseInt(updateData.reviews)
    if (updateData.followers) updateData.followers = parseInt(updateData.followers)
    if (updateData.priority !== undefined) {
      updateData.priority = Math.max(0, Math.min(10, parseInt(updateData.priority)))
    }

    // Handle date fields
    if (updateData.first_visit) updateData.first_visit = new Date(updateData.first_visit)
    if (updateData.second_visit) updateData.second_visit = new Date(updateData.second_visit)
    if (updateData.third_visit) updateData.third_visit = new Date(updateData.third_visit)

    // Handle domain search updates
    if (domainEmails) {
      updateData.domainEmails = domainEmails
      updateData.lastDomainSearch = new Date()
    }

    const updatedShop = await prisma.coffeeShop.update({
      where: { id },
      data: {
        ...updateData,
        // Update owners if provided
        ...(owners && {
          owners: {
            deleteMany: {},
            create: owners.map((owner: { name: string; email: string }) => ({
              name: owner.name,
              email: owner.email
            }))
          }
        }),
        // Update people if provided
        ...(people && {
          people: {
            createMany: {
              data: people.map((person: any) => ({
                ...person,
                userId: session.user.id
              }))
            }
          }
        })
      },
      include: {
        owners: true,
        people: true
      }
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

    // Delete related records first
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
