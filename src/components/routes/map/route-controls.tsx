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
