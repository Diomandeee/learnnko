"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Star, DollarSign, MapPin } from "lucide-react"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { usePriorityStore } from "@/store/priority-store"
import { CoffeeShop } from "@prisma/client"

interface LocationSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LocationSearchDialog({
  open,
  onOpenChange
}: LocationSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { shops = [], loading } = useCoffeeShops()
  const { selectedShops, setSelectedShops } = usePriorityStore()

  // Filter shops based on search term
  const filteredShops = shops.filter(shop => {
    const alreadySelected = selectedShops.some(s => s.id === shop.id)
    if (alreadySelected) return false

    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      shop.title.toLowerCase().includes(searchLower) ||
      shop.address.toLowerCase().includes(searchLower) ||
      shop.area?.toLowerCase().includes(searchLower)
    )
  })

  const handleSelect = (shopId: string) => {
    setSelectedIds(prev =>
      prev.includes(shopId)
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    )
  }

  const handleAdd = () => {
    const shopsToAdd = shops.filter(shop => selectedIds.includes(shop.id))
    setSelectedShops([...selectedShops, ...shopsToAdd])
    onOpenChange(false)
    setSelectedIds([])
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Locations</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredShops.map(shop => (
              <div
                key={shop.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedIds.includes(shop.id)}
                  onCheckedChange={() => handleSelect(shop.id)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {shop.title}
                    </span>
                    {shop.isPartner && (
                      <Badge variant="success">Partner</Badge>
                    )}
                    {shop.parlor_coffee_leads && (
                      <Badge variant="warning">Lead</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{shop.address}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {shop.priority && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {shop.priority}
                      </Badge>
                    )}
                    {shop.volume && (
                      <Badge variant="outline" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        {shop.volume}/wk
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredShops.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? "Loading locations..." : "No locations found"}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.length === 0}
          >
            Add {selectedIds.length} Location{selectedIds.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
