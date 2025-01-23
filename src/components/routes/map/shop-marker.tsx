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
