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
