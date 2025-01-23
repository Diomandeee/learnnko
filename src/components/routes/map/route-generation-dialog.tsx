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
