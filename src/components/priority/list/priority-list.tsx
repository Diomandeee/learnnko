"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Star, Route, DollarSign, MapPin, X } from "lucide-react"
import { usePriorityStore } from "@/store/priority-store"
import { LocationSearchDialog } from "./location-search-dialog"

export function PriorityList() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { selectedShops, removeFromSelection } = usePriorityStore()

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Priority Locations</CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {selectedShops.map(shop => (
                <div
                  key={shop.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromSelection(shop.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <div className="font-medium">{shop.title}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {shop.area || shop.address}
                    </div>

                    <div className="flex items-center gap-2">
                      {shop.isPartner && (
                        <Badge variant="success">Partner</Badge>
                      )}
                      {shop.parlor_coffee_leads && (
                        <Badge variant="warning">Lead</Badge>
                      )}
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

              {selectedShops.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No locations selected
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <LocationSearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
